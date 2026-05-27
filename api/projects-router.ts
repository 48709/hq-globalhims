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

import { projects } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const projectsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }),

  create: publicQuery
    .input(z.object({
      name: z.string(),
      department: z.string().optional(),
      status: z.enum(["active", "pending", "completed", "cancelled"]).optional(),
      budget: z.string().optional(),
      spent: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      managerName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(projects).values({
        name: input.name,
        department: input.department || null,
        status: input.status || "active",
        budget: input.budget || "0",
        spent: input.spent || "0",
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        description: input.description || null,
        managerName: input.managerName || null,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      department: z.string().optional(),
      status: z.enum(["active", "pending", "completed", "cancelled"]).optional(),
      budget: z.string().optional(),
      spent: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      managerName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined) updateData[k] = v; });
      await db.update(projects).set(updateData).where(eq(projects.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(projects);
    const totalBudget = all.reduce((s: number, p: typeof all[0]) => s + parseFloat(p.budget?.toString() || "0"), 0);
    const totalSpent = all.reduce((s: number, p: typeof all[0]) => s + parseFloat(p.spent?.toString() || "0"), 0);
    return { total: all.length, active: all.filter((p: typeof all[0]) => p.status === "active").length, totalBudget, totalSpent };
  }),
});
