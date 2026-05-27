import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { QUARTERS } from "@/types";
import type { Quarter } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, Plus, Search, Download, Trash2, Pencil, FileSpreadsheet,
  TrendingUp, TrendingDown, ArrowRightLeft
} from "lucide-react";

export default function BudgetPage() {
  const { can } = useLocalAuth();
  const [activeQ, setActiveQ] = useState<Quarter>("q1");
  const [search, setSearch] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    employeeName: "", department: "", unit: "", jobNumber: "",
    movementType: "appointment" as any, monthlyCost: "", yearlyCost: "",
    movementDate: "", notes: "",
  });

  const utils = trpc.useUtils();
  const { data: records, isLoading } = trpc.budget.list.useQuery({ quarter: activeQ });
  const { data: stats } = trpc.budget.stats.useQuery();

  const createMut = trpc.budget.create.useMutation({ onSuccess: () => { utils.budget.list.invalidate(); utils.budget.stats.invalidate(); setEditDialog(false); resetForm(); } });
  const updateMut = trpc.budget.update.useMutation({ onSuccess: () => { utils.budget.list.invalidate(); utils.budget.stats.invalidate(); setEditDialog(false); resetForm(); } });
  const deleteMut = trpc.budget.delete.useMutation({ onSuccess: () => { utils.budget.list.invalidate(); utils.budget.stats.invalidate(); } });

  const resetForm = () => {
    setForm({ employeeName: "", department: "", unit: "", jobNumber: "", movementType: "appointment", monthlyCost: "", yearlyCost: "", movementDate: "", notes: "" });
    setEditingId(null);
  };

  const openCreate = () => { resetForm(); setEditDialog(true); };
  const openEdit = (rec: Record<string, unknown>) => {
    setEditingId(Number(rec.id));
    setForm({
      employeeName: String(rec.employeeName || ""), department: String(rec.department || ""),
      unit: String(rec.unit || ""), jobNumber: String(rec.jobNumber || ""),
      movementType: String(rec.movementType || "appointment"), monthlyCost: String(rec.monthlyCost || ""),
      yearlyCost: String(rec.yearlyCost || ""), movementDate: rec.movementDate ? String(rec.movementDate).slice(0, 10) : "",
      notes: String(rec.notes || ""),
    });
    setEditDialog(true);
  };

  const handleSave = () => {
    const payload = { quarter: activeQ, fiscalYear: 2025, ...form, monthlyCost: form.monthlyCost || "0", yearlyCost: form.yearlyCost || "0" };
    if (editingId) { updateMut.mutate({ id: editingId, ...payload }); }
    else { createMut.mutate(payload); }
  };

  const filtered = records?.filter((r: Record<string, unknown>) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return String(r.employeeName || "").toLowerCase().includes(q) ||
           String(r.department || "").toLowerCase().includes(q) ||
           String(r.jobNumber || "").includes(q);
  });

  const exportCSV = () => {
    if (!filtered) return;
    const headers = ["الرقم الوظيفي", "الاسم", "القسم", "الوحدة", "نوع الحركة", "التكلفة الشهرية", "التكلفة السنوية", "تاريخ الحركة", "ملاحظات"];
    const rows = filtered.map((r: Record<string, unknown>) => [r.jobNumber, r.employeeName, r.department, r.unit, r.movementType, r.monthlyCost, r.yearlyCost, r.movementDate, r.notes]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `موازنة_${activeQ}.csv`; a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet size={20} className="text-primary" />
          <h1 className="text-xl font-bold">موازنة الوظائف</h1>
        </div>
        <div className="flex gap-2">
          {can("export") && (
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download size={14} className="ml-1" /> تصدير CSV
            </Button>
          )}
          {can("write") && (
            <Button size="sm" onClick={openCreate}>
              <Plus size={14} className="ml-1" /> إضافة سجل
            </Button>
          )}
        </div>
      </div>

      {/* Quarter Selector */}
      <div className="grid grid-cols-4 gap-2">
        {QUARTERS.map(q => (
          <button key={q.id} onClick={() => setActiveQ(q.id)}
            className={`p-3 rounded-lg border text-center transition-all ${
              activeQ === q.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"
            }`}>
            <p className="text-lg font-bold">Q{q.id.slice(1)}</p>
            <p className="text-xs text-muted-foreground">{q.label}</p>
            <p className="text-[10px] text-muted-foreground/60">{q.months}</p>
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">إجمالي السجلات</p>
                <p className="text-lg font-bold">{records?.length || 0}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg"><FileSpreadsheet size={16} className="text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">التكلفة الشهرية</p>
                <p className="text-lg font-bold text-emerald-600">{((stats?.totalMonthly || 0)).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg"><TrendingUp size={16} className="text-emerald-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">التكلفة السنوية</p>
                <p className="text-lg font-bold text-amber-600">{((stats?.totalYearly || 0)).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg"><TrendingDown size={16} className="text-amber-500" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الرقم الوظيفي أو القسم..." className="pr-10" />
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-right font-semibold">الرقم</th>
                  <th className="p-3 text-right font-semibold">الاسم</th>
                  <th className="p-3 text-right font-semibold">القسم</th>
                  <th className="p-3 text-right font-semibold">الوحدة</th>
                  <th className="p-3 text-right font-semibold">الحركة</th>
                  <th className="p-3 text-right font-semibold">شهري</th>
                  <th className="p-3 text-right font-semibold">سنوي</th>
                  <th className="p-3 text-right font-semibold">التاريخ</th>
                  {can("write") && <th className="p-3 text-right font-semibold">إجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
                ) : filtered && filtered.length > 0 ? filtered.map((rec: Record<string, unknown>) => (
                  <tr key={String(rec.id)} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{String(rec.jobNumber || "—")}</td>
                    <td className="p-3 font-medium">{String(rec.employeeName || "—")}</td>
                    <td className="p-3 text-muted-foreground">{String(rec.department || "—")}</td>
                    <td className="p-3 text-muted-foreground">{String(rec.unit || "—")}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">
                        <ArrowRightLeft size={10} className="ml-1" />
                        {String(rec.movementType || "—")}
                      </Badge>
                    </td>
                    <td className="p-3 text-emerald-600 font-mono">{String(rec.monthlyCost || "0")}</td>
                    <td className="p-3 text-amber-600 font-mono">{String(rec.yearlyCost || "0")}</td>
                    <td className="p-3 text-muted-foreground text-xs">{rec.movementDate ? String(rec.movementDate).slice(0, 10) : "—"}</td>
                    {can("write") && (
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(rec)}>
                            <Pencil size={12} />
                          </Button>
                          {can("delete") && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => { if (confirm("حذف هذا السجل؟")) deleteMut.mutate({ id: Number(rec.id) }); }}>
                              <Trash2 size={12} />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">لا توجد سجلات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل سجل" : "إضافة سجل جديد"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="space-y-1"><Label>الاسم</Label><Input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الرقم الوظيفي</Label><Input value={form.jobNumber} onChange={e => setForm(f => ({ ...f, jobNumber: e.target.value }))} /></div>
            <div className="space-y-1"><Label>القسم</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الوحدة</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
            <div className="space-y-1"><Label>نوع الحركة</Label>
              <Select value={form.movementType} onValueChange={v => setForm(f => ({ ...f, movementType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">تعيين</SelectItem>
                  <SelectItem value="promotion">تعزيز</SelectItem>
                  <SelectItem value="transfer_internal">نقل داخلي</SelectItem>
                  <SelectItem value="transfer_external">نقل خارجي</SelectItem>
                  <SelectItem value="resignation">استقالة</SelectItem>
                  <SelectItem value="termination">إنهاء خدمة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>تاريخ الحركة</Label><Input type="date" value={form.movementDate} onChange={e => setForm(f => ({ ...f, movementDate: e.target.value }))} /></div>
            <div className="space-y-1"><Label>التكلفة الشهرية</Label><Input type="number" value={form.monthlyCost} onChange={e => setForm(f => ({ ...f, monthlyCost: e.target.value }))} /></div>
            <div className="space-y-1"><Label>التكلفة السنوية</Label><Input type="number" value={form.yearlyCost} onChange={e => setForm(f => ({ ...f, yearlyCost: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1"><Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
