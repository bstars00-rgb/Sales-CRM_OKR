"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCardWidget } from "@/components/dashboard/KpiCard";
import { LoadingCard } from "@/components/common/StateCards";
import { MOCK_KPI_CEO } from "@/lib/mock/kpi";
import {
  MOCK_REVENUE_TREND, MOCK_COUNTRY_REVENUE, MOCK_TOP_ACCOUNTS, MOCK_RISK_ALERTS,
} from "@/lib/mock/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

// Recharts (~110kB)을 lazy load — CEO 대시보드 First Load JS 218kB → ~110kB
const RevenueTrendChart = dynamic(
  () => import("@/components/dashboard/CeoCharts").then((m) => m.RevenueTrendChart),
  { ssr: false, loading: () => <LoadingCard label="차트 로딩 중..." className="h-[280px]" /> }
);
const CountryBarChart = dynamic(
  () => import("@/components/dashboard/CeoCharts").then((m) => m.CountryBarChart),
  { ssr: false, loading: () => <LoadingCard label="차트 로딩 중..." className="h-[280px]" /> }
);

export default function CeoDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">회사 대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">2026 Q2 · 6주차 · 회계연도 기준</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {MOCK_KPI_CEO.map((card) => (
          <KpiCardWidget key={card.code} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>월별 거래액 추이 (YoY)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={MOCK_REVENUE_TREND} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>국가별 실적</CardTitle>
          </CardHeader>
          <CardContent>
            <CountryBarChart data={MOCK_COUNTRY_REVENUE} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>핵심 고객사 TOP {MOCK_TOP_ACCOUNTS.length}</CardTitle>
          </CardHeader>
          <CardContent>
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
                {MOCK_TOP_ACCOUNTS.map((a) => (
                  <tr key={a.name} className="border-b last:border-0">
                    <td className="py-2.5">
                      <span className="mr-2">{a.country}</span>
                      <span className="font-medium">{a.name}</span>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🚨 위험 신호</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_RISK_ALERTS.map((r, i) => (
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
      </div>
    </div>
  );
}
