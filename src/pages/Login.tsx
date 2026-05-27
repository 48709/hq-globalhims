import { useState } from "react";
import { useNavigate } from "react-router";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useAuth as useOAuthAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, LogIn, Shield, User, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login: localLogin } = useLocalAuth();
  const { user: oauthUser } = useOAuthAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in via OAuth
  if (oauthUser) {
    navigate("/dashboard");
    return null;
  }

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await localLogin(username, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تسجيل الدخول";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    const { VITE_KIMI_AUTH_URL, VITE_APP_ID } = import.meta.env;
    if (!VITE_KIMI_AUTH_URL || !VITE_APP_ID) {
      setError("OAuth غير مكون");
      return;
    }
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);
    const url = new URL(`${VITE_KIMI_AUTH_URL}/api/oauth/authorize`);
    url.searchParams.set("client_id", VITE_APP_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "profile");
    url.searchParams.set("state", state);
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-bold">نظام إدارة الموارد البشرية</h1>
          <p className="text-sm text-muted-foreground mt-1">HR Budget & Recruitment System</p>
        </div>

        <Card className="border border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-center">تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="local" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="local">حساب محلي</TabsTrigger>
                <TabsTrigger value="oauth">Kimi OAuth</TabsTrigger>
              </TabsList>

              <TabsContent value="local">
                <form onSubmit={handleLocalLogin} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <div className="relative">
                      <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="أدخل اسم المستخدم"
                        className="pr-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        جاري الدخول...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn size={16} />
                        دخول النظام
                      </span>
                    )}
                  </Button>
                  <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield size={12} />
                      <span>النظام محمي — للحصول على بيانات الدخول راجع مدير النظام</span>
                    </div>
                    <div className="text-[10px] opacity-60">admin / Admin@2025</div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="oauth">
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    سجل الدخول باستخدام حساب Kimi الخاص بك
                  </p>
                  <Button onClick={handleOAuthLogin} className="w-full" variant="outline">
                    <span className="flex items-center gap-2">
                      <Shield size={16} />
                      تسجيل الدخول بـ Kimi
                    </span>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>أنت لست مجرد موظف، أنت جزء أساسي من نجاح الفريق</p>
          <p className="mt-1 opacity-50">v2.0 — Ministry of Health · Oman</p>
        </div>
      </div>
    </div>
  );
}
