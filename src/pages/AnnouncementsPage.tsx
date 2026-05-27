import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2, Megaphone, AlertTriangle, Info } from "lucide-react";

const PRIORITY_CONFIG = {
  high: { label: "عاجل", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: <AlertTriangle size={14} /> },
  medium: { label: "متوسط", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: <Megaphone size={14} /> },
  low: { label: "عادي", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <Info size={14} /> },
};

export default function AnnouncementsPage() {
  const { can } = useLocalAuth();
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", priority: "medium" as string });

  const utils = trpc.useUtils();
  const { data: announcements } = trpc.system.announcementList.useQuery();
  const createMut = trpc.system.announcementCreate.useMutation({ onSuccess: () => { utils.system.announcementList.invalidate(); setDialog(false); setForm({ title: "", content: "", priority: "medium" as "high" | "medium" | "low" }); } });
  const deleteMut = trpc.system.announcementDelete.useMutation({ onSuccess: () => utils.system.announcementList.invalidate() });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-primary" />
          <h1 className="text-xl font-bold">إعلانات الوظائف</h1>
        </div>
        {can("write") && <Button size="sm" onClick={() => setDialog(true)}><Plus size={14} className="ml-1" /> إعلان جديد</Button>}
      </div>
      <div className="space-y-3">
        {announcements && announcements.length > 0 ? announcements.map((ann: Record<string, unknown>) => (
          <Card key={String(ann.id)} className="border-border/50 hover:border-primary/20 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg shrink-0 ${PRIORITY_CONFIG[String(ann.priority) as keyof typeof PRIORITY_CONFIG]?.color.split(" ")[0] || "bg-muted"}`}>
                    {PRIORITY_CONFIG[String(ann.priority) as keyof typeof PRIORITY_CONFIG]?.icon || <Info size={14} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{String(ann.title || "—")}</h3>
                      <Badge variant="outline" className={`text-[10px] ${PRIORITY_CONFIG[String(ann.priority) as keyof typeof PRIORITY_CONFIG]?.color || ""}`}>
                        {PRIORITY_CONFIG[String(ann.priority) as keyof typeof PRIORITY_CONFIG]?.label || String(ann.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{String(ann.content || "—")}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{ann.createdAt ? String(ann.createdAt).slice(0, 10) : ""}</p>
                  </div>
                </div>
                {can("delete") && (
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 shrink-0" onClick={() => { if (confirm("حذف؟")) deleteMut.mutate({ id: Number(ann.id) }); }}>
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )) : <p className="text-center text-muted-foreground py-8">لا توجد إعلانات</p>}
      </div>
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>إعلان جديد</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-4">
            <div className="space-y-1"><Label>العنوان *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1"><Label>المحتوى *</Label><textarea className="w-full min-h-[120px] p-2 rounded-md border border-input bg-background text-sm" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <div className="space-y-1"><Label>الأولوية</Label>
              <select className="w-full p-2 rounded-md border border-input bg-background text-sm" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">عادي</option><option value="medium">متوسط</option><option value="high">عاجل</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialog(false)}>إلغاء</Button>
            <Button onClick={() => createMut.mutate(form as any)} disabled={!form.title || !form.content || createMut.isPending}>{createMut.isPending ? "جاري..." : "نشر"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
