import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { STATUS_LABELS, STAGE_LABELS, STAGE_ORDER } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import {
  Users, Plus, Search, Trash2, CheckCircle, XCircle, RotateCcw,
  MessageSquare, Mail, Phone
} from "lucide-react";

export default function RecruitmentPage() {
  const { can } = useLocalAuth();
  const [search, setSearch] = useState("");
  const [createDialog, setCreateDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [msgDialog, setMsgDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Record<string, unknown> | null>(null);
  const [msgForm, setMsgForm] = useState({ type: "sms" as "sms" | "email", recipient: "", subject: "", body: "" });
  const [form, setForm] = useState({ fullName: "", nationalId: "", phone: "", email: "", position: "", department: "", qualification: "", notes: "" });

  const utils = trpc.useUtils();
  const { data: apps } = trpc.recruitment.list.useQuery({});
  const { data: stats } = trpc.recruitment.stats.useQuery();
  const createMut = trpc.recruitment.create.useMutation({ onSuccess: () => { utils.recruitment.list.invalidate(); utils.recruitment.stats.invalidate(); setCreateDialog(false); setForm({ fullName: "", nationalId: "", phone: "", email: "", position: "", department: "", qualification: "", notes: "" }); } });
  const advanceMut = trpc.recruitment.advanceStage.useMutation({ onSuccess: () => { utils.recruitment.list.invalidate(); utils.recruitment.stats.invalidate(); setDetailDialog(false); } });
  const deleteMut = trpc.recruitment.delete.useMutation({ onSuccess: () => { utils.recruitment.list.invalidate(); utils.recruitment.stats.invalidate(); } });
  const sendMsgMut = trpc.recruitment.sendMessage.useMutation({ onSuccess: () => { setMsgDialog(false); setMsgForm({ type: "sms", recipient: "", subject: "", body: "" }); } });

  const filtered = apps?.filter((a: Record<string, unknown>) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return String(a.fullName || "").toLowerCase().includes(q) || String(a.position || "").toLowerCase().includes(q);
  });

  const getStageIndex = (stage: string) => STAGE_ORDER.indexOf(stage as typeof STAGE_ORDER[number]);

  const viewDetail = (app: Record<string, unknown>) => { setSelectedApp(app); setDetailDialog(true); };
  const openMsg = (app: Record<string, unknown>, type: "sms" | "email") => {
    setSelectedApp(app);
    setMsgForm({ type, recipient: type === "sms" ? String(app.phone || "") : String(app.email || ""), subject: `قرار التعيين - ${app.fullName || ""}`, body: type === "sms" ? `تم قبولك للوظيفة. يرجى إرفاق المستندات المطلوبة.` : `مرحباً ${app.fullName || ""},\n\nتم قبولك في وظيفة ${app.position || ""}.\n\nمع التحيات` });
    setMsgDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-primary" />
          <h1 className="text-xl font-bold">طلبات التوظيف</h1>
        </div>
        {can("write") && (
          <Button size="sm" onClick={() => setCreateDialog(true)}><Plus size={14} className="ml-1" /> طلب جديد</Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">الإجمالي</p><p className="text-xl font-bold">{stats?.total || 0}</p></div><div className="p-2 bg-primary/10 rounded-lg"><Users size={14} className="text-primary" /></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">معينين</p><p className="text-xl font-bold text-emerald-600">{stats?.appointed || 0}</p></div><div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle size={14} className="text-emerald-500" /></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">قيد المعالجة</p><p className="text-xl font-bold text-amber-600">{stats?.pending || 0}</p></div><div className="p-2 bg-amber-500/10 rounded-lg"><RotateCcw size={14} className="text-amber-500" /></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">مرفوضين</p><p className="text-xl font-bold text-red-600">{stats?.rejected || 0}</p></div><div className="p-2 bg-red-500/10 rounded-lg"><XCircle size={14} className="text-red-500" /></div></div></CardContent></Card>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الوظيفة..." className="pr-10" />
      </div>

      {/* Applications List */}
      <div className="space-y-2">
        {filtered && filtered.length > 0 ? filtered.map((app: Record<string, unknown>) => (
          <Card key={String(app.id)} className="border-border/50 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => viewDetail(app)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {String(app.fullName || "?").charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{String(app.fullName || "—")}</p>
                    <p className="text-xs text-muted-foreground">{String(app.position || "—")} · {String(app.department || "—")}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {/* Stage Progress */}
                      <div className="flex items-center gap-0.5">
                        {STAGE_ORDER.map((stage, i) => {
                          const appStageIdx = getStageIndex(String(app.currentStage || ""));
                          const isActive = i === appStageIdx;
                          const isDone = i < appStageIdx;
                          return (
                            <div key={stage} className={`w-5 h-1.5 rounded-full ${isDone ? "bg-emerald-500" : isActive ? "bg-amber-500" : "bg-muted"}`} title={STAGE_LABELS[stage]} />
                          );
                        })}
                      </div>
                      <span className="text-[10px] text-muted-foreground mr-1">{STAGE_LABELS[String(app.currentStage)] || String(app.currentStage)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-[10px]">{STATUS_LABELS[String(app.status) || ""] || String(app.status)}</Badge>
                  <span className="text-[10px] text-muted-foreground">{app.createdAt ? String(app.createdAt).slice(0, 10) : ""}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>طلب توظيف جديد</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="space-y-1"><Label>الاسم الكامل *</Label><Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الرقم الوطني</Label><Input value={form.nationalId} onChange={e => setForm(f => ({ ...f, nationalId: e.target.value }))} /></div>
            <div className="space-y-1"><Label>رقم الهاتف</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-1"><Label>البريد الإلكتروني</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1"><Label>المسمى الوظيفي</Label><Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الجهة</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1"><Label>المؤهل</Label><Input value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1"><Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setCreateDialog(false)}>إلغاء</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.fullName || createMut.isPending}>{createMut.isPending ? "جاري..." : "تقديم"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>تفاصيل المعاملة</DialogTitle></DialogHeader>
          {selectedApp && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {String(selectedApp.fullName || "?").charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{String(selectedApp.fullName || "—")}</p>
                  <p className="text-sm text-muted-foreground">{String(selectedApp.position || "—")}</p>
                </div>
                <Badge variant="outline" className="mr-auto">{STATUS_LABELS[String(selectedApp.status) || ""] || String(selectedApp.status)}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">الرقم الوطني</p><p className="font-mono">{String(selectedApp.nationalId || "—")}</p></div>
                <div className="p-2 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">الجهة</p><p>{String(selectedApp.department || "—")}</p></div>
                <div className="p-2 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">الهاتف</p><p className="font-mono">{String(selectedApp.phone || "—")}</p></div>
                <div className="p-2 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">البريد</p><p>{String(selectedApp.email || "—")}</p></div>
                <div className="col-span-2 p-2 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">المؤهل</p><p>{String(selectedApp.qualification || "—")}</p></div>
              </div>

              {/* Stage Progress */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">مسار العمل</p>
                <div className="flex items-center justify-between">
                  {STAGE_ORDER.map((stage, i) => {
                    const appStageIdx = getStageIndex(String(selectedApp.currentStage || ""));
                    const isDone = i < appStageIdx;
                    const isActive = i === appStageIdx;
                    return (
                      <div key={stage} className="flex flex-col items-center gap-1 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>
                          {isDone ? <CheckCircle size={14} /> : i + 1}
                        </div>
                        <span className="text-[9px] text-muted-foreground text-center leading-tight">{STAGE_LABELS[stage]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <Button size="sm" variant="outline" onClick={() => openMsg(selectedApp, "sms")}><Phone size={12} className="ml-1" /> SMS</Button>
                <Button size="sm" variant="outline" onClick={() => openMsg(selectedApp, "email")}><Mail size={12} className="ml-1" /> بريد</Button>
                {can("write") && (
                  <>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => advanceMut.mutate({ id: Number(selectedApp.id), stage: String(selectedApp.currentStage || "security"), decision: "approve" })} disabled={String(selectedApp.status) === "appointed"}>
                      <CheckCircle size={12} className="ml-1" /> اعتماد المرحلة
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { if (confirm("رفض هذا الطلب؟")) { advanceMut.mutate({ id: Number(selectedApp.id), stage: String(selectedApp.currentStage || "security"), decision: "reject" }); } }}>
                      <XCircle size={12} className="ml-1" /> رفض
                    </Button>
                  </>
                )}
                {can("delete") && (
                  <Button size="sm" variant="ghost" className="text-red-500 mr-auto" onClick={() => { if (confirm("حذف؟")) { deleteMut.mutate({ id: Number(selectedApp.id) }); setDetailDialog(false); } }}>
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={msgDialog} onOpenChange={setMsgDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>إرسال {msgForm.type === "sms" ? "رسالة نصية" : "بريد"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1"><Label>المستلم</Label><Input value={msgForm.recipient} onChange={e => setMsgForm(f => ({ ...f, recipient: e.target.value }))} /></div>
            {msgForm.type === "email" && <div className="space-y-1"><Label>الموضوع</Label><Input value={msgForm.subject} onChange={e => setMsgForm(f => ({ ...f, subject: e.target.value }))} /></div>}
            <div className="space-y-1"><Label>الرسالة</Label><textarea className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background text-sm" value={msgForm.body} onChange={e => setMsgForm(f => ({ ...f, body: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMsgDialog(false)}>إلغاء</Button>
            <Button onClick={() => selectedApp && sendMsgMut.mutate({ appId: Number(selectedApp.id), type: msgForm.type, recipient: msgForm.recipient, subject: msgForm.subject || undefined, body: msgForm.body })} disabled={sendMsgMut.isPending}>
              <MessageSquare size={12} className="ml-1" /> {sendMsgMut.isPending ? "جاري..." : "إرسال"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
