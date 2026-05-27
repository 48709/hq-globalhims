import { useState } from "react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Lock, Shield, User, Palette, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const { user } = useLocalAuth();
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [msg, setMsg] = useState("");

  const handleChangePassword = () => {
    if (pwForm.new !== pwForm.confirm) { setMsg("كلمات المرور غير متطابقة"); return; }
    if (pwForm.new.length < 6) { setMsg("كلمة المرور قصيرة جداً"); return; }
    setMsg("تم تغيير كلمة المرور بنجاح (تجريبي)");
    setPwForm({ old: "", new: "", confirm: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings size={20} className="text-primary" />
        <h1 className="text-xl font-bold">الإعدادات</h1>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="account">الحساب</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><User size={16} /> معلومات الحساب</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>الاسم</Label><Input value={user?.name || ""} readOnly /></div>
                <div className="space-y-1"><Label>اسم المستخدم</Label><Input value={user?.username || ""} readOnly /></div>
                <div className="space-y-1"><Label>الدور</Label><Input value={user?.role || ""} readOnly /></div>
                <div className="space-y-1"><Label>القسم</Label><Input value={user?.department || ""} readOnly /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Lock size={16} /> تغيير كلمة المرور</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {msg && <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm">{msg}</div>}
              <div className="space-y-1"><Label>كلمة المرور الحالية</Label><Input type="password" value={pwForm.old} onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))} /></div>
              <div className="space-y-1"><Label>كلمة المرور الجديدة</Label><Input type="password" value={pwForm.new} onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))} /></div>
              <div className="space-y-1"><Label>تأكيد كلمة المرور</Label><Input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} /></div>
              <Button onClick={handleChangePassword}>تغيير</Button>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Shield size={16} /> سجل الأمان</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">يتم تسجيل جميع محاولات تسجيل الدخول والعمليات الحساسة تلقائياً</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Palette size={16} /> المظهر</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button variant={theme === "light" ? "default" : "outline"} onClick={() => { setTheme("light"); document.documentElement.classList.remove("dark"); }}>
                  <Sun size={16} className="ml-2" /> فاتح
                </Button>
                <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => { setTheme("dark"); document.documentElement.classList.add("dark"); }}>
                  <Moon size={16} className="ml-2" /> داكن
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
