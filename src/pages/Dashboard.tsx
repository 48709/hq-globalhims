import { useLocalAuth } from "@/hooks/useLocalAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, Target, Users, FolderKanban, BarChart3,
  TrendingUp, AlertTriangle, CheckCircle
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  hr_manager: "مدير الموارد البشرية",
  planner: "مدير التخطيط",
  analyst: "محلل بيانات",
  viewer: "مستخدم عرض",
  recruiter: "مسؤول التوظيف",
  security_officer: "ضابط أمن",
  budget_officer: "مسؤول الموازنة",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  hr_manager: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  planner: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  analyst: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  viewer: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  recruiter: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  security_officer: "bg-red-500/10 text-red-600 border-red-500/20",
  budget_officer: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export default function Dashboard() {
  const { user } = useLocalAuth();
  const { data: budgetStats } = trpc.budget.stats.useQuery();
  const { data: planningStats } = trpc.planning.stats.useQuery();
  const { data: recruitStats } = trpc.recruitment.stats.useQuery();
  const { data: projectStats } = trpc.projects.stats.useQuery();
  const { data: recentApps } = trpc.recruitment.list.useQuery({ status: undefined });
  const { data: budgetData } = trpc.budget.list.useQuery({});

  const stats = [
    { title: "إجمالي سجلات الموازنة", value: budgetStats?.totalRecords || 0, icon: <Wallet size={20} />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "التكلفة الشهرية", value: `${(budgetStats?.totalMonthly || 0).toLocaleString()} ر.ع`, icon: <BarChart3 size={20} />, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "احتياجات وظيفية", value: planningStats?.totalNeeds || 0, icon: <Target size={20} />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "أولوية عالية", value: planningStats?.highPriority || 0, icon: <AlertTriangle size={20} />, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "طلبات التوظيف", value: recruitStats?.total || 0, icon: <Users size={20} />, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { title: "المعينين", value: recruitStats?.appointed || 0, icon: <CheckCircle size={20} />, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "المشاريع النشطة", value: projectStats?.active || 0, icon: <FolderKanban size={20} />, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "ميزانية المشاريع", value: `${((projectStats?.totalBudget || 0) / 1000).toFixed(0)}K`, icon: <TrendingUp size={20} />, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            مرحباً، {user?.name || "المستخدم"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            نظرة عامة على أداء النظام والإحصائيات الرئيسية
          </p>
        </div>
        <Badge variant="outline" className={ROLE_COLORS[user?.role || "viewer"]}>
          {ROLE_LABELS[user?.role || "viewer"]}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 hover:border-primary/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={16} className="text-primary" />
              آخر طلبات التوظيف
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentApps && recentApps.length > 0 ? recentApps.slice(0, 8).map((app: Record<string, unknown>) => (
                <div key={String(app.id)} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {String(app.fullName || "?").charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{String(app.fullName || "—")}</p>
                      <p className="text-xs text-muted-foreground">{String(app.position || "—")}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {String(app.status || "—")}
                  </Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد طلبات</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet size={16} className="text-primary" />
              آخر حركات الموازنة
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {budgetData && budgetData.length > 0 ? budgetData.slice(0, 8).map((rec: Record<string, unknown>, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-xs font-bold shrink-0">
                      {String(rec.employeeName || "?").charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{String(rec.employeeName || "—")}</p>
                      <p className="text-xs text-muted-foreground">{String(rec.department || "—")}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-emerald-600">{String(rec.monthlyCost || "0")} ر.ع</p>
                    <p className="text-[10px] text-muted-foreground">{String(rec.movementType || "—")}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد سجلات</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
