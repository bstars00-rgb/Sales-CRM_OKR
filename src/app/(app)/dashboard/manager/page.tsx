"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { KpiCardWidget } from "@/components/dashboard/KpiCard";
import { MOCK_KPI_MANAGER, MOCK_CRITICAL_6 } from "@/lib/mock/kpi";
import { MOCK_TASKS } from "@/lib/mock/activities";
import { MOCK_DEALS, MOCK_STAGES } from "@/lib/mock/deals";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { formatCurrency, relativeTime } from "@/lib/utils/format";
import { CheckCircle2, Circle, AlertTriangle, ArrowRight } from "lucide-react";

export default function ManagerDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = MOCK_TASKS.filter(
    (t) => t.dueAt && new Date(t.dueAt) < today && t.status === "TODO"
  );
  const todayTasks = MOCK_TASKS.filter((t) => {
    if (!t.dueAt) return false;
    const due = new Date(t.dueAt);
    return due >= today && due < new Date(today.getTime() + 86400000) && t.status === "TODO";
  });

  const myOpenDeals = MOCK_DEALS.filter((d) => d.outcome === "OPEN");
  const stageBuckets = MOCK_STAGES.filter((s) => s.stageKind === "OPEN").map((s) => ({
    stage: s,
    deals: myOpenDeals.filter((d) => d.stageId === s.id),
    total: myOpenDeals.filter((d) => d.stageId === s.id).reduce((sum, d) => sum + d.amount, 0),
  }));

  const dormantAccounts = MOCK_ACCOUNTS.filter((a) => {
    if (!a.lastActivityAt) return false;
    const days = Math.floor((Date.now() - new Date(a.lastActivityAt).getTime()) / 86400000);
    return days >= 14 && (a.grade === "KEY_ACCOUNT" || a.grade === "GROWTH");
  });

  const keyAccounts = MOCK_ACCOUNTS.filter((a) => a.grade === "KEY_ACCOUNT").slice(0, 4);

  const c6Done = MOCK_CRITICAL_6.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">내 대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            2026 Q2 · 오늘 {today.toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      {/* Hero Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MOCK_KPI_MANAGER.map((card) => (
          <KpiCardWidget key={card.code} card={card} />
        ))}
      </div>

      {/* Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 오늘 + 지연 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>오늘 + 지연</span>
              <Badge variant="muted">{todayTasks.length + overdueTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.length > 0 && (
              <>
                <div className="text-xs font-medium text-destructive flex items-center gap-1.5">
                  🔴 지연 ({overdueTasks.length})
                </div>
                {overdueTasks.map((t) => (
                  <TaskRow key={t.id} title={t.title} priority={t.priority} muted relative={t.dueAt} />
                ))}
              </>
            )}
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 pt-1">
              🟡 오늘 ({todayTasks.length})
            </div>
            {todayTasks.map((t) => (
              <TaskRow
                key={t.id}
                title={t.title}
                priority={t.priority}
                relative={t.dueAt ? new Date(t.dueAt).toTimeString().slice(0, 5) : undefined}
              />
            ))}
            <Link href="/tasks" className="text-xs text-primary hover:underline pt-2 inline-flex items-center gap-1">
              모든 태스크 보기 <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* 파이프라인 칸반 미니 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>내 파이프라인</span>
              <Link href="/crm/deals/kanban" className="text-xs text-primary hover:underline">
                칸반 보기 →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {stageBuckets.slice(0, 8).map((b) => (
                <div key={b.stage.id} className="rounded border p-2.5 text-xs bg-muted/30">
                  <div className="font-medium leading-tight mb-1.5 truncate">{b.stage.name}</div>
                  <div className="text-lg font-bold">{b.deals.length}</div>
                  <div className="text-muted-foreground mt-0.5 truncate">
                    {b.total > 0 ? formatCurrency(b.total) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical 6 + 미접촉 + 핵심 고객사 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>🎯 Critical 6</span>
              <Badge variant={c6Done >= 5 ? "success" : c6Done >= 3 ? "warning" : "destructive"}>
                {c6Done}/6
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={(c6Done / 6) * 100} className="mb-3" />
            {MOCK_CRITICAL_6.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                {c.done ? (
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div className={c.done ? "text-muted-foreground line-through" : ""}>
                  <div className="leading-tight">{c.title}</div>
                  {c.by && <div className="text-xs text-muted-foreground mt-0.5">~ {c.by}</div>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              14일+ 미접촉 KEY/GROWTH
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dormantAccounts.length === 0 ? (
              <div className="text-sm text-muted-foreground">없음 — 잘하고 있습니다 👍</div>
            ) : (
              dormantAccounts.map((a) => (
                <Link
                  key={a.id}
                  href={`/crm/accounts/${a.id}`}
                  className="block rounded border bg-card hover:bg-accent transition-colors p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{a.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {a.grade === "KEY_ACCOUNT" ? "KEY" : "GROWTH"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {a.countryName} · {relativeTime(a.lastActivityAt)} 접촉
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>⭐ 핵심 고객사 빠른 진입</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {keyAccounts.map((a) => (
              <Link
                key={a.id}
                href={`/crm/accounts/${a.id}`}
                className="block rounded border bg-card hover:bg-accent transition-colors p-2.5"
              >
                <div className="font-medium text-sm">{a.name}</div>
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>{a.countryName} · {a.city}</span>
                  <span>3M {formatCurrency(a.revenue3M)}</span>
                </div>
              </Link>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link href="/crm/accounts">전체 고객사 →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TaskRow({
  title,
  priority,
  muted,
  relative,
}: {
  title: string;
  priority: "LOW" | "MED" | "HIGH";
  muted?: boolean;
  relative?: string;
}) {
  const dot = priority === "HIGH" ? "bg-destructive" : priority === "MED" ? "bg-warning" : "bg-muted-foreground";
  return (
    <div className={`flex items-start gap-2 text-sm ${muted ? "opacity-70" : ""}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${dot} mt-2 shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="leading-tight truncate">{title}</div>
        {relative && <div className="text-xs text-muted-foreground">{relative}</div>}
      </div>
    </div>
  );
}
