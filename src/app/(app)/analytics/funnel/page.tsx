"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_DEALS, MOCK_STAGES } from "@/lib/mock/deals";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { Filter, ArrowLeft, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STAGE_AVG_DAYS = 7; // 단계 평균 기대일 (정체 판단용)

export default function FunnelPage() {
  const version = useSalesVersion();
  void version;

  // 모든 단계 (OPEN만 funnel에 의미가 있음, WON/LOST는 종결)
  const openStages = MOCK_STAGES.filter((s) => s.stageKind === "OPEN")
    .sort((a, b) => a.orderNo - b.orderNo);

  // 각 단계: OPEN 딜 + 그 단계를 지나간 (orderNo >= 이 단계) WON 딜
  // funnel = 이 단계 이상에 있는 모든 딜 (OPEN + WON 합산, LOST는 제외하면 conversion 왜곡)
  const funnelData = useMemo(() => {
    return openStages.map((stage) => {
      // OPEN 딜 중 이 단계에 머무는 것
      const here = MOCK_DEALS.filter((d) => d.outcome === "OPEN" && d.stageId === stage.id);
      // 이 단계 이상으로 진행된 모든 OPEN + WON
      const passed = MOCK_DEALS.filter(
        (d) => (d.outcome === "OPEN" && d.stageOrder >= stage.orderNo) || d.outcome === "WON"
      );
      const total = passed.reduce((s, d) => s + d.amount, 0);
      const avgDays = here.length > 0
        ? Math.round(here.reduce((s, d) => s + d.daysInStage, 0) / here.length)
        : 0;
      const stalled = here.filter((d) => d.daysInStage >= STAGE_AVG_DAYS * 2).length;
      return {
        stage,
        hereCount: here.length,
        passedCount: passed.length,
        totalAmount: total,
        avgDays,
        stalled,
        deals: here,
      };
    });
  }, [openStages]);

  const lostCount = MOCK_DEALS.filter((d) => d.outcome === "LOST").length;
  const wonCount = MOCK_DEALS.filter((d) => d.outcome === "WON").length;

  const maxPassed = Math.max(...funnelData.map((f) => f.passedCount), 1);
  const topPassed = funnelData[0]?.passedCount ?? 0;

  // 단계별 이탈률 (passedCount 비교)
  const conversionData = useMemo(() => {
    return funnelData.map((cur, i) => {
      const next = funnelData[i + 1];
      const nextCount = next?.passedCount ?? wonCount;
      const conversion = cur.passedCount > 0 ? (nextCount / cur.passedCount) * 100 : 0;
      return { ...cur, conversion, lost: cur.passedCount - nextCount };
    });
  }, [funnelData, wonCount]);

  // 병목 진단 — 가장 큰 이탈률 + 가장 긴 평균 체류
  const worstConversion = conversionData
    .filter((c, i) => i < conversionData.length - 1)
    .sort((a, b) => a.conversion - b.conversion)[0];
  const longestStay = funnelData
    .filter((f) => f.avgDays > 0)
    .sort((a, b) => b.avgDays - a.avgDays)[0];

  const totalOpen = funnelData.reduce((s, f) => s + f.hereCount, 0);

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/analytics"><ArrowLeft className="h-4 w-4" />분석 인덱스</Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Filter className="h-6 w-6 text-warning" />
          Sales Funnel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          OPEN {totalOpen}건 + WON {wonCount}건 + LOST {lostCount}건 · 단계별 conversion + 병목 진단
        </p>
      </div>

      {/* 병목 인사이트 */}
      {(worstConversion || longestStay) && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <div className="font-semibold">⚠ 병목 진단</div>
              {worstConversion && (
                <div>
                  · 가장 큰 이탈률: <b>{worstConversion.stage.name}</b> → 다음 단계 ({formatPercent(worstConversion.conversion, 0)} 통과, {worstConversion.lost}건 이탈)
                </div>
              )}
              {longestStay && (
                <div>
                  · 가장 오래 머무는 단계: <b>{longestStay.stage.name}</b> (평균 {longestStay.avgDays}일, 정체 {longestStay.stalled}건)
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                💡 이 단계의 표준 액션을 정의하고 SLA를 단축하는 것이 분기 OKR의 핵심 KR이 될 수 있습니다.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funnel 차트 (수평 깔때기) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funnel 시각화</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {conversionData.map((c, i) => {
              const widthPct = (c.passedCount / maxPassed) * 100;
              const isLast = i === conversionData.length - 1;
              return (
                <div key={c.stage.id}>
                  <div className="flex items-center gap-3">
                    <div className="w-32 text-xs">
                      <div className="font-medium">{c.stage.name}</div>
                      <div className="text-muted-foreground tabular-nums">
                        {c.passedCount}건 · {formatCurrency(c.totalAmount)}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div
                        className={cn(
                          "h-9 rounded transition-all relative",
                          isLast ? "bg-warning/40" : "bg-primary/40",
                        )}
                        style={{ width: `${widthPct}%`, minWidth: "60px" }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                          {c.passedCount}
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-right text-xs">
                      {c.hereCount > 0 ? (
                        <span className="tabular-nums">{c.hereCount}건 거주</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                  {!isLast && (
                    <div className="ml-32 flex items-center gap-2 pl-3 my-1 text-xs text-muted-foreground">
                      <span>↓</span>
                      <span className={cn(
                        c.conversion >= 80 ? "text-success" : c.conversion >= 50 ? "text-warning" : "text-destructive",
                      )}>
                        {formatPercent(c.conversion, 0)} 통과
                      </span>
                      {c.lost > 0 && (
                        <span className="text-destructive">· {c.lost}건 이탈</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {/* 최종 WON */}
            <div className="flex items-center gap-3 pt-2 border-t mt-2">
              <div className="w-32 text-xs">
                <div className="font-bold text-success">🏆 Won</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="h-9 bg-success/40 rounded relative"
                  style={{ width: `${(wonCount / maxPassed) * 100}%`, minWidth: "40px" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                    {wonCount}
                  </div>
                </div>
              </div>
              <div className="w-24 text-right text-xs text-muted-foreground tabular-nums">
                {topPassed > 0 ? formatPercent((wonCount / topPassed) * 100, 1) : "—"} overall
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 단계별 상세 표 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />단계별 상세
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left border-b">
                  <th className="py-2 px-3 font-medium text-muted-foreground">단계</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">현재 거주</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">평균 체류일</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">정체 (≥14일)</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">다음 단계 통과율</th>
                </tr>
              </thead>
              <tbody>
                {conversionData.map((c, i) => {
                  const isLast = i === conversionData.length - 1;
                  return (
                    <tr key={c.stage.id} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium">{c.stage.name}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{c.hereCount}</td>
                      <td className="py-2 px-3 text-right tabular-nums">
                        {c.avgDays > 0 ? (
                          <span className={cn(
                            c.avgDays >= STAGE_AVG_DAYS * 2 ? "text-destructive" :
                            c.avgDays >= STAGE_AVG_DAYS * 1.5 ? "text-warning" :
                            "text-foreground",
                          )}>
                            {c.avgDays}일
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">
                        {c.stalled > 0 ? <Badge variant="destructive">{c.stalled}</Badge> : "—"}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">
                        {isLast ? (
                          <span className="text-success">{wonCount > 0 ? "Win" : "—"}</span>
                        ) : (
                          <span className={cn(
                            c.conversion >= 80 ? "text-success" :
                            c.conversion >= 50 ? "text-warning" :
                            "text-destructive",
                          )}>
                            {formatPercent(c.conversion, 0)}
                          </span>
                        )}
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
