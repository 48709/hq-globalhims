import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { drizzle } from "drizzle-orm/mysql2";
import { env } from "./lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };
let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
export function getDb() {
  if (!instance) instance = drizzle(env.databaseUrl, { mode: "planetscale", schema: fullSchema });
  return instance;
}

import { recruitmentApps, workflowStages, messages } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const recruitmentRouter = createRouter({
  list: publicQuery
    .input(z.object({
      status: z.string().optional(),
      stage: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const all = await db.select().from(recruitmentApps).orderBy(desc(recruitmentApps.createdAt));
      if (!input) return all;
      
      return all.filter((app: typeof all[0]) => {
        if (input.status && app.status !== input.status) return false;
        if (input.stage && app.currentStage !== input.stage) return false;
        if (input.search) {
          const q = input.search.toLowerCase();
          return (app.fullName?.toLowerCase().includes(q) || 
                  app.nationalId?.includes(q) ||
                  app.position?.toLowerCase().includes(q));
        }
        return true;
      });
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [app] = await db.select().from(recruitmentApps).where(eq(recruitmentApps.id, input.id));
      const stages = await db.select().from(workflowStages).where(eq(workflowStages.appId, input.id)).orderBy(workflowStages.createdAt);
      return { app, stages };
    }),

  create: publicQuery
    .input(z.object({
      fullName: z.string(),
      nationalId: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      position: z.string().optional(),
      department: z.string().optional(),
      qualification: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const appNum = `APP-${Date.now()}`;
      const result = await db.insert(recruitmentApps).values({
        appNumber: appNum,
        fullName: input.fullName,
        nationalId: input.nationalId || null,
        phone: input.phone || null,
        email: input.email || null,
        position: input.position || null,
        department: input.department || null,
        qualification: input.qualification || null,
        notes: input.notes || null,
        status: "applied",
        currentStage: "security",
      });
      const appId = Number(result[0].insertId);
      
      // Create workflow stages
      const stages = [
        { stageName: "security", stageLabel: "مكتب الأمن", status: "in_progress" as const },
        { stageName: "recruitment", stageLabel: "قسم التعيينات", status: "pending" as const },
        { stageName: "studies", stageLabel: "الدراسات والمعلومات", status: "pending" as const },
        { stageName: "budget", stageLabel: "موازنة الوظائف", status: "pending" as const },
        { stageName: "hr", stageLabel: "شؤون الموظفين", status: "pending" as const },
      ];
      
      for (const s of stages) {
        await db.insert(workflowStages).values({ appId, ...s });
      }
      
      return { id: appId, appNumber: appNum };
    }),

  updateStatus: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.string(),
      stage: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(recruitmentApps).set(data as Partial<typeof recruitmentApps.$inferSelect>).where(eq(recruitmentApps.id, id));
      return { success: true };
    }),

  advanceStage: publicQuery
    .input(z.object({ id: z.number(), stage: z.string(), decision: z.enum(["approve", "reject", "return"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [app] = await db.select().from(recruitmentApps).where(eq(recruitmentApps.id, input.id));
      if (!app) throw new Error("Application not found");

      const stageOrder = ["security", "recruitment", "studies", "budget", "hr"];
      const statusMap: Record<string, string> = {
        security: "security_review",
        recruitment: "recruitment_review",
        studies: "studies_review",
        budget: "budget_review",
        hr: "hr_review",
      };

      if (input.decision === "approve") {
        const currentIdx = stageOrder.indexOf(input.stage);
        const nextStage = stageOrder[currentIdx + 1];
        
        // Mark current stage as approved
        const [ws] = await db.select().from(workflowStages)
          .where(and(eq(workflowStages.appId, input.id), eq(workflowStages.stageName, input.stage)));
        if (ws) {
          await db.update(workflowStages).set({ status: "approved", completedAt: new Date() })
            .where(eq(workflowStages.id, ws.id));
        }

        if (nextStage) {
          // Activate next stage
          const [nextWs] = await db.select().from(workflowStages)
            .where(and(eq(workflowStages.appId, input.id), eq(workflowStages.stageName, nextStage)));
          if (nextWs) {
            await db.update(workflowStages).set({ status: "in_progress" })
              .where(eq(workflowStages.id, nextWs.id));
          }
          await db.update(recruitmentApps)
            .set({ currentStage: nextStage, status: (statusMap[nextStage] || app.status) as typeof app.status })
            .where(eq(recruitmentApps.id, input.id));
        } else {
          await db.update(recruitmentApps)
            .set({ status: "appointed" as typeof app.status, currentStage: "completed" })
            .where(eq(recruitmentApps.id, input.id));
        }
      } else if (input.decision === "reject") {
        const [ws] = await db.select().from(workflowStages)
          .where(and(eq(workflowStages.appId, input.id), eq(workflowStages.stageName, input.stage)));
        if (ws) {
          await db.update(workflowStages).set({ status: "rejected", completedAt: new Date() })
            .where(eq(workflowStages.id, ws.id));
        }
        await db.update(recruitmentApps)
          .set({ status: "rejected" })
          .where(eq(recruitmentApps.id, input.id));
      }
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(workflowStages).where(eq(workflowStages.appId, input.id));
      await db.delete(recruitmentApps).where(eq(recruitmentApps.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(recruitmentApps);
    const total = all.length;
    const appointed = all.filter((a: typeof all[0]) => a.status === "appointed" || a.status === "job_number_created").length;
    const pending = all.filter((a: typeof all[0]) => !["appointed", "closed", "rejected", "security_rejected"].includes(a.status || "")).length;
    const rejected = all.filter((a: typeof all[0]) => ["rejected", "security_rejected"].includes(a.status || "")).length;
    return { total, appointed, pending, rejected };
  }),

  sendMessage: publicQuery
    .input(z.object({
      appId: z.number(),
      type: z.enum(["sms", "email"]),
      recipient: z.string(),
      subject: z.string().optional(),
      body: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(messages).values({
        msgType: input.type,
        recipient: input.recipient,
        subject: input.subject || null,
        body: input.body,
        relatedAppId: input.appId,
        status: "sent",
      });
      return { success: true };
    }),

  getMessages: publicQuery
    .input(z.object({ appId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.appId) {
        return await db.select().from(messages).where(eq(messages.relatedAppId, input.appId)).orderBy(desc(messages.createdAt));
      }
      return await db.select().from(messages).orderBy(desc(messages.createdAt));
    }),
});
