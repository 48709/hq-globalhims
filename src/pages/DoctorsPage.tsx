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
import { Stethoscope, Plus, Search, Trash2, Pencil } from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "نشط", color: "bg-emerald-500/10 text-emerald-600" },
  on_leave: { label: "في إجازة", color: "bg-amber-500/10 text-amber-600" },
  terminated: { label: "منتهي", color: "bg-red-500/10 text-red-600" },
  retired: { label: "متقاعد", color: "bg-gray-500/10 text-gray-600" },
};

export default function DoctorsPage() {
  const { can } = useLocalAuth();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ doctorNumber: "", jobTitle: "", specialty: "", qualification: "", facility: "", nationality: "", appointmentDate: "", status: "active" as any, notes: "" });

  const utils = trpc.useUtils();
  const { data: docs } = trpc.doctors.list.useQuery();
  const createMut = trpc.doctors.create.useMutation({ onSuccess: () => { utils.doctors.list.invalidate(); setDialog(false); } });
  const updateMut = trpc.doctors.update.useMutation({ onSuccess: () => { utils.doctors.list.invalidate(); setDialog(false); } });
  const deleteMut = trpc.doctors.delete.useMutation({ onSuccess: () => utils.doctors.list.invalidate() });

  const filtered = docs?.filter((d: Record<string, unknown>) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return String(d.fullName || d.jobTitle || "").toLowerCase().includes(q) || String(d.specialty || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Stethoscope size={20} className="text-primary" />
          <h1 className="text-xl font-bold">حصر الأطباء</h1>
        </div>
        {can("write") && <Button size="sm" onClick={() => { setEditingId(null); setForm({ doctorNumber: "", jobTitle: "", specialty: "", qualification: "", facility: "", nationality: "", appointmentDate: "", status: "active", notes: "" }); setDialog(true); }}>
          <Plus size={14} className="ml-1" /> إضافة طبيب
        </Button>}
      </div>
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="pr-10" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered && filtered.length > 0 ? filtered.map((doc: Record<string, unknown>) => (
          <Card key={String(doc.id)} className="border-border/50 hover:border-primary/20 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-sm"><span className="text-sm">Dr</span></div>
                  <div>
                    <p className="font-semibold text-sm">{String(doc.jobTitle || '') || '—'}</p>
                    <p className="text-xs text-muted-foreground">{String(doc.specialty || "—")}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[9px] ${STATUS_CONFIG[String(doc.status) as keyof typeof STATUS_CONFIG]?.color || ""}`}>
                  {STATUS_CONFIG[String(doc.status) as keyof typeof STATUS_CONFIG]?.label || String(doc.status)}
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>الجهة: {String(doc.facility || "—")}</p>
                <p>المؤهل: {String(doc.qualification || "—")}</p>
                <p>الجنسية: {String(doc.nationality || "—")}</p>
                {Boolean(doc.appointmentDate) && <p>تاريخ التعيين: {String(doc.appointmentDate).slice(0, 10)}</p>}
              </div>
              {can("write") && (
                <div className="flex gap-1 mt-3 pt-3 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingId(Number(doc.id)); setForm({ doctorNumber: String(doc.doctorNumber || ""), jobTitle: String(doc.jobTitle || ""), specialty: String(doc.specialty || ""), qualification: String(doc.qualification || ""), facility: String(doc.facility || ""), nationality: String(doc.nationality || ""), appointmentDate: doc.appointmentDate ? String(doc.appointmentDate).slice(0, 10) : "", status: String(doc.status || "active"), notes: String(doc.notes || "") }); setDialog(true); }}>
                    <Pencil size={12} />
                  </Button>
                  {can("delete") && <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => { if (confirm("حذف؟")) deleteMut.mutate({ id: Number(doc.id) }); }}><Trash2 size={12} /></Button>}
                </div>
              )}
            </CardContent>
          </Card>
        )) : <p className="text-center text-muted-foreground col-span-full py-8">لا يوجد أطباء</p>}
      </div>
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "تعديل" : "إضافة طبيب"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="space-y-1"><Label>الرقم</Label><Input value={form.doctorNumber} onChange={e => setForm(f => ({ ...f, doctorNumber: e.target.value }))} /></div>
            <div className="space-y-1"><Label>المسمى</Label><Input value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} /></div>
            <div className="space-y-1"><Label>التخصص</Label><Input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
            <div className="space-y-1"><Label>المؤهل</Label><Input value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الجهة</Label><Input value={form.facility} onChange={e => setForm(f => ({ ...f, facility: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الجنسية</Label><Input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} /></div>
            <div className="space-y-1"><Label>تاريخ التعيين</Label><Input type="date" value={form.appointmentDate} onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">نشط</SelectItem><SelectItem value="on_leave">في إجازة</SelectItem><SelectItem value="terminated">منتهي</SelectItem><SelectItem value="retired">متقاعد</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialog(false)}>إلغاء</Button>
            <Button onClick={() => { if (editingId) updateMut.mutate({ id: editingId, ...form }); else createMut.mutate(form); }} disabled={createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "جاري..." : "حفظ"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
