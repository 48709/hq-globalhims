import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-primary">404</div>
        <h1 className="text-xl font-semibold">الصفحة غير موجودة</h1>
        <p className="text-sm text-muted-foreground">الصفحة التي تبحث عنها غير متوفرة</p>
        <Button asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Home size={16} />
            العودة للرئيسية
          </Link>
        </Button>
      </div>
    </div>
  );
}
