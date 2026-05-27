import { Routes, Route, Navigate } from "react-router";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import AppLayout from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BudgetPage from "./pages/BudgetPage";
import PlanningPage from "./pages/PlanningPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import WorkflowPage from "./pages/WorkflowPage";
import DoctorsPage from "./pages/DoctorsPage";
import ProjectsPage from "./pages/ProjectsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import StatsPage from "./pages/StatsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import DisplayPage from "./pages/DisplayPage";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useLocalAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
      <Route path="/planning" element={<ProtectedRoute><PlanningPage /></ProtectedRoute>} />
      <Route path="/recruitment" element={<ProtectedRoute><RecruitmentPage /></ProtectedRoute>} />
      <Route path="/workflow" element={<ProtectedRoute><WorkflowPage /></ProtectedRoute>} />
      <Route path="/doctors" element={<ProtectedRoute><DoctorsPage /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/display" element={<DisplayPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
