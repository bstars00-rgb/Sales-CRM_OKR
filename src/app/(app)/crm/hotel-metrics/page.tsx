"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { getCompanyHotelMetrics, getDefaultCommission, DEFAULT_COMMISSION_BY_SEGMENT } from "@/lib/hotel/metrics";
import { SEASON_CALENDAR, SEASON_META, nextSeasons } from "@/lib/hotel/seasonality";
import { FX_RATES, CURRENCY_FLAG, toKrw, type Currency } from "@/lib/hotel/fx";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { Building2, TrendingUp, Calendar, Percent } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function HotelMetricsPage() {
  const [displayCcy, setDisplayCcy] = useState<Currency>("KRW");

  // 호텔 매핑 있는 account만 (모두 매핑)
  const accountIds = MOCK_ACCOUNTS.map((a) => a.id);
  const metrics = useMemo(() => getCompanyHotelMetrics(accountIds, 12), [accountIds]);

  // 최신 월 vs 전월
  const latest = metrics[metrics.length - 1];
  const prev = metrics[metrics.length - 2];
  const ytdRevenue = metrics.reduce((s, m) => s + m.revenue, 0);
  const ytdRoomNights = metrics.reduce((s, m) => s + m.roomNights, 0);
  const ytdAdr = ytdRoomNights > 0 ? Math.round(ytdRevenue / ytdRoomNights) : 0;

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const nextSix = nextSeasons(today, 6);

  const maxRev = Math.max(...metrics.map((m) => m.revenue), 1);

  const showInCcy = (krwAmount: number) =>
    displayCcy === "KRW" ? krwAmount : Math.round(krwAmount / FX_RATES[displayCcy]);

  const formatInCcy = (krwAmount: number) =>
    formatCurrency(showInCcy(krwAmount), displayCcy);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            호텔 지표 (RevPAR · ADR · Room Night)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            전체 {MOCK_ACCOUNTS.length}개 고객사 합산 · 24M 결정론적 데이터
          </p>
        </div>
        {/* 통화 토글 */}
        <div className="flex gap-1 items-center text-xs">
          <span className="text-muted-foreground mr-1">표시 통화</span>
          {(["KRW", "USD", "JPY", "VND"] as Currency[]).map((c) => (
            <Button
              key={c}
              variant={displayCcy === c ? "default" : "outline"}
              size="sm"
              onClick={() => setDisplayCcy(c)}
              className="h-8 px-2"
            >
              {CURRENCY_FLAG[c]} {c}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="이번달 RevPAR"
          value={formatInCcy(latest?.revPar ?? 0)}
          deltaPct={delta(latest?.revPar ?? 0, prev?.revPar ?? 0)}
          hint="객실 1실당 매출"
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="이번달 ADR"
          value={formatInCcy(latest?.adr ?? 0)}
          deltaPct={delta(latest?.adr ?? 0, prev?.adr ?? 0)}
          hint="객실 평균 단가"
        />
        <MetricCard
          icon={<Percent className="h-4 w-4" />}
          label="이번달 점유율"
          value={`${latest?.occupancyPct ?? 0}%`}
          deltaPct={delta(latest?.occupancyPct ?? 0, prev?.occupancyPct ?? 0)}
          hint="평균 객실 점유"
        />
        <MetricCard
          icon={<Building2 className="h-4 w-4" />}
          label="이번달 Room Night"
          value={formatNumber(latest?.roomNights ?? 0)}
          deltaPct={delta(latest?.roomNights ?? 0, prev?.roomNights ?? 0)}
          hint="판매된 총 객실-야"
        />
      </div>

      {/* YTD 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">YTD 합산</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">YTD Revenue</div>
              <div className="text-2xl font-bold tabular-nums">{formatInCcy(ytdRevenue)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">YTD Room Nights</div>
              <div className="text-2xl font-bold tabular-nums">{formatNumber(ytdRoomNights)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">YTD ADR</div>
              <div className="text-2xl font-bold tabular-nums">{formatInCcy(ytdAdr)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시즌성 캘린더 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            시즌성 캘린더 (12개월)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
            {SEASON_CALENDAR.map((m) => {
              const meta = SEASON_META[m.season];
              const isCurrent = m.month === currentMonth;
              return (
                <div
                  key={m.month}
                  className={cn(
                    "rounded-md p-2 text-center transition-all",
                    meta.bgClass,
                    isCurrent && "ring-2 ring-primary scale-105",
                  )}
                  title={m.reason}
                >
                  <div className="text-[10px] text-muted-foreground">{m.month}월</div>
                  <div className="text-base">{meta.emoji}</div>
                  <div className={cn("text-[10px] font-medium", meta.textClass)}>{meta.label}</div>
                </div>
              );
            })}
          </div>
          {/* 다음 6개월 미리보기 */}
          <div className="mt-4 pt-3 border-t">
            <div className="text-xs text-muted-foreground mb-2">📅 다음 6개월 — 영업 우선순위 가이드</div>
            <div className="space-y-1.5">
              {nextSix.map((s, i) => {
                const meta = SEASON_META[s.season];
                return (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Badge variant="muted" className="text-[10px] shrink-0">{s.month}월</Badge>
                    <span className="shrink-0">{meta.emoji}</span>
                    <span className={cn("font-medium shrink-0", meta.textClass)}>{meta.label}</span>
                    <span className="text-muted-foreground">— {s.reason}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 12개월 RevPAR / ADR 추이 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">12개월 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.map((m) => {
              const month = Number(m.month.slice(5, 7));
              const season = SEASON_CALENDAR[month - 1];
              const meta = SEASON_META[season.season];
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <div className="w-16 text-xs tabular-nums">{m.month}</div>
                  <span className="text-sm shrink-0" title={meta.label}>{meta.emoji}</span>
                  <div className="flex-1">
                    <div className="relative h-7 rounded bg-muted/30 overflow-hidden">
                      <div
                        className={cn("absolute inset-y-0 left-0", meta.bgClass)}
                        style={{ width: `${(m.revenue / maxRev) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
                        <span className="font-medium tabular-nums">{formatInCcy(m.revenue)}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {formatNumber(m.roomNights)} RN · {m.occupancyPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Commission Rate 표 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            Segment별 기본 수수료율
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(DEFAULT_COMMISSION_BY_SEGMENT).map(([seg, rate]) => (
              <div key={seg} className="rounded-md border p-3 text-center">
                <div className="text-xs text-muted-foreground">{seg.replace("_", " ")}</div>
                <div className="text-xl font-bold tabular-nums mt-1">
                  {(rate * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 GP 계산: <code>amount × (1 − commission)</code>. 향후 계약별 override 가능 예정.
          </p>
        </CardContent>
      </Card>

      {/* 환율 표 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">참조 환율 (2026-05 기준)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-xs">
            {(Object.keys(FX_RATES) as Currency[])
              .filter((c) => c !== "KRW")
              .slice(0, 8)
              .map((c) => (
                <Badge key={c} variant="muted" className="text-xs">
                  {CURRENCY_FLAG[c]} 1 {c} = ₩{toKrw(1, c).toLocaleString()}
                </Badge>
              ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 ELLIS 연동 시 일별 실시간 환율로 교체 예정.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}

// Lint: ensure tree-shaking does not warn on direct named imports
void getDefaultCommission;

function delta(cur: number, prev: number): number {
  if (prev === 0) return 0;
  return ((cur - prev) / prev) * 100;
}

function MetricCard({
  icon, label, value, deltaPct, hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  deltaPct: number;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          {icon}{label}
        </div>
        <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
        <div className="flex justify-between text-xs mt-1">
          <span className={cn(
            "tabular-nums",
            deltaPct > 0 ? "text-success" : deltaPct < 0 ? "text-destructive" : "text-muted-foreground",
          )}>
            {deltaPct > 0 ? "▲" : deltaPct < 0 ? "▼" : "·"} {Math.abs(deltaPct).toFixed(1)}% MoM
          </span>
          <span className="text-muted-foreground">{hint}</span>
        </div>
      </CardContent>
    </Card>
  );
}
