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

import { doctors } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const doctorsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(doctors).orderBy(desc(doctors.createdAt));
  }),

  create: publicQuery
    .input(z.object({
      doctorNumber: z.string().optional(),
      jobTitle: z.string().optional(),
      specialty: z.string().optional(),
      qualification: z.string().optional(),
      facility: z.string().optional(),
      nationality: z.string().optional(),
      appointmentDate: z.string().optional(),
      status: z.enum(["active", "on_leave", "terminated", "retired"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(doctors).values({
        doctorNumber: input.doctorNumber || null,
        jobTitle: input.jobTitle || null,
        specialty: input.specialty || null,
        qualification: input.qualification || null,
        facility: input.facility || null,
        nationality: input.nationality || null,
        appointmentDate: input.appointmentDate ? new Date(input.appointmentDate) : null,
        status: input.status || "active",
        notes: input.notes || null,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({ id: z.number(), ...z.object({
      doctorNumber: z.string().optional(),
      jobTitle: z.string().optional(),
      specialty: z.string().optional(),
      qualification: z.string().optional(),
      facility: z.string().optional(),
      nationality: z.string().optional(),
      appointmentDate: z.string().optional(),
      status: z.enum(["active", "on_leave", "terminated", "retired"]).optional(),
      notes: z.string().optional(),
    }).shape }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined) updateData[k] = v; });
      await db.update(doctors).set(updateData).where(eq(doctors.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(doctors).where(eq(doctors.id, input.id));
      return { success: true };
    }),
});
