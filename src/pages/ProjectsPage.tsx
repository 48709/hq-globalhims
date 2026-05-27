import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, Plus, Search, Trash2, Pencil, TrendingUp } from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "نشط", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  pending: { label: "معلق", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  completed: { label: "مكتمل", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  cancelled: { label: "ملغي", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export default function ProjectsPage() {
  const { can } = useLocalAuth();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", department: "", status: "active" as string, budget: "", spent: "", startDate: "", endDate: "", description: "", managerName: "" });

  const utils = trpc.useUtils();
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: stats } = trpc.projects.stats.useQuery();
  const createMut = trpc.projects.create.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); utils.projects.stats.invalidate(); setDialog(false); } });
  const updateMut = trpc.projects.update.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); utils.projects.stats.invalidate(); setDialog(false); } });
  const deleteMut = trpc.projects.delete.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); utils.projects.stats.invalidate(); } });

  const filtered = projects?.filter((p: Record<string, unknown>) => {
    if (!search) return true;
    return String(p.name || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderKanban size={20} className="text-primary" />
          <h1 className="text-xl font-bold">ملف المشاريع</h1>
        </div>
        {can("write") && <Button size="sm" onClick={() => { setEditingId(null); setForm({ name: "", department: "", status: "active", budget: "", spent: "", startDate: "", endDate: "", description: "", managerName: "" }); setDialog(true); }}>
          <Plus size={14} className="ml-1" /> مشروع جديد
        </Button>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">إجمالي المشاريع</p><p className="text-xl font-bold">{stats?.total || 0}</p></div><div className="p-2 bg-primary/10 rounded-lg"><FolderKanban size={14} className="text-primary" /></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">النشطة</p><p className="text-xl font-bold text-emerald-600">{stats?.active || 0}</p></div><div className="p-2 bg-emerald-500/10 rounded-lg"><TrendingUp size={14} className="text-emerald-500" /></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">ميزانية إجمالية</p><p className="text-xl font-bold text-amber-600">{((stats?.totalBudget || 0)).toLocaleString()}</p></div><div className="p-2 bg-amber-500/10 rounded-lg"><TrendingUp size={14} className="text-amber-500" /></div></div></CardContent></Card>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="pr-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered && filtered.length > 0 ? filtered.map((proj: Record<string, unknown>) => {
          const budget = parseFloat(String(proj.budget || "0"));
          const spent = parseFloat(String(proj.spent || "0"));
          const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
          return (
            <Card key={String(proj.id)} className="border-border/50 hover:border-primary/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{String(proj.name || "—")}</p>
                    <p className="text-xs text-muted-foreground">{String(proj.department || "—")}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_CONFIG[String(proj.status) as keyof typeof STATUS_CONFIG]?.color || ""}`}>
                    {STATUS_CONFIG[String(proj.status) as keyof typeof STATUS_CONFIG]?.label || String(proj.status)}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  <p>المدير: {String(proj.managerName || "—")}</p>
                  {Boolean(proj.startDate && proj.endDate) && <p>الفترة: {String(proj.startDate).slice(0, 10)} → {String(proj.endDate).slice(0, 10)}</p>}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>المنفق: {spent.toLocaleString()}</span><span className="text-muted-foreground">{pct}%</span></div>
                  <Progress value={pct} className="h-1.5" />
                </div>
                {can("write") && (
                  <div className="flex gap-1 mt-3 pt-3 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingId(Number(proj.id)); setForm({ name: String(proj.name || ""), department: String(proj.department || ""), status: String(proj.status || "active"), budget: String(proj.budget || ""), spent: String(proj.spent || ""), startDate: proj.startDate ? String(proj.startDate).slice(0, 10) : "", endDate: proj.endDate ? String(proj.endDate).slice(0, 10) : "", description: String(proj.description || ""), managerName: String(proj.managerName || "") }); setDialog(true); }}>
                      <Pencil size={12} />
                    </Button>
                    {can("delete") && <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => { if (confirm("حذف؟")) deleteMut.mutate({ id: Number(proj.id) }); }}><Trash2 size={12} /></Button>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }) : <p className="text-center text-muted-foreground col-span-full py-8">لا توجد مشاريع</p>}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "تعديل" : "مشروع جديد"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="col-span-2 space-y-1"><Label>اسم المشروع *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الجهة</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">نشط</SelectItem><SelectItem value="pending">معلق</SelectItem><SelectItem value="completed">مكتمل</SelectItem><SelectItem value="cancelled">ملغي</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>الميزانية</Label><Input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} /></div>
            <div className="space-y-1"><Label>المنفق</Label><Input type="number" value={form.spent} onChange={e => setForm(f => ({ ...f, spent: e.target.value }))} /></div>
            <div className="space-y-1"><Label>تاريخ البداية</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div className="space-y-1"><Label>تاريخ النهاية</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            <div className="space-y-1"><Label>المدير</Label><Input value={form.managerName} onChange={e => setForm(f => ({ ...f, managerName: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1"><Label>الوصف</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialog(false)}>إلغاء</Button>
            <Button onClick={() => { if (editingId) updateMut.mutate({ id: editingId, ...form, status: form.status as any }); else createMut.mutate({ ...form, status: form.status as any }); }} disabled={!form.name || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "جاري..." : "حفظ"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
