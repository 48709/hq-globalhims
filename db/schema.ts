import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  json,
  boolean,
  bigint,
  date,
} from "drizzle-orm/mysql-core";

// ── Users (from auth, extended) ──
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── System Users (local accounts with roles) ──
export const systemUsers = mysqlTable("system_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  role: mysqlEnum("sys_role", [
    "admin",
    "hr_manager",
    "planner",
    "analyst",
    "viewer",
    "recruiter",
    "security_officer",
    "budget_officer",
  ]).notNull(),
  department: varchar("department", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  perms: json("perms").$type<string[]>(),
  tabPerms: json("tab_perms").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SystemUser = typeof systemUsers.$inferSelect;

// ── Security Audit Log ──
export const securityLogs = mysqlTable("security_logs", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  username: varchar("username", { length: 100 }),
  detail: text("detail"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Budget Records (quarterly) ──
export const budgetRecords = mysqlTable("budget_records", {
  id: serial("id").primaryKey(),
  quarter: mysqlEnum("quarter", ["q1", "q2", "q3", "q4"]).notNull(),
  fiscalYear: int("fiscal_year").notNull(),
  jobNumber: varchar("job_number", { length: 50 }),
  employeeName: varchar("employee_name", { length: 255 }),
  department: varchar("department", { length: 255 }),
  unit: varchar("unit", { length: 255 }),
  movementType: mysqlEnum("movement_type", [
    "appointment",
    "promotion",
    "transfer_internal",
    "transfer_external",
    "resignation",
    "termination",
  ]),
  monthlyCost: decimal("monthly_cost", { precision: 12, scale: 2 }).default("0"),
  yearlyCost: decimal("yearly_cost", { precision: 12, scale: 2 }).default("0"),
  movementDate: date("movement_date"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type BudgetRecord = typeof budgetRecords.$inferSelect;

// ── Planning Needs ──
export const planningNeeds = mysqlTable("planning_needs", {
  id: serial("id").primaryKey(),
  quarter: mysqlEnum("quarter", ["q1", "q2", "q3", "q4"]).notNull(),
  fiscalYear: int("fiscal_year").notNull(),
  code: varchar("code", { length: 50 }),
  jobTitle: varchar("job_title", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),
  neededCount: int("needed_count").default(0),
  currentCount: int("current_count").default(0),
  gapCount: int("gap_count").default(0),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium"),
  status: mysqlEnum("plan_status", ["pending", "approved", "rejected", "completed"]).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PlanningNeed = typeof planningNeeds.$inferSelect;

// ── Job Announcements ──
export const jobAnnouncements = mysqlTable("job_announcements", {
  id: serial("id").primaryKey(),
  announcementNumber: varchar("announcement_number", { length: 50 }),
  announcementDate: date("announcement_date"),
  jobTitles: text("job_titles"),
  jobCount: int("job_count").default(0),
  appointedCount: int("appointed_count").default(0),
  prevMonthlyCost: decimal("prev_monthly_cost", { precision: 12, scale: 2 }).default("0"),
  currentMonthlyCost: decimal("current_monthly_cost", { precision: 12, scale: 2 }).default("0"),
  prevYearlyCost: decimal("prev_yearly_cost", { precision: 12, scale: 2 }).default("0"),
  currentYearlyCost: decimal("current_yearly_cost", { precision: 12, scale: 2 }).default("0"),
  availableAmount: decimal("available_amount", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Doctors Registry ──
export const doctors = mysqlTable("doctors", {
  id: serial("id").primaryKey(),
  doctorNumber: varchar("doctor_number", { length: 50 }),
  jobTitle: varchar("job_title", { length: 255 }),
  specialty: varchar("specialty", { length: 255 }),
  qualification: varchar("qualification", { length: 255 }),
  facility: varchar("facility", { length: 255 }),
  nationality: varchar("nationality", { length: 100 }),
  appointmentDate: date("appointment_date"),
  status: mysqlEnum("doc_status", ["active", "on_leave", "terminated", "retired"]).default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Projects ──
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),
  status: mysqlEnum("proj_status", ["active", "pending", "completed", "cancelled"]).default("active"),
  budget: decimal("budget", { precision: 14, scale: 2 }).default("0"),
  spent: decimal("spent", { precision: 14, scale: 2 }).default("0"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  description: text("description"),
  managerName: varchar("manager_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Project = typeof projects.$inferSelect;

// ── Recruitment Applications ──
export const recruitmentApps = mysqlTable("recruitment_apps", {
  id: serial("id").primaryKey(),
  appNumber: varchar("app_number", { length: 100 }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  nationalId: varchar("national_id", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  position: varchar("position", { length: 255 }),
  department: varchar("department", { length: 255 }),
  qualification: varchar("qualification", { length: 255 }),
  status: mysqlEnum("app_status", [
    "draft",
    "applied",
    "shortlisted",
    "security_review",
    "security_approved",
    "security_rejected",
    "recruitment_review",
    "studies_review",
    "budget_review",
    "hr_review",
    "job_number_created",
    "appointed",
    "rejected",
    "closed",
  ]).default("applied"),
  notes: text("notes"),
  files: json("files").$type<string[]>(),
  currentStage: varchar("current_stage", { length: 100 }).default("security"),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type RecruitmentApp = typeof recruitmentApps.$inferSelect;

// ── Workflow Stages ──
export const workflowStages = mysqlTable("workflow_stages", {
  id: serial("id").primaryKey(),
  appId: bigint("app_id", { mode: "number", unsigned: true }).notNull(),
  stageName: varchar("stage_name", { length: 100 }).notNull(),
  stageLabel: varchar("stage_label", { length: 255 }),
  status: mysqlEnum("stage_status", ["pending", "in_progress", "approved", "rejected", "returned"]).default("pending"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Messages (SMS/Email log) ──
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  msgType: mysqlEnum("msg_type", ["sms", "email"]).notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body").notNull(),
  relatedAppId: bigint("related_app_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("msg_status", ["pending", "sent", "failed"]).default("sent"),
  sentBy: bigint("sent_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Announcements ──
export const announcements = mysqlTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: mysqlEnum("ann_priority", ["low", "medium", "high"]).default("medium"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Integration Links ──
export const integrationLinks = mysqlTable("integration_links", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
