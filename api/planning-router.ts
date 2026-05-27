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

import { planningNeeds } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const planningRouter = createRouter({
  list: publicQuery
    .input(z.object({ quarter: z.enum(["q1", "q2", "q3", "q4"]).optional(), fiscalYear: z.number().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.quarter) conditions.push(eq(planningNeeds.quarter, input.quarter));
      if (input.fiscalYear) conditions.push(eq(planningNeeds.fiscalYear, input.fiscalYear));
      
      if (conditions.length === 0) {
        return await db.select().from(planningNeeds).orderBy(planningNeeds.createdAt);
      }
      return await db.select().from(planningNeeds).where(and(...conditions)).orderBy(planningNeeds.createdAt);
    }),

  create: publicQuery
    .input(z.object({
      quarter: z.enum(["q1", "q2", "q3", "q4"]),
      fiscalYear: z.number(),
      code: z.string().optional(),
      jobTitle: z.string(),
      department: z.string().optional(),
      neededCount: z.number().optional(),
      currentCount: z.number().optional(),
      gapCount: z.number().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const needed = input.neededCount || 0;
      const current = input.currentCount || 0;
      const result = await db.insert(planningNeeds).values({
        quarter: input.quarter,
        fiscalYear: input.fiscalYear,
        code: input.code || null,
        jobTitle: input.jobTitle,
        department: input.department || null,
        neededCount: needed,
        currentCount: current,
        gapCount: needed - current,
        priority: input.priority || "medium",
        status: input.status || "pending",
        notes: input.notes || null,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      quarter: z.enum(["q1", "q2", "q3", "q4"]).optional(),
      fiscalYear: z.number().optional(),
      code: z.string().optional(),
      jobTitle: z.string().optional(),
      department: z.string().optional(),
      neededCount: z.number().optional(),
      currentCount: z.number().optional(),
      gapCount: z.number().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(planningNeeds).set(data).where(eq(planningNeeds.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(planningNeeds).where(eq(planningNeeds.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(planningNeeds);
    const totalNeeded = all.reduce((s: number, r: typeof all[0]) => s + (r.neededCount || 0), 0);
    const totalCurrent = all.reduce((s: number, r: typeof all[0]) => s + (r.currentCount || 0), 0);
    const totalGap = all.reduce((s: number, r: typeof all[0]) => s + (r.gapCount || 0), 0);
    const highPriority = all.filter((r: typeof all[0]) => r.priority === "high").length;
    return { totalNeeds: all.length, totalNeeded, totalCurrent, totalGap, highPriority };
  }),
});
