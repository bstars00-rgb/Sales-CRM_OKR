"use client";

import Link from "next/link";
import { useMemo, useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/useSession";
import { type KpiSnapshot } from "@/lib/dashboard/ytd-kpi";
import { syncYtdKpi, formatAsOf, type KpiSyncResult } from "@/lib/ellis/metrics-sync";
import { getDailyCritical, PRIORITY_BADGE } from "@/lib/dashboard/daily-critical";
import { MOCK_DEALS, MOCK_STAGES } from "@/lib/mock/deals";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency, formatNumber, relativeTime } from "@/lib/utils/format";
import { AlertTriangle, ArrowRight, TrendingUp, TrendingDown, Sparkles, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function ManagerDashboardPage() {
  const session = useSession();
  const version = useSalesVersion();
  void version;

  const userId = session?.id ?? "user-mock-1";
  const role = session?.role;

  const today = new Date();

  // ── 5종 KPI — ELLIS 동기화 (mock fallback)
  const [kpiResult, setKpiResult] = useState<KpiSyncResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchKpi = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await syncYtdKpi({ userId, role });
      setKpiResult(result);
    } finally {
      setRefreshing(false);
    }
  }, [userId, role]);

  useEffect(() => {
    fetchKpi();
  }, [fetchKpi, version]);

  const kpis = kpiResult?.metrics ?? [];

  // ── 데일리 크리티컬
  const daily = useMemo(() => getDailyCritical(userId, role, 6), [userId, role, version]);

  // ── 파이프라인 (본인 OPEN 딜)
  const myAccountIds = useMemo(() => {
    if (role === "DIRECTOR" || role === "EXECUTIVE") return null; // 전체
    return new Set(MOCK_ACCOUNTS.filter((a) => a.ownerUserId === userId).map((a) => a.id));
  }, [userId, role]);

  const myOpenDeals = useMemo(() => {
    const all = MOCK_DEALS.filter((d) => d.outcome === "OPEN");
    if (!myAccountIds) return all;
    return all.filter((d) => myAccountIds.has(d.accountId) || d.ownerUserId === userId);
  }, [myAccountIds, userId]);

  const openStages = MOCK_STAGES.filter((s) => s.stageKind === "OPEN");
  const stageBuckets = openStages.map((s) => {
    const deals = myOpenDeals.filter((d) => d.stageId === s.id);
    return {
      stage: s,
      count: deals.length,
      total: deals.reduce((sum, d) => sum + d.amount, 0),
      weighted: deals.reduce((sum, d) => sum + (d.amount * d.probabilityPct) / 100, 0),
    };
  });
  const pipelineTotal = myOpenDeals.reduce((s, d) => s + d.amount, 0);
  const pipelineWeighted = myOpenDeals.reduce((s, d) => s + (d.amount * d.probabilityPct) / 100, 0);

  // ── 14일+ 미접촉 KEY/GROWTH
  const dormantAccounts = MOCK_ACCOUNTS
    .filter((a) => {
      if (myAccountIds && !myAccountIds.has(a.id)) return false;
      if (a.grade !== "KEY_ACCOUNT" && a.grade !== "GROWTH") return false;
      const days = Math.floor((Date.now() - new Date(a.lastActivityAt).getTime()) / 86400000);
      return days >= 14;
    })
    .sort((a, b) =>
      new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime()
    )
    .slice(0, 6);

  // ── 핵심 고객사 (KEY 등급, 본인 담당 + YTD 거래액 순)
  const keyAccounts = MOCK_ACCOUNTS
    .filter((a) => {
      if (a.grade !== "KEY_ACCOUNT") return false;
      if (myAccountIds && !myAccountIds.has(a.id)) return false;
      return true;
    })
    .sort((a, b) => b.totalRevenueYtd - a.totalRevenueYtd)
    .slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">내 대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            2026 YTD (체크아웃 기준) · 오늘 {today.toLocaleDateString("ko-KR")} ·{" "}
            {session?.name && <span>{session.name}님</span>}
          </p>
        </div>
      </div>

      {/* 데이터 동기화 상태 바 */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-2.5 px-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">데이터 기준:</span>
            <span className="font-medium">
              {kpiResult ? formatAsOf(kpiResult) : "로딩 중..."}
            </span>
            {kpiResult && (
              <Badge variant={kpiResult.source === "ELLIS" ? "success" : "muted"} className="text-[9px] ml-1">
                {kpiResult.source === "ELLIS" ? "● ELLIS 실데이터" : "○ Mock"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground hidden md:inline">
              매일 04:00 KST 자동 동기화
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchKpi}
              disabled={refreshing}
              className="h-7 text-xs"
              aria-label="새로고침"
            >
              <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
              {refreshing ? "동기화 중..." : "새로고침"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 5종 KPI 카드 (체크아웃 기준 YTD) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.length === 0 ? (
          // 로딩 스켈레톤 (5개)
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-2">
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-7 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-1.5 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpis.map((kpi) => <KpiCard key={kpi.code} kpi={kpi} />)
        )}
      </div>

      {/* 2열: 데일리 크리티컬 + 파이프라인 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 데일리 크리티컬 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                데일리 크리티컬
              </span>
              <Badge variant={daily.length === 0 ? "success" : "muted"} className="text-xs">
                {daily.length === 0 ? "0건" : `${daily.length}건`}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">오늘 반드시 처리할 일</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {daily.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                ✨ 오늘 처리할 긴급 건 없음 — 잘하고 있습니다 👍
              </div>
            ) : (
              daily.map((item) => {
                const pmeta = PRIORITY_BADGE[item.priority];
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-md border bg-card hover:bg-accent/50 transition-colors p-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-medium leading-tight truncate">
                            {item.title}
                          </span>
                          <Badge variant={pmeta.tone} className="text-[9px] shrink-0">
                            {pmeta.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{item.reason}</div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* 파이프라인 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span>내 파이프라인</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">
                  전체 <b className="text-foreground tabular-nums">{formatCurrency(pipelineTotal)}</b>
                </span>
                <span className="text-muted-foreground">
                  가중 <b className="text-primary tabular-nums">{formatCurrency(pipelineWeighted)}</b>
                </span>
              </div>
            </CardTitle>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                OPEN {myOpenDeals.length}건 · 단계별 분포
              </span>
              <Link href="/crm/forecast" className="text-primary hover:underline inline-flex items-center gap-1">
                Forecast <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {stageBuckets.map((b) => (
                <Link
                  key={b.stage.id}
                  href={`/crm/deals/kanban`}
                  className="rounded border p-2.5 text-xs bg-muted/30 hover:bg-accent/40 transition-colors block"
                >
                  <div className="font-medium leading-tight mb-1 truncate" title={b.stage.name}>
                    {b.stage.name}
                  </div>
                  <div className="text-lg font-bold tabular-nums">{b.count}</div>
                  <div className="text-muted-foreground mt-0.5 tabular-nums truncate">
                    {b.total > 0 ? formatCurrency(b.total) : "—"}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3열: 미접촉 + 핵심 고객사 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                고객사 미접촉 (14일+)
              </span>
              <Badge variant={dormantAccounts.length === 0 ? "success" : "warning"}>
                {dormantAccounts.length}건
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">KEY/GROWTH 등급 · 가장 오래된 순</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {dormantAccounts.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">없음 — 잘하고 있습니다 👍</div>
            ) : (
              dormantAccounts.map((a) => {
                const days = Math.floor((Date.now() - new Date(a.lastActivityAt).getTime()) / 86400000);
                return (
                  <Link
                    key={a.id}
                    href={`/crm/accounts/${a.id}`}
                    className="block rounded border bg-card hover:bg-accent/40 transition-colors p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{a.name}</span>
                      <Badge variant={days >= 30 ? "destructive" : "warning"} className="text-[10px]">
                        {days}일
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between gap-2">
                      <span>
                        {a.countryName} · {a.grade === "KEY_ACCOUNT" ? "KEY" : "GROWTH"} · 담당 {a.ownerName}
                      </span>
                      <span className="tabular-nums shrink-0">{relativeTime(a.lastActivityAt)} 접촉</span>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span>⭐ 핵심 고객사 빠른 진입</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/crm/accounts">전체 <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </CardTitle>
            <p className="text-xs text-muted-foreground">KEY 등급 · YTD 거래액 상위</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {keyAccounts.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">담당 KEY 고객사 없음</div>
            ) : (
              keyAccounts.map((a) => (
                <Link
                  key={a.id}
                  href={`/crm/accounts/${a.id}`}
                  className="block rounded border bg-card hover:bg-accent/40 transition-colors p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{a.name}</span>
                    <span className="text-xs tabular-nums">{formatCurrency(a.totalRevenueYtd)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between gap-2">
                    <span>{a.countryName} · {a.city}</span>
                    <span>YTD GP {formatCurrency(a.totalGpYtd)}</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ kpi }: { kpi: KpiSnapshot }) {
  const fmt = (n: number) => {
    if (kpi.unit === "KRW") return formatCurrency(n);
    if (kpi.unit === "RN") return `${formatNumber(n)} RN`;
    return formatNumber(n);
  };

  const yoyPositive = kpi.yoyPct >= 0;
  const achPct = Math.round(kpi.achievementPct);
  const onTrack = achPct >= 95;
  const behind = achPct < 80;

  return (
    <Card className={cn(
      "transition-all",
      onTrack && "border-success/40",
      behind && "border-destructive/40",
    )}>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
        <div className="text-2xl font-bold tabular-nums mb-1">{fmt(kpi.current)}</div>

        {/* YoY */}
        <div className={cn(
          "text-xs flex items-center gap-1 mb-2",
          yoyPositive ? "text-success" : "text-destructive",
        )}>
          {yoyPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span className="tabular-nums">
            YoY {yoyPositive ? "+" : ""}{kpi.yoyPct.toFixed(1)}%
          </span>
          <span className="text-muted-foreground/70 text-[10px]">
            vs {fmt(kpi.lastYear)}
          </span>
        </div>

        {/* KPI 진척률 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">YTD 진척률</span>
            <span className={cn(
              "tabular-nums font-semibold",
              onTrack ? "text-success" : behind ? "text-destructive" : "text-warning",
            )}>
              {achPct}%
            </span>
          </div>
          <div className="h-1.5 bg-muted/40 rounded overflow-hidden">
            <div
              className={cn(
                "h-full rounded",
                onTrack ? "bg-success" : behind ? "bg-destructive" : "bg-warning",
              )}
              style={{ width: `${Math.min(achPct, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground tabular-nums">
            목표 {fmt(kpi.annualTarget)} / YTD {fmt(kpi.ytdTargetPct)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
