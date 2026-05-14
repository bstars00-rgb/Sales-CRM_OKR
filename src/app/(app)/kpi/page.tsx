"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Settings } from "lucide-react";
import { KpiCardWidget } from "@/components/dashboard/KpiCard";
import { MOCK_KPI_MANAGER } from "@/lib/mock/kpi";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

const SIM_BREAKDOWN = [
  { code: "REVENUE",      weight: 35, target: 300_000_000, actual: 396_000_000, achievement: 132, threshold: 80, ratePer1Pct: 30_000, incentive: 1_560_000 },
  { code: "GP",           weight: 25, target: 45_000_000,  actual: 60_000_000,  achievement: 133, threshold: 80, ratePer1Pct: 30_000, incentive: 1_590_000 },
  { code: "NEW_ACCOUNTS", weight: 10, target: 4,           actual: 5,           achievement: 125, threshold: 80, ratePer1Pct: 30_000, incentive: 1_350_000 },
  { code: "MEETINGS",     weight: 10, target: 30,          actual: 38,          achievement: 127, threshold: 80, ratePer1Pct: 30_000, incentive: 1_410_000 },
  { code: "PROPOSALS",    weight: 10, target: 12,          actual: 14,          achievement: 117, threshold: 80, ratePer1Pct: 30_000, incentive: 1_110_000 },
  { code: "CONTRACTS",    weight: 10, target: 6,           actual: 7,           achievement: 117, threshold: 80, ratePer1Pct: 30_000, incentive: 1_110_000 },
];

export default function KpiPage() {
  const totalIncentive = SIM_BREAKDOWN.reduce((s, b) => s + b.incentive, 0);
  const weightedAvg = SIM_BREAKDOWN.reduce((s, b) => s + (b.achievement * b.weight) / 100, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">KPI · 인센티브</h1>
          <p className="text-sm text-muted-foreground mt-1">2026 Q2 · 분기말 추정값</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/kpi/incentive-rules">
            <Settings className="h-4 w-4" />인센티브 룰 편집
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MOCK_KPI_MANAGER.map((card) => (
          <KpiCardWidget key={card.code} card={card} />
        ))}
      </div>

      {/* Incentive Simulator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>💰 인센티브 미리보기 (Q2 추정)</CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">{formatCurrency(totalIncentive)}</div>
              <Badge variant={weightedAvg >= 100 ? "success" : weightedAvg >= 70 ? "warning" : "destructive"}>
                가중평균 {formatPercent(weightedAvg, 1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">KPI</th>
                  <th className="text-right py-2 px-2 font-medium">가중치</th>
                  <th className="text-right py-2 px-2 font-medium">목표</th>
                  <th className="text-right py-2 px-2 font-medium">실적</th>
                  <th className="text-right py-2 px-2 font-medium">달성률</th>
                  <th className="text-right py-2 px-2 font-medium">초과 %p</th>
                  <th className="text-right py-2 px-2 font-medium">인센티브</th>
                </tr>
              </thead>
              <tbody>
                {SIM_BREAKDOWN.map((b) => {
                  const overshoot = Math.max(0, b.achievement - b.threshold);
                  const isCurrency = b.code === "REVENUE" || b.code === "GP";
                  return (
                    <tr key={b.code} className="border-b last:border-0">
                      <td className="py-2.5 px-2 font-medium">{b.code}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{b.weight}%</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {isCurrency ? formatCurrency(b.target) : b.target}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {isCurrency ? formatCurrency(b.actual) : b.actual}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={Math.min(b.achievement, 200) / 2} className="w-16 h-1.5" />
                          <span className="font-medium tabular-nums w-12 text-right">{b.achievement}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{overshoot}%p</td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-medium">{formatCurrency(b.incentive)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40">
                  <td colSpan={6} className="py-2.5 px-2 text-right font-semibold">합계</td>
                  <td className="py-2.5 px-2 text-right font-bold tabular-nums">{formatCurrency(totalIncentive)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ※ MVP 인센티브 공식: <code className="bg-muted px-1 rounded">max(0, 달성률 − 임계치) × 단가</code>.
            가중평균 70% 미만 시 지급 0, BRIEF 제출률 50% 미만 시 50% 차감 (페널티는 v1.5).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
