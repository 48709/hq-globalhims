import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { ALL_TABS } from "@/types";
import {
  LayoutDashboard, Wallet, Target, Users, GitBranch, Stethoscope,
  FolderKanban, Bell, BarChart3, Shield, Settings, Monitor,
  ChevronLeft, LogOut, Menu, X, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Wallet: <Wallet size={18} />,
  Target: <Target size={18} />,
  Users: <Users size={18} />,
  GitBranch: <GitBranch size={18} />,
  Stethoscope: <Stethoscope size={18} />,
  FolderKanban: <FolderKanban size={18} />,
  Bell: <Bell size={18} />,
  BarChart3: <BarChart3 size={18} />,
  Shield: <Shield size={18} />,
  Settings: <Settings size={18} />,
  Monitor: <Monitor size={18} />,
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-amber-500",
  hr_manager: "bg-emerald-500",
  planner: "bg-blue-500",
  analyst: "bg-purple-500",
  viewer: "bg-gray-500",
  recruiter: "bg-cyan-500",
  security_officer: "bg-red-500",
  budget_officer: "bg-orange-500",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  hr_manager: "مدير الموارد البشرية",
  planner: "مدير التخطيط",
  analyst: "محلل بيانات",
  viewer: "مستخدم عرض",
  recruiter: "مسؤول التوظيف",
  security_officer: "ضابط أمن",
  budget_officer: "مسؤول الموازنة",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, canTab } = useLocalAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentTab = location.pathname.replace("/", "") || "dashboard";
  const filteredTabs = ALL_TABS.filter(t => canTab(t.id) || t.id === "dashboard" || user?.role === "admin");

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ar-OM", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="flex h-screen bg-background overflow-hidden" dir="rtl">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 bg-card border-l border-border flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        } ${mobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              HR
            </div>
            {sidebarOpen && (
              <span className="font-bold text-sm truncate">نظام الموارد البشرية</span>
            )}
          </div>
          <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileMenuOpen(false); }}
            className="lg:hidden text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {filteredTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { navigate(`/${tab.id}`); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              } ${!sidebarOpen ? "justify-center" : ""}`}
              title={tab.label}
            >
              {ICON_MAP[tab.icon]}
              {sidebarOpen && <span className="truncate">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-border p-3 flex-shrink-0">
          {user && sidebarOpen && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className={`w-9 h-9 rounded-full ${ROLE_COLORS[user.role] || "bg-gray-500"} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role] || user.role}</p>
              </div>
            </div>
          )}
          {user && !sidebarOpen && (
            <div className={`w-9 h-9 rounded-full ${ROLE_COLORS[user.role] || "bg-gray-500"} flex items-center justify-center text-white font-bold text-sm mx-auto mb-2`}>
              {user.name?.charAt(0) || "U"}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={logout}
          >
            <LogOut size={14} className={sidebarOpen ? "ml-2" : ""} />
            {sidebarOpen && <span>خروج</span>}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-accent text-muted-foreground"
            >
              <ChevronLeft size={18} className={`transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left hidden sm:block">
              <div className="text-xs font-mono text-primary">{timeStr}</div>
              <div className="text-[10px] text-muted-foreground">{dateStr}</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} />
              <span className="hidden sm:inline">جلسة نشطة</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
