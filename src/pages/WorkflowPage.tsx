import { trpc } from "@/providers/trpc";
import { STATUS_LABELS, STAGE_LABELS, STAGE_ORDER } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, CheckCircle, Clock, ArrowRight } from "lucide-react";

export default function WorkflowPage() {
  const { data: apps, isLoading } = trpc.recruitment.list.useQuery({});
  const utils = trpc.useUtils();
  const advanceMut = trpc.recruitment.advanceStage.useMutation({ onSuccess: () => utils.recruitment.list.invalidate() });

  const stages = STAGE_ORDER.map(stage => ({
    id: stage,
    label: STAGE_LABELS[stage],
    apps: apps?.filter((a: Record<string, unknown>) => a.currentStage === stage) || [],
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch size={20} className="text-primary" />
        <h1 className="text-xl font-bold">مسار العمل</h1>
        <span className="text-sm text-muted-foreground mr-2">(مكتب الأمن → التعيينات → الدراسات → الموازنة → شؤون الموظفين)</span>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {stages.map((stage, stageIdx) => (
            <div key={stage.id} className="space-y-2">
              {/* Stage Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {stageIdx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{stage.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stage.apps.length} معاملة</p>
                </div>
                {stageIdx < stages.length - 1 && <ArrowRight size={14} className="text-muted-foreground hidden lg:block" />}
              </div>

              {/* Apps in stage */}
              <div className="space-y-2">
                {stage.apps.map((app: Record<string, unknown>) => (
                  <Card key={String(app.id)} className="border-border/50 hover:border-primary/20 transition-all hover:shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {String(app.fullName || "?").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{String(app.fullName || "—")}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{String(app.position || "—")}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] mb-2">{STATUS_LABELS[String(app.status) || ""] || String(app.status)}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-[10px] bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                        onClick={() => advanceMut.mutate({ id: Number(app.id), stage: stage.id, decision: "approve" })}
                        disabled={advanceMut.isPending}
                      >
                        <CheckCircle size={10} className="ml-1" /> اعتماد ونقل
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {stage.apps.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                    <Clock size={16} className="mx-auto mb-1 opacity-50" />
                    لا توجد معاملات
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
