"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/common/ToastContext";
import { getObjectivesWithAutoProgress } from "@/lib/okr/auto-progress";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { ArrowLeft, Target, Sparkles, Plus, Check, CircleDashed, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const KIND_BADGE: Record<"COMPANY" | "TEAM" | "USER", { label: string; variant: "default" | "secondary" | "muted" }> = {
  COMPANY: { label: "회사", variant: "default" },
  TEAM:    { label: "팀",   variant: "secondary" },
  USER:    { label: "개인", variant: "muted" },
};

const AP_STATUS_META = {
  TODO:    { label: "TODO",    icon: CircleDashed,  variant: "muted" as const },
  DOING:   { label: "DOING",   icon: CircleDashed,  variant: "warning" as const },
  DONE:    { label: "DONE",    icon: Check,         variant: "success" as const },
  BLOCKED: { label: "BLOCKED", icon: AlertCircle,   variant: "destructive" as const },
};

interface ActionPlan {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: keyof typeof AP_STATUS_META;
  note?: string;
}

// 데모 시드 — Objective별 Action Plan
const SEED_ACTION_PLANS: Record<string, ActionPlan[]> = {
  "obj-co-1": [
    { id: "ap-1", title: "핵심 5개국 시장 매핑 + 우선순위", assignee: "박CEO",   dueDate: "2026-05-20", status: "DONE" },
    { id: "ap-2", title: "GP율 16% 달성 위한 단가 협상 가이드", assignee: "박상무", dueDate: "2026-06-01", status: "DOING" },
    { id: "ap-3", title: "분기 회고 + Q3 OKR 초안 준비",      assignee: "박상무", dueDate: "2026-06-15", status: "TODO" },
  ],
  "obj-co-2": [
    { id: "ap-4", title: "API 파트너 후보 8곳 발굴 리스트",  assignee: "이영준",  dueDate: "2026-05-25", status: "DOING" },
    { id: "ap-5", title: "API 통합 평균 60일 단축 프로세스",   assignee: "이영준",  dueDate: "2026-06-30", status: "TODO" },
  ],
  "obj-team-kr": [
    { id: "ap-6", title: "ABC·Hana·Mode Tour·여기어때 분기 갱신 협상", assignee: "박상무", dueDate: "2026-06-15", status: "DOING" },
    { id: "ap-7", title: "JKL Travel 신규 분기 거래 클로징",         assignee: "김민수", dueDate: "2026-06-30", status: "TODO" },
  ],
  "obj-user-km": [
    { id: "ap-8", title: "ABC Travel Q4 객실 공급 협상 마무리",   assignee: "김민수", dueDate: "2026-06-15", status: "DOING",
      note: "응웬 사장 가격 결정 대기. API 진척 함께 가져가는 카드 활용." },
    { id: "ap-9", title: "JKL Travel 결정권자 미팅 추가 2회",     assignee: "김민수", dueDate: "2026-05-31", status: "TODO" },
    { id: "ap-10", title: "XYZ DMC 결제 조건 이슈 해소",          assignee: "김민수", dueDate: "2026-05-20", status: "BLOCKED",
      note: "임원 동석 미팅 잡혀야 진전 가능" },
  ],
};

export function ObjectiveDetailClient({ id }: { id: string }) {
  const version = useSalesVersion();
  const toast = useToast();
  const objectives = useMemo(() => getObjectivesWithAutoProgress(), [version]);
  const obj = objectives.find((o) => o.id === id);
  if (!obj) notFound();

  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(SEED_ACTION_PLANS[id] ?? []);
  const [newApTitle, setNewApTitle] = useState("");

  const kindInfo = KIND_BADGE[obj.ownerKind];

  const addActionPlan = () => {
    if (!newApTitle.trim()) return;
    setActionPlans((prev) => [
      ...prev,
      {
        id: `ap-new-${Date.now()}`,
        title: newApTitle.trim(),
        assignee: obj.ownerName,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        status: "TODO",
      },
    ]);
    setNewApTitle("");
    toast.success("Action Plan 추가됨");
  };

  const cycleStatus = (apId: string) => {
    const cycle: ActionPlan["status"][] = ["TODO", "DOING", "DONE"];
    setActionPlans((prev) =>
      prev.map((ap) => {
        if (ap.id !== apId) return ap;
        const i = cycle.indexOf(ap.status);
        return { ...ap, status: cycle[(i + 1) % cycle.length] };
      })
    );
  };

  const doneCount = actionPlans.filter((ap) => ap.status === "DONE").length;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/okr" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />OKR
        </Link>
        <span>/</span>
        <span className="text-foreground">Objective 상세</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant={kindInfo.variant}>{kindInfo.label}</Badge>
                <span className="text-xs text-muted-foreground">{obj.ownerName}</span>
                <span className="text-xs text-muted-foreground">· {obj.periodLabel}</span>
              </div>
              <CardTitle className="flex items-start gap-2">
                <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>{obj.title}</span>
              </CardTitle>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-bold tabular-nums">{obj.progressPct}%</div>
              <div className="text-xs text-muted-foreground">진척률</div>
            </div>
          </div>
          <Progress value={obj.progressPct} className="mt-3" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Results ({obj.keyResults.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {obj.keyResults.map((kr) => (
              <div key={kr.id} className="border-b last:border-0 pb-3 last:pb-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium leading-tight flex items-center gap-1.5 flex-wrap">
                      {kr.title}
                      {kr.progressSource === "AUTO" && (
                        <span
                          className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary text-[10px] px-1.5 py-0.5"
                          title="CRM 데이터에서 자동 계산"
                        >
                          <Sparkles className="h-2.5 w-2.5" />AUTO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 tabular-nums">
                      {formatKr(kr.metricKind, kr.currentValue, kr.unit)} / {formatKr(kr.metricKind, kr.targetValue, kr.unit)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn(
                      "text-lg font-bold tabular-nums",
                      kr.progressPct >= 90 ? "text-success" : kr.progressPct >= 60 ? "text-warning" : "text-destructive"
                    )}>
                      {kr.progressPct}%
                    </div>
                  </div>
                </div>
                <Progress
                  value={Math.min(kr.progressPct, 100)}
                  indicatorClassName={
                    kr.progressPct >= 90 ? "bg-success" : kr.progressPct >= 60 ? "bg-warning" : "bg-destructive"
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Action Plans ({doneCount}/{actionPlans.length} 완료)</span>
            <Badge variant="muted" className="text-xs">데모 시드</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionPlans.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">아직 Action Plan이 없습니다.</div>
          ) : (
            actionPlans.map((ap) => {
              const meta = AP_STATUS_META[ap.status];
              const Icon = meta.icon;
              return (
                <div key={ap.id} className="rounded-md border bg-card p-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => cycleStatus(ap.id)}
                      className={cn(
                        "shrink-0 mt-0.5 rounded-full p-1 transition-colors",
                        ap.status === "DONE" && "bg-success text-success-foreground",
                        ap.status === "DOING" && "bg-warning/20 text-warning",
                        ap.status === "TODO" && "bg-muted text-muted-foreground hover:bg-accent",
                        ap.status === "BLOCKED" && "bg-destructive/20 text-destructive"
                      )}
                      aria-label="상태 변경"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-medium text-sm", ap.status === "DONE" && "line-through text-muted-foreground")}>
                        {ap.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                        <span>👤 {ap.assignee}</span>
                        <span>📅 {ap.dueDate}</span>
                        <Badge variant={meta.variant} className="text-[10px]">{meta.label}</Badge>
                      </div>
                      {ap.note && (
                        <div className="text-xs text-muted-foreground mt-1.5 italic">{ap.note}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Input
              value={newApTitle}
              onChange={(e) => setNewApTitle(e.target.value)}
              placeholder="새 Action Plan 추가..."
              onKeyDown={(e) => { if (e.key === "Enter") addActionPlan(); }}
            />
            <Button onClick={addActionPlan} disabled={!newApTitle.trim()} size="sm">
              <Plus className="h-4 w-4" />추가
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          💡 KR의 ✨ AUTO 표시는 CRM 데이터에서 자동 진척. Action Plan 상태 버튼을 클릭해서 TODO → DOING → DONE 순환.
        </CardContent>
      </Card>
    </div>
  );
}

function formatKr(metricKind: string, value: number, unit?: string) {
  if (metricKind === "CURRENCY") return formatCurrency(value, unit ?? "KRW");
  if (metricKind === "PERCENT") return formatPercent(value, 1);
  if (metricKind === "BOOLEAN") return value > 0 ? "완료" : "진행 중";
  return formatNumber(value);
}
