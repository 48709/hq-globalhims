import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { QUARTERS } from "@/types";
import type { Quarter, Priority, PlanStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Search, Trash2, Pencil, AlertTriangle, Users, CheckCircle, XCircle } from "lucide-react";

const PRIORITY_CONFIG = {
  high: { label: "عالية", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  medium: { label: "متوسطة", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  low: { label: "منخفضة", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
};

const STATUS_CONFIG = {
  pending: { label: "قيد الدراسة", color: "bg-amber-500/10 text-amber-600" },
  approved: { label: "معتمد", color: "bg-emerald-500/10 text-emerald-600" },
  rejected: { label: "مرفوض", color: "bg-red-500/10 text-red-600" },
  completed: { label: "منجز", color: "bg-blue-500/10 text-blue-600" },
};

export default function PlanningPage() {
  const { can } = useLocalAuth();
  const [activeQ, setActiveQ] = useState<Quarter>("q1");
  const [search, setSearch] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    code: "", jobTitle: "", department: "", neededCount: "", currentCount: "",
    priority: "medium" as Priority, status: "pending" as PlanStatus, notes: "",
  });

  const utils = trpc.useUtils();
  const { data: records } = trpc.planning.list.useQuery({ quarter: activeQ });
  const { data: stats } = trpc.planning.stats.useQuery();

  const createMut = trpc.planning.create.useMutation({ onSuccess: () => { utils.planning.list.invalidate(); utils.planning.stats.invalidate(); setEditDialog(false); resetForm(); } });
  const updateMut = trpc.planning.update.useMutation({ onSuccess: () => { utils.planning.list.invalidate(); utils.planning.stats.invalidate(); setEditDialog(false); resetForm(); } });
  const deleteMut = trpc.planning.delete.useMutation({ onSuccess: () => { utils.planning.list.invalidate(); utils.planning.stats.invalidate(); } });

  const resetForm = () => {
    setForm({ code: "", jobTitle: "", department: "", neededCount: "", currentCount: "", priority: "medium", status: "pending", notes: "" });
    setEditingId(null);
  };

  const openCreate = () => { resetForm(); setEditDialog(true); };
  const openEdit = (rec: Record<string, unknown>) => {
    setEditingId(Number(rec.id));
    setForm({
      code: String(rec.code || ""), jobTitle: String(rec.jobTitle || ""),
      department: String(rec.department || ""), neededCount: String(rec.neededCount || ""),
      currentCount: String(rec.currentCount || ""), priority: String(rec.priority || "medium") as Priority,
      status: String(rec.status || "pending") as PlanStatus, notes: String(rec.notes || ""),
    });
    setEditDialog(true);
  };

  const handleSave = () => {
    const payload = {
      quarter: activeQ, fiscalYear: 2025, code: form.code || undefined,
      jobTitle: form.jobTitle, department: form.department || undefined,
      neededCount: parseInt(form.neededCount) || 0, currentCount: parseInt(form.currentCount) || 0,
      priority: form.priority, status: form.status, notes: form.notes || undefined,
    };
    if (editingId) { updateMut.mutate({ id: editingId, ...payload }); }
    else { createMut.mutate(payload); }
  };

  const filtered = records?.filter((r: Record<string, unknown>) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return String(r.jobTitle || "").toLowerCase().includes(q) || String(r.department || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-primary" />
          <h1 className="text-xl font-bold">تخطيط الاحتياج الوظيفي</h1>
        </div>
        {can("write") && (
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} className="ml-1" /> احتياج جديد
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">الاحتياجات</p><p className="text-lg font-bold">{stats?.totalNeeds || 0}</p></div><div className="p-2 bg-primary/10 rounded-lg"><Target size={14} className="text-primary" /></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">المطلوب</p><p className="text-lg font-bold">{stats?.totalNeeded || 0}</p></div><div className="p-2 bg-blue-500/10 rounded-lg"><Users size={14} className="text-blue-500" /></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">الحالي</p><p className="text-lg font-bold text-emerald-600">{stats?.totalCurrent || 0}</p></div><div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle size={14} className="text-emerald-500" /></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">الفجوة</p><p className="text-lg font-bold text-red-600">{stats?.totalGap || 0}</p></div><div className="p-2 bg-red-500/10 rounded-lg"><XCircle size={14} className="text-red-500" /></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">أولوية عالية</p><p className="text-lg font-bold text-red-600">{stats?.highPriority || 0}</p></div><div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle size={14} className="text-red-500" /></div></div></CardContent></Card>
      </div>

      {/* Quarters */}
      <div className="grid grid-cols-4 gap-2">
        {QUARTERS.map(q => (
          <button key={q.id} onClick={() => setActiveQ(q.id)}
            className={`p-3 rounded-lg border text-center transition-all ${activeQ === q.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}>
            <p className="text-lg font-bold">Q{q.id.slice(1)}</p>
            <p className="text-xs text-muted-foreground">{q.label}</p>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالمسمى الوظيفي أو القسم..." className="pr-10" />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-right font-semibold">الكود</th>
                <th className="p-3 text-right font-semibold">المسمى</th>
                <th className="p-3 text-right font-semibold">القسم</th>
                <th className="p-3 text-right font-semibold">مطلوب</th>
                <th className="p-3 text-right font-semibold">حالي</th>
                <th className="p-3 text-right font-semibold">فجوة</th>
                <th className="p-3 text-right font-semibold">الأولوية</th>
                <th className="p-3 text-right font-semibold">الحالة</th>
                {can("write") && <th className="p-3 text-right font-semibold">إجراءات</th>}
              </tr></thead>
              <tbody>
                {filtered && filtered.length > 0 ? filtered.map((rec: Record<string, unknown>) => (
                  <tr key={String(rec.id)} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{String(rec.code || "—")}</td>
                    <td className="p-3 font-medium">{String(rec.jobTitle || "—")}</td>
                    <td className="p-3 text-muted-foreground">{String(rec.department || "—")}</td>
                    <td className="p-3">{String(rec.neededCount || "0")}</td>
                    <td className="p-3">{String(rec.currentCount || "0")}</td>
                    <td className="p-3 font-bold text-red-500">{String(rec.gapCount || "0")}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] ${PRIORITY_CONFIG[String(rec.priority) as keyof typeof PRIORITY_CONFIG]?.color || ""}`}>
                        {PRIORITY_CONFIG[String(rec.priority) as keyof typeof PRIORITY_CONFIG]?.label || String(rec.priority)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] ${STATUS_CONFIG[String(rec.status) as keyof typeof STATUS_CONFIG]?.color || ""}`}>
                        {STATUS_CONFIG[String(rec.status) as keyof typeof STATUS_CONFIG]?.label || String(rec.status)}
                      </Badge>
                    </td>
                    {can("write") && (
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(rec)}><Pencil size={12} /></Button>
                          {can("delete") && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => { if (confirm("حذف؟")) deleteMut.mutate({ id: Number(rec.id) }); }}><Trash2 size={12} /></Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )) : <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">لا توجد سجلات</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "تعديل" : "إضافة احتياج"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="space-y-1"><Label>الكود</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
            <div className="space-y-1"><Label>المسمى الوظيفي *</Label><Input value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} /></div>
            <div className="space-y-1"><Label>القسم</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            <div className="space-y-1"><Label>العدد المطلوب</Label><Input type="number" value={form.neededCount} onChange={e => setForm(f => ({ ...f, neededCount: e.target.value }))} /></div>
            <div className="space-y-1"><Label>العدد الحالي</Label><Input type="number" value={form.currentCount} onChange={e => setForm(f => ({ ...f, currentCount: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الأولوية</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="high">عالية</SelectItem><SelectItem value="medium">متوسطة</SelectItem><SelectItem value="low">منخفضة</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as PlanStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="pending">قيد الدراسة</SelectItem><SelectItem value="approved">معتمد</SelectItem><SelectItem value="rejected">مرفوض</SelectItem><SelectItem value="completed">منجز</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "جاري..." : "حفظ"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
