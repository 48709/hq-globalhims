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
import { Shield, Plus, Search, Trash2 } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام", hr_manager: "مدير الموارد البشرية", planner: "مدير التخطيط",
  analyst: "محلل بيانات", viewer: "مستخدم عرض", recruiter: "مسؤول التوظيف",
  security_officer: "ضابط أمن", budget_officer: "مسؤول الموازنة",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-amber-500/10 text-amber-600", hr_manager: "bg-emerald-500/10 text-emerald-600",
  planner: "bg-blue-500/10 text-blue-600", analyst: "bg-purple-500/10 text-purple-600",
  viewer: "bg-gray-500/10 text-gray-600", recruiter: "bg-cyan-500/10 text-cyan-600",
  security_officer: "bg-red-500/10 text-red-600", budget_officer: "bg-orange-500/10 text-orange-600",
};

export default function UsersPage() {
  const { can } = useLocalAuth();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", displayName: "", email: "", phone: "", role: "viewer", department: "" });

  const utils = trpc.useUtils();
  const { data: users } = trpc.system.userList.useQuery();
  const createMut = trpc.system.userCreate.useMutation({ onSuccess: () => { utils.system.userList.invalidate(); setDialog(false); setForm({ username: "", password: "", displayName: "", email: "", phone: "", role: "viewer", department: "" }); } });
  const updateMut = trpc.system.userUpdate.useMutation({ onSuccess: () => utils.system.userList.invalidate() });
  const deleteMut = trpc.system.userDelete.useMutation({ onSuccess: () => utils.system.userList.invalidate() });

  const filtered = users?.filter((u: Record<string, unknown>) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return String(u.displayName || "").toLowerCase().includes(q) || String(u.username || "").toLowerCase().includes(q);
  });

  if (!can("read") && !can("admin")) return <p className="text-center text-muted-foreground py-8">ليس لديك صلاحية</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          <h1 className="text-xl font-bold">إدارة المستخدمين</h1>
        </div>
        {can("write") && <Button size="sm" onClick={() => setDialog(true)}><Plus size={14} className="ml-1" /> مستخدم جديد</Button>}
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="pr-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered && filtered.length > 0 ? filtered.map((user: Record<string, unknown>) => (
          <Card key={String(user.id)} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${ROLE_COLORS[String(user.role) || "viewer"].split(" ")[0]} flex items-center justify-center font-bold text-sm shrink-0`}>
                  {String(user.displayName || "?").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{String(user.displayName || "—")}</p>
                  <p className="text-xs text-muted-foreground font-mono">@{String(user.username || "—")}</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] mb-2 ${ROLE_COLORS[String(user.role) || "viewer"] || ""}`}>
                {ROLE_LABELS[String(user.role) || "viewer"] || String(user.role)}
              </Badge>
              <div className="space-y-1 text-xs text-muted-foreground">
                {Boolean(user.department) && <p>{String(user.department)}</p>}
                {Boolean(user.email) && <p>{String(user.email)}</p>}
                {Boolean(user.phone) && <p>{String(user.phone)}</p>}
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                {Boolean(user.isActive)
                  ? <span className="text-xs text-emerald-600">&#10003; نشط</span>
                  : <span className="text-xs text-red-600">&#10007; معطل</span>}
                <div className="mr-auto flex gap-1">
                  {can("write") && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => updateMut.mutate({ id: Number(user.id), isActive: !Boolean(user.isActive) })}>
                      {Boolean(user.isActive) ? "تعطيل" : "تنشيط"}
                    </Button>
                  )}
                  {can("delete") && <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => { if (confirm("حذف؟")) deleteMut.mutate({ id: Number(user.id) }); }}><Trash2 size={12} /></Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        )) : <p className="text-center text-muted-foreground col-span-full py-8">لا يوجد مستخدمون</p>}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>مستخدم جديد</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="space-y-1"><Label>اسم المستخدم *</Label><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
            <div className="space-y-1"><Label>كلمة المرور *</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الاسم الكامل *</Label><Input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الدور</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(ROLE_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>البريد</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الهاتف</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1"><Label>القسم</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialog(false)}>إلغاء</Button>
            <Button onClick={() => createMut.mutate({ ...form, role: form.role as any })} disabled={!form.username || !form.password || !form.displayName || createMut.isPending}>{createMut.isPending ? "جاري..." : "إنشاء"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
