"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/common/PrintButton";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { formatCurrency } from "@/lib/utils/format";
import { Users, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CohortRow {
  cohortMonth: string;        // YYYY-MM (firstContactDate 기준)
  newAccounts: number;
  totalAccounts: number;
  ytdRevenue: number;
  wonDeals: number;
  lostDeals: number;
  openDeals: number;
  winRate: number;
  avgRevenuePerAccount: number;
}

function getCohortMonth(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export default function CohortPage() {
  const cohorts = useMemo<CohortRow[]>(() => {
    const map = new Map<string, CohortRow>();
    for (const a of MOCK_ACCOUNTS) {
      const cm = getCohortMonth(a.firstContactDate);
      const row = map.get(cm) ?? {
        cohortMonth: cm,
        newAccounts: 0,
        totalAccounts: 0,
        ytdRevenue: 0,
        wonDeals: 0, lostDeals: 0, openDeals: 0,
        winRate: 0,
        avgRevenuePerAccount: 0,
      };
      row.newAccounts++;
      row.totalAccounts++;
      row.ytdRevenue += a.totalRevenueYtd;
      map.set(cm, row);
    }
    // Deal 결과 추가
    for (const d of MOCK_DEALS) {
      const acc = MOCK_ACCOUNTS.find((a) => a.id === d.accountId);
      if (!acc) continue;
      const cm = getCohortMonth(acc.firstContactDate);
      const row = map.get(cm);
      if (!row) continue;
      if (d.outcome === "WON") row.wonDeals++;
      else if (d.outcome === "LOST") row.lostDeals++;
      else row.openDeals++;
    }
    // 계산
    const rows = Array.from(map.values()).map((r) => {
      const closed = r.wonDeals + r.lostDeals;
      return {
        ...r,
        winRate: closed > 0 ? (r.wonDeals / closed) * 100 : 0,
        avgRevenuePerAccount: r.totalAccounts > 0 ? r.ytdRevenue / r.totalAccounts : 0,
      };
    });
    return rows.sort((a, b) => a.cohortMonth.localeCompare(b.cohortMonth));
  }, []);

  const maxRevenue = Math.max(...cohorts.map((c) => c.ytdRevenue), 1);
  const maxAvg = Math.max(...cohorts.map((c) => c.avgRevenuePerAccount), 1);
  const totalAccounts = cohorts.reduce((s, c) => s + c.totalAccounts, 0);
  const totalRevenue = cohorts.reduce((s, c) => s + c.ytdRevenue, 0);

  // 최고 코호트
  const bestByAvg = [...cohorts].sort((a, b) => b.avgRevenuePerAccount - a.avgRevenuePerAccount)[0];
  const bestByWinRate = [...cohorts].filter((c) => c.wonDeals + c.lostDeals >= 2)
    .sort((a, b) => b.winRate - a.winRate)[0];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/analytics"><ArrowLeft className="h-4 w-4" />분석 인덱스</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            고객 코호트 분석
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            첫 컨택 기준 월별 묶음 · {totalAccounts}개 고객사 · YTD {formatCurrency(totalRevenue)}
          </p>
        </div>
        <PrintButton />
      </div>

      {/* 인사이트 */}
      {bestByAvg && bestByWinRate && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <div className="font-semibold">📊 코호트 인사이트</div>
              <div>· 💰 최고 평균 매출: <b>{bestByAvg.cohortMonth}</b> ({formatCurrency(bestByAvg.avgRevenuePerAccount)}/account)</div>
              <div>· 🏆 최고 Win Rate: <b>{bestByWinRate.cohortMonth}</b> ({bestByWinRate.winRate.toFixed(0)}%)</div>
              <div className="text-xs text-muted-foreground mt-2">
                💡 매출이 좋은 코호트의 컨택 채널·시즌·세그먼트를 분석하여 신규 고객 발굴 전략에 반영하세요.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 코호트 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">월별 코호트 (첫 컨택 기준)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cohorts.map((c) => (
              <div key={c.cohortMonth}>
                <div className="flex justify-between items-baseline mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium tabular-nums">{c.cohortMonth}</span>
                    <Badge variant="muted" className="text-[10px]">{c.newAccounts}개 신규</Badge>
                  </div>
                  <div className="text-xs tabular-nums">
                    <span className="font-semibold">{formatCurrency(c.ytdRevenue)}</span>
                    <span className="text-muted-foreground"> ({formatCurrency(c.avgRevenuePerAccount)}/acc)</span>
                  </div>
                </div>
                {/* YTD Revenue 막대 */}
                <div className="h-5 bg-muted/30 rounded flex overflow-hidden mb-1">
                  <div
                    className="bg-primary/60"
                    style={{ width: `${(c.ytdRevenue / maxRevenue) * 100}%` }}
                    title={`YTD ${formatCurrency(c.ytdRevenue)}`}
                  />
                </div>
                {/* W/L/O */}
                {(c.wonDeals + c.lostDeals + c.openDeals > 0) && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {c.wonDeals > 0 && <span className="text-success">🏆 {c.wonDeals}</span>}
                    {c.openDeals > 0 && <span className="text-primary">⏳ {c.openDeals}</span>}
                    {c.lostDeals > 0 && <span className="text-destructive">❌ {c.lostDeals}</span>}
                    {c.wonDeals + c.lostDeals > 0 && (
                      <span className="ml-2">Win Rate {c.winRate.toFixed(0)}%</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 코호트 표 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">코호트 상세</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left border-b">
                  <th className="py-2 px-3 font-medium text-muted-foreground">코호트</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">신규</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">YTD 매출</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">평균/Acc</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">W</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">L</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">O</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.cohortMonth} className="border-b last:border-0 hover:bg-accent/20">
                    <td className="py-2 px-3 font-medium tabular-nums">{c.cohortMonth}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{c.newAccounts}</td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span className={cn(c.ytdRevenue === maxRevenue && "font-bold text-success")}>
                        {formatCurrency(c.ytdRevenue)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span className={cn(c.avgRevenuePerAccount === maxAvg && "font-bold text-success")}>
                        {formatCurrency(c.avgRevenuePerAccount)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{c.wonDeals > 0 ? <span className="text-success">{c.wonDeals}</span> : "—"}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{c.lostDeals > 0 ? <span className="text-destructive">{c.lostDeals}</span> : "—"}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{c.openDeals > 0 ? c.openDeals : "—"}</td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {c.wonDeals + c.lostDeals > 0 ? (
                        <span className={cn(
                          c.winRate >= 60 ? "text-success" :
                          c.winRate >= 40 ? "text-warning" :
                          "text-destructive",
                        )}>
                          {c.winRate.toFixed(0)}%
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
