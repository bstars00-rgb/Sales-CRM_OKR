"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { Target, ArrowLeft, TrendingUp } from "lucide-react";
import { PrintButton } from "@/components/common/PrintButton";
import { cn } from "@/lib/utils/cn";

interface WinRateRow {
  key: string;
  label: string;
  won: number;
  lost: number;
  total: number;
  winRate: number;
  wonAmount: number;
  lostAmount: number;
  avgWonAmount: number;
}

function aggregate<K extends keyof never>(
  getKey: (deal: { dealType: string; countryCode: string; grade: string; ownerName: string; accountId: string }) => string,
  labelOf: (key: string) => string,
): WinRateRow[] {
  const closed = MOCK_DEALS.filter((d) => d.outcome === "WON" || d.outcome === "LOST");
  const map = new Map<string, { won: number; lost: number; wonAmount: number; lostAmount: number }>();
  for (const d of closed) {
    const k = getKey(d);
    const cur = map.get(k) ?? { won: 0, lost: 0, wonAmount: 0, lostAmount: 0 };
    if (d.outcome === "WON") {
      cur.won++;
      cur.wonAmount += d.amount;
    } else {
      cur.lost++;
      cur.lostAmount += d.amount;
    }
    map.set(k, cur);
  }
  return Array.from(map.entries()).map(([k, v]) => {
    const total = v.won + v.lost;
    return {
      key: k,
      label: labelOf(k),
      won: v.won,
      lost: v.lost,
      total,
      winRate: total > 0 ? (v.won / total) * 100 : 0,
      wonAmount: v.wonAmount,
      lostAmount: v.lostAmount,
      avgWonAmount: v.won > 0 ? v.wonAmount / v.won : 0,
    };
  }).sort((a, b) => b.winRate - a.winRate || b.won - a.won);
  void [getKey, labelOf]; // typing helper
}

export default function WinRatePage() {
  const version = useSalesVersion();
  void version;

  const accountById = useMemo(() => {
    const m = new Map<string, typeof MOCK_ACCOUNTS[0]>();
    MOCK_ACCOUNTS.forEach((a) => m.set(a.id, a));
    return m;
  }, []);

  const byDealType = useMemo(
    () => aggregate((d) => d.dealType, (k) => k.replace("_", " ")),
    [version],
  );
  const bySegment = useMemo(
    () => aggregate(
      (d) => accountById.get(d.accountId)?.segment ?? "UNKNOWN",
      (k) => k.replace("_", " "),
    ),
    [accountById, version],
  );
  const byCountry = useMemo(
    () => aggregate((d) => d.countryCode, (k) => k),
    [version],
  );
  const byOwner = useMemo(
    () => aggregate((d) => d.ownerName, (k) => k),
    [version],
  );
  const byGrade = useMemo(
    () => aggregate((d) => d.grade, (k) => k.replace("_", " ")),
    [version],
  );

  const totalClosed = MOCK_DEALS.filter((d) => d.outcome === "WON" || d.outcome === "LOST").length;
  const totalWon = MOCK_DEALS.filter((d) => d.outcome === "WON").length;
  const overallRate = totalClosed > 0 ? (totalWon / totalClosed) * 100 : 0;

  // 1위/꼴찌 인사이트 (Segment 기준)
  const bestSegment = bySegment.filter((s) => s.total >= 1).sort((a, b) => b.winRate - a.winRate)[0];
  const worstSegment = bySegment.filter((s) => s.total >= 1).sort((a, b) => a.winRate - b.winRate)[0];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/analytics"><ArrowLeft className="h-4 w-4" />분석 인덱스</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-success" />
            Win Rate by Segment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            전체 종결 {totalClosed}건 · 평균 Win Rate {formatPercent(overallRate, 1)}
          </p>
        </div>
        <PrintButton />
      </div>

      {/* 인사이트 */}
      {bestSegment && worstSegment && bestSegment.key !== worstSegment.key && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <div className="font-semibold">📊 채널 효율 비교 (Segment)</div>
              <div>· 🏆 최고 Win Rate: <b>{bestSegment.label}</b> ({formatPercent(bestSegment.winRate, 1)}, {bestSegment.won}/{bestSegment.total})</div>
              <div>· 📉 최저 Win Rate: <b>{worstSegment.label}</b> ({formatPercent(worstSegment.winRate, 1)}, {worstSegment.won}/{worstSegment.total})</div>
              <div className="text-xs text-muted-foreground mt-2">
                💡 분기 자원 배분 시 효율 높은 채널에 우선 투자, 낮은 채널은 깊은 원인 분석 (Lost Reason 참조).
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5개 그룹화 차원 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <WinRateCard title="Account Segment" subtitle="OTA / 호텔 / 홀세일러 등" data={bySegment} />
        <WinRateCard title="Deal Type" subtitle="신규 / 갱신 / Upsell 등" data={byDealType} />
        <WinRateCard title="국가" subtitle="국가별 종결 성과" data={byCountry} />
        <WinRateCard title="Account Grade" subtitle="KEY / GROWTH 등 등급별" data={byGrade} />
        <WinRateCard title="담당자" subtitle="담당자별 종결 성과" data={byOwner} fullWidth />
      </div>
    </div>
  );
}

function WinRateCard({
  title, subtitle, data, fullWidth,
}: {
  title: string;
  subtitle: string;
  data: WinRateRow[];
  fullWidth?: boolean;
}) {
  if (data.length === 0) {
    return (
      <Card className={fullWidth ? "lg:col-span-2" : ""}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground text-center py-4">데이터 없음</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={fullWidth ? "lg:col-span-2" : ""}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((row) => (
          <div key={row.key}>
            <div className="flex justify-between items-baseline mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{row.label}</span>
                <Badge variant="muted" className="text-[10px]">{row.total}건</Badge>
              </div>
              <div className="text-sm tabular-nums">
                <span className={cn(
                  "font-semibold",
                  row.winRate >= 70 ? "text-success" :
                  row.winRate >= 40 ? "text-warning" :
                  "text-destructive",
                )}>
                  {formatPercent(row.winRate, 0)}
                </span>
                <span className="text-xs text-muted-foreground"> ({row.won}/{row.total})</span>
              </div>
            </div>
            {/* W/L 막대 */}
            <div className="h-3 bg-muted/30 rounded flex overflow-hidden">
              <div
                className="bg-success/70"
                style={{ width: `${row.total > 0 ? (row.won / row.total) * 100 : 0}%` }}
                title={`Won ${row.won}`}
              />
              <div
                className="bg-destructive/70"
                style={{ width: `${row.total > 0 ? (row.lost / row.total) * 100 : 0}%` }}
                title={`Lost ${row.lost}`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5 tabular-nums">
              <span>Won {formatCurrency(row.wonAmount)}</span>
              {row.avgWonAmount > 0 && <span>평균 {formatCurrency(row.avgWonAmount)}</span>}
              <span>Lost {formatCurrency(row.lostAmount)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
