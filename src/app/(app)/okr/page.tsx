"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MOCK_OBJECTIVES } from "@/lib/mock/kpi";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { Plus, Target } from "lucide-react";

const KIND_BADGE: Record<"COMPANY" | "TEAM" | "USER", { label: string; variant: "default" | "secondary" | "muted" }> = {
  COMPANY: { label: "회사", variant: "default" },
  TEAM:    { label: "팀",   variant: "secondary" },
  USER:    { label: "개인", variant: "muted" },
};

function formatKr(metricKind: string, value: number, unit?: string) {
  if (metricKind === "CURRENCY") return formatCurrency(value, unit ?? "KRW");
  if (metricKind === "PERCENT") return formatPercent(value, 1);
  if (metricKind === "BOOLEAN") return value > 0 ? "완료" : "진행 중";
  return formatNumber(value);
}

export default function OkrPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OKR</h1>
          <p className="text-sm text-muted-foreground mt-1">2026 / Q2 · 회사 → 팀 → 개인 정렬</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/okr/tree">트리 뷰</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/okr/critical-six">Critical 6</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/okr/new"><Plus className="h-4 w-4" />새 Objective</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_OBJECTIVES.map((o) => (
          <Card key={o.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={KIND_BADGE[o.ownerKind].variant}>{KIND_BADGE[o.ownerKind].label}</Badge>
                    <span className="text-xs text-muted-foreground">{o.ownerName}</span>
                    <span className="text-xs text-muted-foreground">· {o.periodLabel}</span>
                  </div>
                  <CardTitle className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>{o.title}</span>
                  </CardTitle>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold tabular-nums">{o.progressPct}%</div>
                  <div className="text-xs text-muted-foreground">진척률</div>
                </div>
              </div>
              <Progress value={o.progressPct} className="mt-3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {o.keyResults.map((kr) => (
                  <div key={kr.id} className="flex items-center gap-4 py-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight">{kr.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                        {formatKr(kr.metricKind, kr.currentValue, kr.unit)} / {formatKr(kr.metricKind, kr.targetValue, kr.unit)}
                      </div>
                    </div>
                    <div className="w-32 shrink-0">
                      <Progress
                        value={Math.min(kr.progressPct, 100)}
                        indicatorClassName={
                          kr.progressPct >= 90 ? "bg-success" : kr.progressPct >= 60 ? "bg-warning" : "bg-destructive"
                        }
                      />
                    </div>
                    <span className="text-sm font-medium tabular-nums w-12 text-right shrink-0">{kr.progressPct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
