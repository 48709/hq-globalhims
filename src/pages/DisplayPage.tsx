import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Users, Target, FolderKanban, Building2 } from "lucide-react";

export default function DisplayPage() {
  const [time, setTime] = useState(new Date());
  const { data: budgetStats } = trpc.budget.stats.useQuery();
  const { data: recruitStats } = trpc.recruitment.stats.useQuery();
  const { data: planningStats } = trpc.planning.stats.useQuery();
  const { data: projectStats } = trpc.projects.stats.useQuery();
  const { data: budgetData } = trpc.budget.list.useQuery({});

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = time.toLocaleDateString("ar-OM", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950 text-white p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-800/50 pb-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🏥</div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">نظام إدارة الموارد البشرية</h1>
            <p className="text-sm text-emerald-600/70">HR Budget & Recruitment System v2.0</p>
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold font-mono text-emerald-400">{timeStr}</div>
          <div className="text-sm text-emerald-600/70">{dateStr}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "سجلات الموازنة", value: budgetStats?.totalRecords || 0, icon: <Wallet size={24} />, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "طلبات التوظيف", value: recruitStats?.total || 0, icon: <Users size={24} />, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "الاحتياجات", value: planningStats?.totalNeeds || 0, icon: <Target size={24} />, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "المشاريع", value: projectStats?.total || 0, icon: <FolderKanban size={24} />, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((s, i) => (
          <Card key={i} className="bg-white/5 border-emerald-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-emerald-600/70">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Table */}
      <Card className="bg-white/5 border-emerald-800/30">
        <CardHeader className="pb-3"><CardTitle className="text-lg text-emerald-400 flex items-center gap-2"><Wallet size={18} /> حركات الموازنة الأخيرة</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-emerald-800/30">
                <th className="p-2 text-right text-emerald-500/70">الاسم</th>
                <th className="p-2 text-right text-emerald-500/70">القسم</th>
                <th className="p-2 text-right text-emerald-500/70">الحركة</th>
                <th className="p-2 text-right text-emerald-500/70">شهري</th>
                <th className="p-2 text-right text-emerald-500/70">سنوي</th>
              </tr></thead>
              <tbody>
                {budgetData && budgetData.slice(0, 10).map((rec: Record<string, unknown>, i: number) => (
                  <tr key={i} className="border-b border-emerald-800/20 hover:bg-white/5 transition-colors">
                    <td className="p-2 font-medium">{String(rec.employeeName || "—")}</td>
                    <td className="p-2 text-emerald-400/60">{String(rec.department || "—")}</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">{String(rec.movementType || "—")}</span></td>
                    <td className="p-2 font-mono text-amber-400">{String(rec.monthlyCost || "0")}</td>
                    <td className="p-2 font-mono text-emerald-400">{String(rec.yearlyCost || "0")}</td>
                  </tr>
                ))}
                {(!budgetData || budgetData.length === 0) && <tr><td colSpan={5} className="p-8 text-center text-emerald-600/50">لا توجد بيانات</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer Ticker */}
      <div className="border-t border-emerald-800/30 pt-4 overflow-hidden">
        <div className="flex items-center gap-2 animate-pulse">
          <Building2 size={16} className="text-amber-400 shrink-0" />
          <div className="whitespace-nowrap animate-[scroll_20s_linear_infinite]">
            <span className="text-sm text-amber-400/80">
              أنت لست مجرد موظف، أنت جزء أساسي من نجاح الفريق — معاً للتغيير — Ministry of Health · Oman
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
