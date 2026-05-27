export type Quarter = "q1" | "q2" | "q3" | "q4";

export type MovementType = "appointment" | "promotion" | "transfer_internal" | "transfer_external" | "resignation" | "termination";

export type Priority = "high" | "medium" | "low";

export type PlanStatus = "pending" | "approved" | "rejected" | "completed";

export type AppStatus =
  | "draft"
  | "applied"
  | "shortlisted"
  | "security_review"
  | "security_approved"
  | "security_rejected"
  | "recruitment_review"
  | "studies_review"
  | "budget_review"
  | "hr_review"
  | "job_number_created"
  | "appointed"
  | "rejected"
  | "closed";

export type ProjectStatus = "active" | "pending" | "completed" | "cancelled";

export type DocStatus = "active" | "on_leave" | "terminated" | "retired";

export type StageName = "security" | "recruitment" | "studies" | "budget" | "hr";

export const QUARTERS = [
  { id: "q1" as Quarter, label: "الربع الأول", months: "يناير - مارس" },
  { id: "q2" as Quarter, label: "الربع الثاني", months: "أبريل - يونيو" },
  { id: "q3" as Quarter, label: "الربع الثالث", months: "يوليو - سبتمبر" },
  { id: "q4" as Quarter, label: "الربع الرابع", months: "أكتوبر - ديسمبر" },
];

export const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  applied: "تم التقديم",
  shortlisted: "مرشح",
  security_review: "تحت مراجعة الأمن",
  security_approved: "معتمد أمنياً",
  security_rejected: "مرفوض أمنياً",
  recruitment_review: "مراجعة التعيينات",
  studies_review: "مراجعة الدراسات",
  budget_review: "مراجعة الموازنة",
  hr_review: "شؤون الموظفين",
  job_number_created: "تم إنشاء الرقم الوظيفي",
  appointed: "معين",
  rejected: "مرفوض",
  closed: "مغلق",
};

export const STAGE_LABELS: Record<string, string> = {
  security: "مكتب الأمن",
  recruitment: "قسم التعيينات",
  studies: "الدراسات والمعلومات",
  budget: "موازنة الوظائف",
  hr: "شؤون الموظفين",
};

export const STAGE_ORDER: StageName[] = ["security", "recruitment", "studies", "budget", "hr"];

export const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  hr_manager: "مدير الموارد البشرية",
  planner: "مدير التخطيط",
  analyst: "محلل بيانات",
  viewer: "مستخدم عرض",
  recruiter: "مسؤول التوظيف",
  security_officer: "ضابط أمن",
  budget_officer: "مسؤول الموازنة",
};

export const ALL_TABS = [
  { id: "dashboard", label: "لوحة التحكم", icon: "LayoutDashboard" },
  { id: "budget", label: "موازنة الوظائف", icon: "Wallet" },
  { id: "planning", label: "تخطيط الاحتياج", icon: "Target" },
  { id: "recruitment", label: "التوظيف", icon: "Users" },
  { id: "workflow", label: "مسار العمل", icon: "GitBranch" },
  { id: "doctors", label: "حصر الأطباء", icon: "Stethoscope" },
  { id: "projects", label: "المشاريع", icon: "FolderKanban" },
  { id: "announcements", label: "الإعلانات", icon: "Bell" },
  { id: "stats", label: "الإحصائيات", icon: "BarChart3" },
  { id: "users", label: "المستخدمين", icon: "Shield" },
  { id: "settings", label: "الإعدادات", icon: "Settings" },
  { id: "display", label: "شاشة العرض", icon: "Monitor" },
];
