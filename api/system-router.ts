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

import { systemUsers, securityLogs, announcements, integrationLinks } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { hashSync, compareSync } from "bcrypt-ts";

export const systemRouter = createRouter({
  // ── System Users ──
  userList: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(systemUsers).orderBy(desc(systemUsers.createdAt));
  }),

  userCreate: publicQuery
    .input(z.object({
      username: z.string(),
      password: z.string(),
      displayName: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      role: z.enum(["admin", "hr_manager", "planner", "analyst", "viewer", "recruiter", "security_officer", "budget_officer"]),
      department: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const passwordHash = hashSync(input.password, 10);
      const result = await db.insert(systemUsers).values({
        username: input.username,
        passwordHash,
        displayName: input.displayName,
        email: input.email || null,
        phone: input.phone || null,
        role: input.role,
        department: input.department || null,
        isActive: input.isActive ?? true,
        perms: ["read"],
        tabPerms: ["budget", "stats"],
      });
      return { id: Number(result[0].insertId) };
    }),

  userUpdate: publicQuery
    .input(z.object({
      id: z.number(),
      displayName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      role: z.enum(["admin", "hr_manager", "planner", "analyst", "viewer", "recruiter", "security_officer", "budget_officer"]).optional(),
      department: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(systemUsers).set(data).where(eq(systemUsers.id, id));
      return { success: true };
    }),

  userDelete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(systemUsers).where(eq(systemUsers.id, input.id));
      return { success: true };
    }),

  userLogin: publicQuery
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [user] = await db.select().from(systemUsers).where(eq(systemUsers.username, input.username));
      if (!user) throw new Error("Invalid credentials");
      if (!user.isActive) throw new Error("Account disabled");
      const valid = compareSync(input.password, user.passwordHash);
      if (!valid) throw new Error("Invalid credentials");
      return { 
        id: user.id, 
        username: user.username, 
        name: user.displayName, 
        role: user.role, 
        department: user.department,
        perms: user.perms as string[],
        tabPerms: user.tabPerms as string[],
      };
    }),

  // ── Security Logs ──
  logList: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt)).limit(200);
  }),

  logCreate: publicQuery
    .input(z.object({ eventType: z.string(), username: z.string().optional(), detail: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(securityLogs).values({
        eventType: input.eventType,
        username: input.username || null,
        detail: input.detail || null,
      });
      return { success: true };
    }),

  // ── Announcements ──
  announcementList: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }),

  announcementCreate: publicQuery
    .input(z.object({ title: z.string(), content: z.string(), priority: z.enum(["low", "medium", "high"]).optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(announcements).values({
        title: input.title,
        content: input.content,
        priority: input.priority || "medium",
      });
      return { id: Number(result[0].insertId) };
    }),

  announcementDelete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),

  // ── Integration Links ──
  integrationList: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(integrationLinks).orderBy(desc(integrationLinks.createdAt));
  }),

  integrationCreate: publicQuery
    .input(z.object({ name: z.string(), url: z.string(), category: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(integrationLinks).values({
        name: input.name,
        url: input.url,
        category: input.category || null,
        description: input.description || null,
      });
      return { id: Number(result[0].insertId) };
    }),

  integrationDelete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(integrationLinks).where(eq(integrationLinks.id, input.id));
      return { success: true };
    }),
});
