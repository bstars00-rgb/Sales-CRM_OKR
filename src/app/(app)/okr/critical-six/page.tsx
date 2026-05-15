"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/common/ToastContext";
import { CheckCircle2, Circle, Sparkles, Plus, Check, ArrowRight } from "lucide-react";
import { MOCK_CRITICAL_6 } from "@/lib/mock/kpi";
import { getNextWeekSuggestions } from "@/lib/okr/next-critical-six";
import { cn } from "@/lib/utils/cn";

const SOURCE_BADGE: Record<string, { label: string; variant: "destructive" | "warning" | "default" | "secondary" | "muted" }> = {
  CARRY_OVER:           { label: "이월",            variant: "warning" },
  STALE_DEAL:           { label: "정체 딜",         variant: "destructive" },
  DORMANT_KEY:          { label: "미접촉 KEY",      variant: "destructive" },
  OPEN_DEAL_HIGH_VALUE: { label: "큰 딜 진전",      variant: "default" },
  OVERDUE_TASK:         { label: "지연 태스크",     variant: "warning" },
  BRIEF:                { label: "고정",            variant: "muted" },
};

export default function CriticalSixPage() {
  const [items, setItems] = useState(MOCK_CRITICAL_6);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const toast = useToast();
  const done = items.filter((i) => i.done).length;
  const week = currentIsoWeek();

  const suggestions = useMemo(() => getNextWeekSuggestions("user-mock-1", 8), []);

  const toggle = (idx: number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, done: !it.done } : it)));
  };

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else if (next.size < 6) next.add(idx);
      return next;
    });
  };

  const confirmNextWeek = () => {
    if (selected.size < 4) {
      toast.warning("최소 4개 권장", "다음주 Critical 6는 4-6개 선정이 권장됩니다.");
      return;
    }
    toast.success(
      `다음주 Critical 6 ${selected.size}개 확정`,
      "Brief 작성 시점에 다음주 Critical 6로 전환됩니다."
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Critical 6</h1>
        <p className="text-sm text-muted-foreground mt-1">2026 W{week} · 김민수 · 이번주 우선순위</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>이번주 진척</span>
            <Badge variant={done >= 5 ? "success" : done >= 3 ? "warning" : "destructive"}>
              {done}/{items.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(done / items.length) * 100} className="mb-5" />
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`text-left rounded-lg border p-4 hover:bg-accent/30 transition-colors ${it.done ? "bg-success/5 border-success/30" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {it.done ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`font-medium ${it.done ? "line-through text-muted-foreground" : ""}`}>
                      {it.title}
                    </div>
                    {it.linkedDealName && (
                      <div className="text-xs text-muted-foreground mt-1">🔗 {it.linkedDealName}</div>
                    )}
                    {it.by && (
                      <div className="text-xs text-muted-foreground mt-1">~ {it.by}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>다음주 Critical 6 — 자동 추천</span>
            <Badge variant="muted" className="text-xs">{suggestions.length}건 제안</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-2">
            CRM 데이터 (정체 딜·미접촉 KEY·이월·지연 태스크)에서 자동 추천. 6개를 골라 확정하세요.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.map((s, i) => {
            const isSelected = selected.has(i);
            const meta = SOURCE_BADGE[s.source];
            return (
              <button
                key={i}
                onClick={() => toggleSelect(i)}
                className={cn(
                  "w-full text-left rounded-lg border p-4 transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-accent/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {isSelected ? (
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium">{s.title}</span>
                      <Badge variant={meta.variant} className="text-[10px]">{meta.label}</Badge>
                      {s.priority === "HIGH" && (
                        <Badge variant="destructive" className="text-[10px]">HIGH</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.reason}</div>
                    {s.by && (
                      <div className="text-xs text-muted-foreground mt-1">~ {s.by}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              선택됨: <span className="font-medium text-foreground">{selected.size}</span> / 권장 6개
            </div>
            <Button
              onClick={confirmNextWeek}
              disabled={selected.size === 0}
            >
              다음주 Critical 6 확정 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          💡 카드를 클릭해서 완료/미완료를 토글합니다. 일요일 21시까지 다음주 Critical 6은
          Weekly Brief 작성과 함께 자동 생성됩니다.
        </CardContent>
      </Card>
    </div>
  );
}

function currentIsoWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
