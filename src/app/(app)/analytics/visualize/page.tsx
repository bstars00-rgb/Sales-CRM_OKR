"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/common/PrintButton";
import { MOCK_ACTIVITIES } from "@/lib/mock/activities";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { getObjectivesWithAutoProgress } from "@/lib/okr/auto-progress";
import { formatCurrency } from "@/lib/utils/format";
import { Grid3x3, TrendingDown, TrendingUp, ArrowLeft, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function VisualizePage() {
  // 1) 히트맵: 활동 요일×시간대
  const heatmap = useMemo(() => {
    // grid[day][hour]: count
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let maxCount = 0;
    for (const a of MOCK_ACTIVITIES) {
      const d = new Date(a.occurredAt);
      const day = d.getDay();
      const hour = d.getHours();
      grid[day][hour]++;
      if (grid[day][hour] > maxCount) maxCount = grid[day][hour];
    }
    return { grid, maxCount };
  }, []);

  // 시간대 라벨 그룹화: 영업 시간만 8-22시 표시
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8-22

  // 인사이트: 가장 활동 많은 요일/시간
  const bestSlot = useMemo(() => {
    let maxCount = 0;
    let best = { day: 0, hour: 0, count: 0 };
    heatmap.grid.forEach((row, day) => {
      row.forEach((count, hour) => {
        if (count > maxCount) {
          maxCount = count;
          best = { day, hour, count };
        }
      });
    });
    return best;
  }, [heatmap]);

  // 2) 워터폴: 회사 OKR 진척 분해 (예시 — Revenue OKR의 KR들이 어떻게 결합되는지)
  const waterfall = useMemo(() => {
    const objectives = getObjectivesWithAutoProgress();
    const company = objectives.filter((o) => o.ownerKind === "COMPANY");
    if (company.length === 0) return null;
    const focus = company[0]; // 첫 번째 회사 OBJ 사용
    const kr = focus.keyResults;
    // 시작 0 → 각 KR이 progressPct만큼 기여 → 평균 → 100%
    let cumulative = 0;
    const steps = kr.map((k) => {
      const contribution = (Math.min(k.progressPct, 100) / kr.length); // 평균 기여
      const start = cumulative;
      cumulative += contribution;
      return {
        label: k.title,
        contribution,
        start,
        end: cumulative,
        progressPct: k.progressPct,
        currentValue: k.currentValue,
        targetValue: k.targetValue,
        unit: k.unit,
      };
    });
    return { objective: focus, steps, total: cumulative };
  }, []);

  // 3) WON/LOST 워터폴 (보조)
  const dealWaterfall = useMemo(() => {
    const won = MOCK_DEALS.filter((d) => d.outcome === "WON");
    const lost = MOCK_DEALS.filter((d) => d.outcome === "LOST");
    const wonTotal = won.reduce((s, d) => s + d.amount, 0);
    const lostTotal = lost.reduce((s, d) => s + d.amount, 0);
    const openTotal = MOCK_DEALS.filter((d) => d.outcome === "OPEN").reduce((s, d) => s + d.amount, 0);

    return {
      items: [
        { label: "Won 합계", value: wonTotal, type: "positive" as const },
        { label: "Lost 합계", value: -lostTotal, type: "negative" as const },
        { label: "Open 가중", value: openTotal * 0.5, type: "expected" as const }, // 50% 가중
      ],
      net: wonTotal - lostTotal + openTotal * 0.5,
    };
  }, []);

  const heatColor = (count: number, max: number) => {
    if (count === 0) return "bg-muted/20";
    const intensity = count / max;
    if (intensity >= 0.75) return "bg-primary";
    if (intensity >= 0.5) return "bg-primary/70";
    if (intensity >= 0.25) return "bg-primary/40";
    return "bg-primary/20";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/analytics"><ArrowLeft className="h-4 w-4" />분석 인덱스</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Grid3x3 className="h-6 w-6 text-primary" />
            시각화 — 히트맵 / 워터폴
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            활동 요일×시간대 분포 + OKR 진척 분해 + 매출 워터폴
          </p>
        </div>
        <PrintButton />
      </div>

      {/* 히트맵 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            활동 히트맵 (요일 × 시간대)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            총 {MOCK_ACTIVITIES.length}건 · 최고 빈도: <b>{DAY_LABELS[bestSlot.day]}요일 {bestSlot.hour}시</b> ({bestSlot.count}건)
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* 시간 헤더 */}
              <div className="flex items-center gap-0.5 mb-1 ml-8">
                {hours.map((h) => (
                  <div key={h} className="w-8 text-center text-[10px] text-muted-foreground tabular-nums">
                    {h}
                  </div>
                ))}
              </div>
              {/* 요일별 행 */}
              {DAY_LABELS.map((day, di) => (
                <div key={di} className="flex items-center gap-0.5 mb-0.5">
                  <div className={cn(
                    "w-7 text-xs text-right pr-1 shrink-0",
                    (di === 0 || di === 6) && "text-destructive",
                  )}>
                    {day}
                  </div>
                  {hours.map((h) => {
                    const count = heatmap.grid[di][h];
                    return (
                      <div
                        key={h}
                        className={cn(
                          "w-8 h-8 rounded-sm flex items-center justify-center text-[10px] font-medium",
                          heatColor(count, heatmap.maxCount),
                          count > 0 && "text-foreground",
                        )}
                        title={`${day}요일 ${h}시 · ${count}건`}
                      >
                        {count > 0 ? count : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {/* 범례 */}
          <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
            <span>적음</span>
            <div className="w-4 h-4 rounded-sm bg-muted/20" />
            <div className="w-4 h-4 rounded-sm bg-primary/20" />
            <div className="w-4 h-4 rounded-sm bg-primary/40" />
            <div className="w-4 h-4 rounded-sm bg-primary/70" />
            <div className="w-4 h-4 rounded-sm bg-primary" />
            <span>많음 (max {heatmap.maxCount})</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2 bg-muted/30 rounded p-2">
            💡 영업 활동이 가장 활발한 시간대 = 고객 응답이 가장 좋은 시간대. 이 슬롯에 중요 통화/미팅 집중.
          </div>
        </CardContent>
      </Card>

      {/* OKR 워터폴 */}
      {waterfall && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              OKR 진척 분해 — {waterfall.objective.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              각 Key Result가 Objective 진척률에 어떻게 기여하는지 분해
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {waterfall.steps.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{s.label}</span>
                    <span className="tabular-nums">
                      {s.progressPct}% (기여 +{s.contribution.toFixed(1)}p)
                    </span>
                  </div>
                  <div className="relative h-7 bg-muted/30 rounded">
                    {/* 시작 위치 (회색) */}
                    <div
                      className="absolute h-full bg-muted/30 rounded"
                      style={{ left: 0, width: `${s.start}%` }}
                    />
                    {/* 기여분 (primary) */}
                    <div
                      className="absolute h-full bg-primary/70 rounded"
                      style={{ left: `${s.start}%`, width: `${s.contribution}%` }}
                    />
                    {/* 라벨 */}
                    <div className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] tabular-nums">
                      누적 {s.end.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
              {/* 최종 막대 */}
              <div className="pt-2 border-t mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold">📊 Objective 진척률</span>
                  <span className="font-bold tabular-nums">{waterfall.objective.progressPct}%</span>
                </div>
                <div className="h-7 bg-muted/30 rounded">
                  <div
                    className={cn(
                      "h-full rounded",
                      waterfall.objective.progressPct >= 70 ? "bg-success" :
                      waterfall.objective.progressPct >= 50 ? "bg-warning" :
                      "bg-destructive"
                    )}
                    style={{ width: `${Math.min(waterfall.objective.progressPct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 매출 워터폴 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            매출 워터폴 (확정 + 위험 - 기대)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            확정 매출에서 손실 차감 후 OPEN 50% 가중치 더한 분기 예상
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dealWaterfall.items.map((item, i) => {
              const max = Math.max(...dealWaterfall.items.map((x) => Math.abs(x.value)), 1);
              const width = (Math.abs(item.value) / max) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        item.type === "positive" && "text-success",
                        item.type === "negative" && "text-destructive",
                      )}>
                        {item.type === "positive" ? "▲" : item.type === "negative" ? "▼" : "○"}
                      </span>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className={cn(
                      "text-sm tabular-nums font-medium",
                      item.type === "positive" && "text-success",
                      item.type === "negative" && "text-destructive",
                    )}>
                      {item.value < 0 ? "−" : ""}{formatCurrency(Math.abs(item.value))}
                    </span>
                  </div>
                  <div className="h-5 bg-muted/30 rounded">
                    <div
                      className={cn(
                        "h-full rounded",
                        item.type === "positive" ? "bg-success/60" :
                        item.type === "negative" ? "bg-destructive/60" :
                        "bg-primary/60",
                      )}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t mt-3 flex justify-between">
              <span className="font-bold">📊 분기 예상 (Net)</span>
              <Badge variant={dealWaterfall.net >= 0 ? "success" : "destructive"} className="text-sm px-3 py-1">
                {formatCurrency(dealWaterfall.net)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
