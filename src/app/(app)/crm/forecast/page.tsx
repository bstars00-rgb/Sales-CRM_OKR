"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MOCK_DEALS, MOCK_STAGES } from "@/lib/mock/deals";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Mode = "stage" | "owner" | "month";

export default function ForecastPage() {
  const version = useSalesVersion();
  const [mode, setMode] = useState<Mode>("stage");
  void version;

  const openDeals = MOCK_DEALS.filter((d) => d.outcome === "OPEN");
  const wonYtd = MOCK_DEALS.filter((d) => d.outcome === "WON");

  // 확률 가중 합계
  const totalPipeline = openDeals.reduce((s, d) => s + d.amount, 0);
  const weightedPipeline = openDeals.reduce((s, d) => s + (d.amount * d.probabilityPct) / 100, 0);
  const wonAmount = wonYtd.reduce((s, d) => s + d.amount, 0);

  // 시나리오: best (확률 100%) / likely (확률 가중) / worst (>=80% 확률만)
  const bestCase = totalPipeline;
  const likelyCase = weightedPipeline;
  const worstCase = openDeals.filter((d) => d.probabilityPct >= 80).reduce((s, d) => s + d.amount, 0);

  // 단계별 그룹
  const byStage = useMemo(() => {
    return MOCK_STAGES
      .filter((s) => s.stageKind === "OPEN")
      .map((stage) => {
        const deals = openDeals.filter((d) => d.stageId === stage.id);
        const total = deals.reduce((s, d) => s + d.amount, 0);
        const weighted = deals.reduce((s, d) => s + (d.amount * d.probabilityPct) / 100, 0);
        return { stage, deals, total, weighted };
      });
  }, [openDeals]);

  // 담당자별 그룹
  const byOwner = useMemo(() => {
    const map = new Map<string, { name: string; deals: typeof openDeals; total: number; weighted: number }>();
    openDeals.forEach((d) => {
      const cur = map.get(d.ownerUserId) ?? { name: d.ownerName, deals: [], total: 0, weighted: 0 };
      cur.deals.push(d);
      cur.total += d.amount;
      cur.weighted += (d.amount * d.probabilityPct) / 100;
      map.set(d.ownerUserId, cur);
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ ownerId: id, ...v }))
      .sort((a, b) => b.weighted - a.weighted);
  }, [openDeals]);

  // 월별 그룹 (예상 클로징일 기준)
  const byMonth = useMemo(() => {
    const map = new Map<string, { deals: typeof openDeals; total: number; weighted: number }>();
    openDeals.forEach((d) => {
      const key = d.expectedCloseDate.slice(0, 7); // YYYY-MM
      const cur = map.get(key) ?? { deals: [], total: 0, weighted: 0 };
      cur.deals.push(d);
      cur.total += d.amount;
      cur.weighted += (d.amount * d.probabilityPct) / 100;
      map.set(key, cur);
    });
    return Array.from(map.entries())
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [openDeals]);

  const maxValue = Math.max(
    ...byStage.map((g) => g.total),
    ...byOwner.map((g) => g.total),
    ...byMonth.map((g) => g.total),
    1,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline Forecast</h1>
          <p className="text-sm text-muted-foreground mt-1">
            확률 가중 매출 예측 · OPEN {openDeals.length}건 / WON {wonYtd.length}건
          </p>
        </div>
      </div>

      {/* 시나리오 3개 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ScenarioCard
          label="Worst Case"
          desc=">= 80% 확률만"
          amount={worstCase}
          count={openDeals.filter((d) => d.probabilityPct >= 80).length}
          tone="destructive"
        />
        <ScenarioCard
          label="Likely (확률 가중)"
          desc="모든 딜 × 확률"
          amount={likelyCase}
          count={openDeals.length}
          tone="primary"
          highlight
        />
        <ScenarioCard
          label="Best Case"
          desc="모든 OPEN 100% 가정"
          amount={bestCase}
          count={openDeals.length}
          tone="success"
        />
      </div>

      {/* YTD WON + Likely 합산 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            올해 종합 (YTD WON + 예측 Likely)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums">{formatCurrency(wonAmount + likelyCase)}</span>
            <span className="text-sm text-muted-foreground">
              ({formatCurrency(wonAmount)} 확정 + {formatCurrency(likelyCase)} 예측)
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">확정 비율</span>
              <span className="tabular-nums">
                {((wonAmount / Math.max(wonAmount + likelyCase, 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              <div
                className="bg-success"
                style={{ width: `${(wonAmount / Math.max(wonAmount + likelyCase, 1)) * 100}%` }}
              />
              <div
                className="bg-primary/70"
                style={{ width: `${(likelyCase / Math.max(wonAmount + likelyCase, 1)) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 모드 토글 */}
      <div className="flex gap-2">
        {(["stage", "owner", "month"] as Mode[]).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            onClick={() => setMode(m)}
          >
            {m === "stage" && "단계별"}
            {m === "owner" && "담당자별"}
            {m === "month" && (<><Calendar className="h-3.5 w-3.5" />월별</>)}
          </Button>
        ))}
      </div>

      {/* 분포 차트 (수평 막대) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {mode === "stage" ? "단계별" : mode === "owner" ? "담당자별" : "월별"} 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mode === "stage" && byStage.map((g) => (
              <ForecastBar
                key={g.stage.id}
                label={g.stage.name}
                sublabel={`${g.deals.length}건 · 평균 확률 ${
                  g.deals.length === 0
                    ? 0
                    : Math.round(g.deals.reduce((s, d) => s + d.probabilityPct, 0) / g.deals.length)
                }%`}
                total={g.total}
                weighted={g.weighted}
                max={maxValue}
              />
            ))}
            {mode === "owner" && byOwner.map((g) => (
              <ForecastBar
                key={g.ownerId}
                label={g.name}
                sublabel={`${g.deals.length}건`}
                total={g.total}
                weighted={g.weighted}
                max={maxValue}
              />
            ))}
            {mode === "month" && byMonth.map((g) => (
              <ForecastBar
                key={g.month}
                label={g.month}
                sublabel={`${g.deals.length}건`}
                total={g.total}
                weighted={g.weighted}
                max={maxValue}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 큰 딜 TOP 10 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">TOP 10 큰 딜 (확률 가중)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left border-b">
                  <th className="py-2 px-3 font-medium text-muted-foreground">딜</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">고객사</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">담당</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">단계</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">금액</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">확률</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">예측액</th>
                </tr>
              </thead>
              <tbody>
                {[...openDeals]
                  .sort((a, b) => (b.amount * b.probabilityPct) - (a.amount * a.probabilityPct))
                  .slice(0, 10)
                  .map((d) => {
                    const weighted = (d.amount * d.probabilityPct) / 100;
                    return (
                      <tr key={d.id} className="border-b last:border-0 hover:bg-accent/30">
                        <td className="py-2 px-3 font-medium">{d.name}</td>
                        <td className="py-2 px-3 text-muted-foreground">{d.accountName}</td>
                        <td className="py-2 px-3 text-muted-foreground">{d.ownerName}</td>
                        <td className="py-2 px-3">
                          <Badge variant="muted" className="text-xs">{d.stageName}</Badge>
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(d.amount)}</td>
                        <td className="py-2 px-3 text-right tabular-nums">
                          <span className={cn(
                            d.probabilityPct >= 75 ? "text-success" :
                            d.probabilityPct >= 50 ? "text-warning" :
                            "text-muted-foreground"
                          )}>
                            {d.probabilityPct}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-semibold text-primary">
                          {formatCurrency(weighted)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScenarioCard({
  label, desc, amount, count, tone, highlight,
}: {
  label: string;
  desc: string;
  amount: number;
  count: number;
  tone: "destructive" | "primary" | "success";
  highlight?: boolean;
}) {
  return (
    <Card className={cn(
      "transition-all",
      highlight && "border-primary/40 shadow-md",
    )}>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className={cn(
          "text-2xl font-bold tabular-nums mb-1",
          tone === "destructive" && "text-destructive",
          tone === "primary" && "text-primary",
          tone === "success" && "text-success",
        )}>
          {formatCurrency(amount)}
        </div>
        <div className="text-xs text-muted-foreground">{desc} · {count}건</div>
      </CardContent>
    </Card>
  );
}

function ForecastBar({
  label, sublabel, total, weighted, max,
}: {
  label: string;
  sublabel: string;
  total: number;
  weighted: number;
  max: number;
}) {
  const totalPct = (total / max) * 100;
  const weightedOfTotal = total > 0 ? (weighted / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <div>
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground ml-2">{sublabel}</span>
        </div>
        <div className="text-xs tabular-nums">
          <span className="font-semibold text-primary">{formatCurrency(weighted)}</span>
          <span className="text-muted-foreground"> / {formatCurrency(total)}</span>
        </div>
      </div>
      <div className="relative h-6 bg-muted/40 rounded">
        <div
          className="absolute inset-y-0 left-0 bg-muted-foreground/20 rounded"
          style={{ width: `${totalPct}%` }}
          title={`전체 ${formatCurrency(total)}`}
        />
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded"
          style={{ width: `${totalPct * (weightedOfTotal / 100)}%` }}
          title={`가중 ${formatCurrency(weighted)}`}
        />
      </div>
    </div>
  );
}

// formatNumber import 유지 (린트)
void formatNumber;
