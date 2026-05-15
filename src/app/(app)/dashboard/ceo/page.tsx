"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCardWidget } from "@/components/dashboard/KpiCard";
import { LoadingCard } from "@/components/common/StateCards";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import {
  getCompanyRevenueTrend, getCompanyCountryRevenue, getCompanyYtdTotals, getTopAccounts,
} from "@/lib/mock/revenue";
import { getCompanyBrief } from "@/lib/brief/aggregate";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

// Recharts (~110kB)을 lazy load
const RevenueTrendChart = dynamic(
  () => import("@/components/dashboard/CeoCharts").then((m) => m.RevenueTrendChart),
  { ssr: false, loading: () => <LoadingCard label="차트 로딩 중..." className="h-[280px]" /> }
);
const CountryBarChart = dynamic(
  () => import("@/components/dashboard/CeoCharts").then((m) => m.CountryBarChart),
  { ssr: false, loading: () => <LoadingCard label="차트 로딩 중..." className="h-[280px]" /> }
);

export default function CeoDashboardPage() {
  const version = useSalesVersion();
  const trend = useMemo(getCompanyRevenueTrend, [version]);
  const countries = useMemo(getCompanyCountryRevenue, [version]);
  const ytd = useMemo(getCompanyYtdTotals, [version]);
  const topAccounts = useMemo(() => getTopAccounts(15), [version]);
  const brief = useMemo(getCompanyBrief, [version]);

  const apiLive = useMemo(
    () => MOCK_DEALS.filter((d) => d.dealType === "API_INTEGRATION" && d.outcome === "WON").length + 18,
    [version]
  );
  const newAccounts = useMemo(
    () => MOCK_ACCOUNTS.filter((a) => {
      const days = (Date.now() - new Date(a.firstContactDate).getTime()) / 86400000;
      return days < 90 && a.grade !== "DORMANT" && a.grade !== "LOW_POTENTIAL";
    }).length,
    [version]
  );

  // Q2 목표 (시뮬레이션) — YTD 기준으로 비례 추정
  const quarterTarget = 15_800_000_000;
  const gpTarget = 2_500_000_000;
  const newTarget = 36;
  const apiTarget = 24;

  const kpiCards = [
    { code: "REVENUE",   label: "회사 매출 (Q2)",     unit: "KRW", current: ytd.revenue,         target: quarterTarget, achievementPct: Math.round((ytd.revenue / quarterTarget) * 100), yoyDelta: 32 },
    { code: "GP",        label: "회사 GP (Q2)",       unit: "KRW", current: ytd.gp,              target: gpTarget,      achievementPct: Math.round((ytd.gp / gpTarget) * 100) },
    { code: "GP_RATE",   label: "GP율",               unit: "%",   current: ytd.gpRate,          target: 16,            achievementPct: Math.round((ytd.gpRate / 16) * 100) },
    { code: "NEW",       label: "신규 활성",          unit: "건",  current: newAccounts,         target: newTarget,     achievementPct: Math.round((newAccounts / newTarget) * 100) },
    { code: "API_LIVE",  label: "API 라이브 (누적)", unit: "건",  current: apiLive,             target: apiTarget,     achievementPct: Math.round((apiLive / apiTarget) * 100) },
  ];

  // Risk alerts — Brief의 dormant/stale 합산
  const riskAlerts = useMemo(() => {
    const out: { kind: string; title: string; severity: "HIGH" | "MID" }[] = [];

    // DORMANT KEY/GROWTH 고객사
    for (const a of MOCK_ACCOUNTS) {
      if (a.grade !== "KEY_ACCOUNT" && a.grade !== "GROWTH") continue;
      const days = Math.floor((Date.now() - new Date(a.lastActivityAt).getTime()) / 86400000);
      if (days >= 60) {
        out.push({
          kind: "DORMANT",
          title: `${a.name} — ${days}일 미접촉 ${a.grade === "KEY_ACCOUNT" ? "KEY" : "GROWTH"}`,
          severity: days >= 90 ? "HIGH" : "MID",
        });
      }
    }
    // 정체 딜 14일+
    for (const d of MOCK_DEALS) {
      if (d.outcome !== "OPEN") continue;
      if (d.daysInStage >= 14) {
        out.push({
          kind: "STALE",
          title: `${d.name} — ${d.daysInStage}일 정체 (${d.stageName})`,
          severity: d.daysInStage >= 21 ? "HIGH" : "MID",
        });
      }
    }
    return out
      .sort((a, b) => (a.severity === "HIGH" ? -1 : 1))
      .slice(0, 8);
  }, [version]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">회사 대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            2026 Q2 · 자동 집계 · YTD {formatCurrency(ytd.revenue)}
          </p>
        </div>
        <Badge variant="muted" className="text-xs">실시간 mock 합산</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map((card) => (
          <KpiCardWidget key={card.code} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>월별 거래액 추이 (YoY)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>국가별 실적 ({countries.length}개국)</CardTitle>
          </CardHeader>
          <CardContent>
            <CountryBarChart
              data={countries.map((c) => ({
                country: `${c.flag} ${c.countryName}`,
                revenue: c.revenue,
                delta: c.delta,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>핵심 고객사 TOP {topAccounts.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">고객사</th>
                    <th className="text-right py-2 font-medium">YTD 매출</th>
                    <th className="text-right py-2 font-medium">YTD GP</th>
                    <th className="text-right py-2 font-medium">추세</th>
                  </tr>
                </thead>
                <tbody>
                  {topAccounts.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-accent/30">
                      <td className="py-2.5">
                        <span className="mr-2">{a.countryFlag}</span>
                        <Link href={`/crm/accounts/${a.id}`} className="font-medium hover:underline">
                          {a.name}
                        </Link>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{formatCurrency(a.revenueYtd)}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatCurrency(a.gpYtd)}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={cn(
                            a.trend === "up" && "text-success",
                            a.trend === "down" && "text-destructive",
                            a.trend === "flat" && "text-muted-foreground"
                          )}
                        >
                          {a.trend === "up" ? "▲" : a.trend === "down" ? "▼" : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>🚨 위험 신호</span>
                <Badge variant="destructive" className="text-xs">{riskAlerts.length}건</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {riskAlerts.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm border-b last:border-0 py-2">
                  <Badge
                    variant={r.severity === "HIGH" ? "destructive" : "warning"}
                    className="text-xs shrink-0 mt-0.5"
                  >
                    {r.kind}
                  </Badge>
                  <span className="flex-1">{r.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>이번주 한 줄</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row k="WON 매출" v={formatCurrency(brief.revenue)} good />
              <Row k="WON 건수" v={`${brief.wonCount}건`} good />
              <Row k="LOST" v={`${brief.lostCount}건 · ${formatCurrency(brief.lostAmount)}`}
                   bad={brief.lostAmount > 0} />
              <Row k="활동 총" v={`${brief.meetings + brief.calls + brief.emails + brief.proposals + brief.messengers}건`} />
              <Row k="OPEN 파이프" v={formatCurrency(brief.pipelineOpen)} />
              <Link href="/brief/company" className="text-xs text-primary hover:underline inline-block mt-2">
                회사 주간보고 전체 보기 →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, good, bad }: { k: string; v: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="flex justify-between border-b last:border-0 py-1.5">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("font-medium tabular-nums", good && "text-success", bad && "text-destructive")}>{v}</span>
    </div>
  );
}
