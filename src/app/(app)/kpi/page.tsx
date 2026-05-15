"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Settings } from "lucide-react";
import { KpiCardWidget } from "@/components/dashboard/KpiCard";
import { MOCK_KPI_MANAGER } from "@/lib/mock/kpi";
import { computeIncentive } from "@/lib/kpi/incentive";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

// 현재 매니저 (mock: 김민수)
const CURRENT_USER_ID = "user-mock-1";
const CURRENT_USER_NAME = "김민수";

export default function KpiPage() {
  const version = useSalesVersion();
  const sim = useMemo(() => computeIncentive(CURRENT_USER_ID, CURRENT_USER_NAME), [version]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">KPI · 인센티브</h1>
          <p className="text-sm text-muted-foreground mt-1">
            2026 Q2 · {sim.ownerName} · 자동 집계 (Mock)
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/kpi/incentive-rules">
            <Settings className="h-4 w-4" />인센티브 룰 편집
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MOCK_KPI_MANAGER.map((card) => (
          <KpiCardWidget key={card.code} card={card} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>💰 인센티브 미리보기 (Q2 추정 · 실시간)</CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">{formatCurrency(sim.totalIncentive)}</div>
              <Badge
                variant={sim.status === "ok" ? "success" : sim.status === "warn" ? "warning" : "destructive"}
              >
                가중평균 {formatPercent(sim.weightedAvg, 1)}
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
                {sim.rows.map((r) => {
                  const overshoot = Math.max(0, r.achievement - r.threshold);
                  const isCurrency = r.unit === "KRW";
                  return (
                    <tr key={r.code} className="border-b last:border-0">
                      <td className="py-2.5 px-2 font-medium">{r.label}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{r.weight}%</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {isCurrency ? formatCurrency(r.target) : r.target}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {isCurrency ? formatCurrency(r.actual) : r.actual}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={Math.min(r.achievement, 200) / 2} className="w-16 h-1.5" />
                          <span className="font-medium tabular-nums w-12 text-right">{r.achievement}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{overshoot}%p</td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-medium">
                        {formatCurrency(r.incentive)}
                        {r.cap !== undefined && r.incentive >= r.cap && (
                          <span className="text-xs text-muted-foreground ml-1">(cap)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40">
                  <td colSpan={6} className="py-2.5 px-2 text-right font-semibold">합계</td>
                  <td className="py-2.5 px-2 text-right font-bold tabular-nums">
                    {formatCurrency(sim.totalIncentive)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ※ MVP 인센티브 공식: <code className="bg-muted px-1 rounded">max(0, 달성률 − 임계치) × 단가</code>.
            실적은 {sim.ownerName}님의 WON 딜 · 활동 기록에서 자동 집계.
            가중평균 70% 미만 시 지급 0, BRIEF 제출률 50% 미만 시 50% 차감 (페널티는 v1.5).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
