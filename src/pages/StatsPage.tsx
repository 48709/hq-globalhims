import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Wallet, Target, Users, FolderKanban, PieChart } from "lucide-react";

export default function StatsPage() {
  const { data: budgetStats } = trpc.budget.stats.useQuery();
  const { data: planningStats } = trpc.planning.stats.useQuery();
  const { data: recruitStats } = trpc.recruitment.stats.useQuery();
  const { data: projectStats } = trpc.projects.stats.useQuery();
  const { data: budgetData } = trpc.budget.list.useQuery({});
  const { data: recruitData } = trpc.recruitment.list.useQuery({});

  const movementTypes = budgetData?.reduce((acc: Record<string, number>, r: Record<string, unknown>) => {
    const t = String(r.movementType || "غير محدد");
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {}) || {};

  const deptStats = recruitData?.reduce((acc: Record<string, number>, r: Record<string, unknown>) => {
    const d = String(r.department || "غير محدد");
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {}) || {};

  const COLORS = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-red-500", "bg-purple-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 size={20} className="text-primary" />
        <h1 className="text-xl font-bold">الإحصائيات والتقارير</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-500/10 rounded-lg"><Wallet size={16} className="text-emerald-500" /></div><div><p className="text-xs text-muted-foreground">سجلات الموازنة</p><p className="text-lg font-bold">{budgetStats?.totalRecords || 0}</p></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Target size={16} className="text-blue-500" /></div><div><p className="text-xs text-muted-foreground">الاحتياجات</p><p className="text-lg font-bold">{planningStats?.totalNeeds || 0}</p></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center gap-3"><div className="p-2 bg-cyan-500/10 rounded-lg"><Users size={16} className="text-cyan-500" /></div><div><p className="text-xs text-muted-foreground">التوظيف</p><p className="text-lg font-bold">{recruitStats?.total || 0}</p></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center gap-3"><div className="p-2 bg-purple-500/10 rounded-lg"><FolderKanban size={16} className="text-purple-500" /></div><div><p className="text-xs text-muted-foreground">المشاريع</p><p className="text-lg font-bold">{projectStats?.total || 0}</p></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget Summary */}
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Wallet size={16} className="text-emerald-500" /> ملخص الموازنة</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg"><span className="text-sm">التكلفة الشهرية الإجمالية</span><span className="font-bold text-emerald-600">{((budgetStats?.totalMonthly || 0)).toLocaleString()} ر.ع</span></div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg"><span className="text-sm">التكلفة السنوية الإجمالية</span><span className="font-bold text-amber-600">{((budgetStats?.totalYearly || 0)).toLocaleString()} ر.ع</span></div>
              <div className="space-y-2">
                <p className="text-sm font-medium">التوزيع بالأرباع</p>
                {budgetStats?.byQuarter && Object.entries(budgetStats.byQuarter).map(([q, v]: [string, unknown]) => (
                  <div key={q} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">{q.toUpperCase()}</span>
                    <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                      <div className={`h-full ${COLORS[parseInt(q.slice(1)) - 1] || "bg-primary"} rounded-full transition-all`} style={{ width: `${Math.min(((v as number) / (budgetStats.totalRecords || 1)) * 400, 100)}%` }} />
                    </div>
                    <span className="text-xs font-mono w-8 text-left">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planning Summary */}
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Target size={16} className="text-blue-500" /> ملخص التخطيط</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg"><span className="text-sm">العدد المطلوب</span><span className="font-bold text-blue-600">{planningStats?.totalNeeded || 0}</span></div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg"><span className="text-sm">العدد الحالي</span><span className="font-bold text-emerald-600">{planningStats?.totalCurrent || 0}</span></div>
              <div className="flex justify-between items-center p-2 bg-red-500/5 rounded-lg"><span className="text-sm">الفجوة</span><span className="font-bold text-red-600">{planningStats?.totalGap || 0}</span></div>
              <div className="flex justify-between items-center p-2 bg-amber-500/5 rounded-lg"><span className="text-sm">أولوية عالية</span><span className="font-bold text-amber-600">{planningStats?.highPriority || 0}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Movement Types */}
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><PieChart size={16} className="text-purple-500" /> أنواع الحركات</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(movementTypes).map(([type, count], i) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 truncate">{type}</span>
                  <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                    <div className={`h-full ${COLORS[i % COLORS.length]} rounded-full transition-all`} style={{ width: `${Math.min(((count as number) / (budgetData?.length || 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs font-mono w-6 text-left">{String(count)}</span>
                </div>
              ))}
              {Object.keys(movementTypes).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recruitment by Department */}
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Users size={16} className="text-cyan-500" /> التوظيف بالجهات</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(deptStats).map(([dept, count], i) => (
                <div key={dept} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 truncate">{dept}</span>
                  <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                    <div className={`h-full ${COLORS[(i + 3) % COLORS.length]} rounded-full transition-all`} style={{ width: `${Math.min(((count as number) / (recruitData?.length || 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs font-mono w-6 text-left">{String(count)}</span>
                </div>
              ))}
              {Object.keys(deptStats).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
