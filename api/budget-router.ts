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

import { budgetRecords } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const budgetRouter = createRouter({
  list: publicQuery
    .input(z.object({ quarter: z.enum(["q1", "q2", "q3", "q4"]).optional(), fiscalYear: z.number().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.quarter) conditions.push(eq(budgetRecords.quarter, input.quarter));
      if (input.fiscalYear) conditions.push(eq(budgetRecords.fiscalYear, input.fiscalYear));
      
      if (conditions.length === 0) {
        return await db.select().from(budgetRecords).orderBy(budgetRecords.createdAt);
      }
      return await db.select().from(budgetRecords).where(and(...conditions)).orderBy(budgetRecords.createdAt);
    }),

  create: publicQuery
    .input(z.object({
      quarter: z.enum(["q1", "q2", "q3", "q4"]),
      fiscalYear: z.number(),
      jobNumber: z.string().optional(),
      employeeName: z.string().optional(),
      department: z.string().optional(),
      unit: z.string().optional(),
      movementType: z.enum(["appointment", "promotion", "transfer_internal", "transfer_external", "resignation", "termination"]).optional(),
      monthlyCost: z.string().optional(),
      yearlyCost: z.string().optional(),
      movementDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(budgetRecords).values({
        quarter: input.quarter,
        fiscalYear: input.fiscalYear,
        jobNumber: input.jobNumber || null,
        employeeName: input.employeeName || null,
        department: input.department || null,
        unit: input.unit || null,
        movementType: input.movementType || null,
        monthlyCost: input.monthlyCost || "0",
        yearlyCost: input.yearlyCost || "0",
        movementDate: input.movementDate ? new Date(input.movementDate) : null,
        notes: input.notes || null,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      quarter: z.enum(["q1", "q2", "q3", "q4"]).optional(),
      fiscalYear: z.number().optional(),
      jobNumber: z.string().optional(),
      employeeName: z.string().optional(),
      department: z.string().optional(),
      unit: z.string().optional(),
      movementType: z.enum(["appointment", "promotion", "transfer_internal", "transfer_external", "resignation", "termination"]).optional(),
      monthlyCost: z.string().optional(),
      yearlyCost: z.string().optional(),
      movementDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      
      if (data.quarter) updateData.quarter = data.quarter;
      if (data.fiscalYear) updateData.fiscalYear = data.fiscalYear;
      if (data.jobNumber !== undefined) updateData.jobNumber = data.jobNumber || null;
      if (data.employeeName !== undefined) updateData.employeeName = data.employeeName || null;
      if (data.department !== undefined) updateData.department = data.department || null;
      if (data.unit !== undefined) updateData.unit = data.unit || null;
      if (data.movementType) updateData.movementType = data.movementType;
      if (data.monthlyCost) updateData.monthlyCost = data.monthlyCost;
      if (data.yearlyCost) updateData.yearlyCost = data.yearlyCost;
      if (data.movementDate) updateData.movementDate = new Date(data.movementDate);
      if (data.notes !== undefined) updateData.notes = data.notes || null;
      
      await db.update(budgetRecords).set(updateData).where(eq(budgetRecords.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(budgetRecords).where(eq(budgetRecords.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(budgetRecords);
    const totalMonthly = all.reduce((s: number, r: typeof all[0]) => s + parseFloat(r.monthlyCost?.toString() || "0"), 0);
    const totalYearly = all.reduce((s: number, r: typeof all[0]) => s + parseFloat(r.yearlyCost?.toString() || "0"), 0);
    const byQuarter = { q1: 0, q2: 0, q3: 0, q4: 0 };
    all.forEach((r: typeof all[0]) => { byQuarter[r.quarter as keyof typeof byQuarter] = (byQuarter[r.quarter as keyof typeof byQuarter] || 0) + 1; });
    return { totalRecords: all.length, totalMonthly, totalYearly, byQuarter };
  }),
});
