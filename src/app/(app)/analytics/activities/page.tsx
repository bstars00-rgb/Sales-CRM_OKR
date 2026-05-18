"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_ACTIVITIES } from "@/lib/mock/activities";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { MessageSquare, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ACTIVITY_ICON: Record<string, string> = {
  CALL: "📞", MEETING: "📅", EMAIL_LOG: "✉", MESSENGER: "💬",
  PROPOSAL_SENT: "📝", CONTRACT_SENT: "✍", NOTE: "🗒",
  FOLLOW_UP: "🔁", CUSTOMER_REQUEST: "❓", INTERNAL_REQUEST: "🏢",
};

export default function ActivitiesCorrelationPage() {
  const version = useSalesVersion();
  void version;

  // Account별 활동 수 집계
  const activityByAccount = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of MOCK_ACTIVITIES) {
      if (a.accountId) {
        map.set(a.accountId, (map.get(a.accountId) ?? 0) + 1);
      }
    }
    return map;
  }, []);

  // Account별 활동 채널 집계
  const channelByAccount = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const a of MOCK_ACTIVITIES) {
      if (!a.accountId) continue;
      const inner = map.get(a.accountId) ?? new Map<string, number>();
      inner.set(a.activityType, (inner.get(a.activityType) ?? 0) + 1);
      map.set(a.accountId, inner);
    }
    return map;
  }, []);

  // WON 딜 — 평균 활동 수
  const wonDeals = MOCK_DEALS.filter((d) => d.outcome === "WON");
  const lostDeals = MOCK_DEALS.filter((d) => d.outcome === "LOST");
  const openDeals = MOCK_DEALS.filter((d) => d.outcome === "OPEN");

  const wonActivities = wonDeals.map((d) => activityByAccount.get(d.accountId) ?? 0);
  const lostActivities = lostDeals.map((d) => activityByAccount.get(d.accountId) ?? 0);
  const openActivities = openDeals.map((d) => activityByAccount.get(d.accountId) ?? 0);

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
  const wonAvg = avg(wonActivities);
  const lostAvg = avg(lostActivities);
  const openAvg = avg(openActivities);

  // 활동 채널별 → Win 기여도
  const channelEffectiveness = useMemo(() => {
    const channelStats = new Map<string, { wonContacts: number; lostContacts: number; openContacts: number }>();
    for (const d of MOCK_DEALS) {
      const inner = channelByAccount.get(d.accountId);
      if (!inner) continue;
      inner.forEach((count, channel) => {
        const cur = channelStats.get(channel) ?? { wonContacts: 0, lostContacts: 0, openContacts: 0 };
        if (d.outcome === "WON") cur.wonContacts += count;
        else if (d.outcome === "LOST") cur.lostContacts += count;
        else cur.openContacts += count;
        channelStats.set(channel, cur);
      });
    }
    return Array.from(channelStats.entries())
      .map(([channel, v]) => ({
        channel,
        ...v,
        total: v.wonContacts + v.lostContacts + v.openContacts,
      }))
      .sort((a, b) => b.total - a.total);
  }, [channelByAccount]);

  // 활동 vs 매출 산점도 데이터
  const scatter = useMemo(() => {
    return MOCK_DEALS.map((d) => ({
      id: d.id,
      name: d.name,
      account: d.accountName,
      activities: activityByAccount.get(d.accountId) ?? 0,
      amount: d.amount,
      outcome: d.outcome,
    }));
  }, [activityByAccount]);

  const maxScatterActivities = Math.max(...scatter.map((s) => s.activities), 1);
  const maxScatterAmount = Math.max(...scatter.map((s) => s.amount), 1);
  const maxChannelTotal = Math.max(...channelEffectiveness.map((c) => c.total), 1);

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/analytics"><ArrowLeft className="h-4 w-4" />분석 인덱스</Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          활동 → 매출 상관관계
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          전체 활동 {formatNumber(MOCK_ACTIVITIES.length)}건 · 결과별 평균 접점 수 + 채널 효과
        </p>
      </div>

      {/* 핵심 비교 — WON vs LOST 활동 수 */}
      <Card className={cn(
        "border",
        wonAvg > lostAvg ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5",
      )}>
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className={cn("h-5 w-5 shrink-0 mt-0.5", wonAvg > lostAvg ? "text-success" : "text-warning")} />
          <div className="text-sm space-y-1">
            <div className="font-semibold">📊 결과별 평균 활동 수 (담당 고객사 기준)</div>
            <div>
              · 🏆 WON 딜: 평균 <b className="tabular-nums">{wonAvg.toFixed(1)}건</b> 활동
            </div>
            <div>
              · ❌ LOST 딜: 평균 <b className="tabular-nums">{lostAvg.toFixed(1)}건</b> 활동
            </div>
            <div>
              · ⏳ OPEN 딜: 평균 <b className="tabular-nums">{openAvg.toFixed(1)}건</b> 활동
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {wonAvg > lostAvg
                ? "💡 활동 빈도가 높을수록 Win 가능성이 높습니다 — 접점 강화 전략 효과 입증."
                : "💡 활동량만이 결정 요인은 아닙니다 — 채널 품질·관계 깊이를 함께 봐야 합니다."}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WON vs LOST 평균 막대 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">결과별 활동 빈도 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <CompareBar label="🏆 WON" value={wonAvg} max={Math.max(wonAvg, lostAvg, openAvg, 1)} tone="success" subtitle={`${wonDeals.length}건 평균`} />
            <CompareBar label="⏳ OPEN" value={openAvg} max={Math.max(wonAvg, lostAvg, openAvg, 1)} tone="primary" subtitle={`${openDeals.length}건 평균`} />
            <CompareBar label="❌ LOST" value={lostAvg} max={Math.max(wonAvg, lostAvg, openAvg, 1)} tone="destructive" subtitle={`${lostDeals.length}건 평균`} />
          </div>
        </CardContent>
      </Card>

      {/* 채널별 효과 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">채널별 사용 빈도 + Win 기여</CardTitle>
          <p className="text-xs text-muted-foreground">WON/LOST/OPEN 딜의 담당 고객사에 기록된 활동 수</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {channelEffectiveness.map((c) => {
              const winShare = c.total > 0 ? (c.wonContacts / c.total) * 100 : 0;
              return (
                <div key={c.channel}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg shrink-0">{ACTIVITY_ICON[c.channel] ?? "•"}</span>
                      <span className="text-sm font-medium">{c.channel.replace("_", " ")}</span>
                      <Badge variant="muted" className="text-[10px]">{c.total}건</Badge>
                    </div>
                    <span className="text-xs tabular-nums">
                      WON {c.wonContacts} · OPEN {c.openContacts} · LOST {c.lostContacts}
                    </span>
                  </div>
                  <div className="h-3 bg-muted/30 rounded flex overflow-hidden">
                    <div className="bg-success/70" style={{ width: `${(c.wonContacts / maxChannelTotal) * 100}%` }} />
                    <div className="bg-primary/70" style={{ width: `${(c.openContacts / maxChannelTotal) * 100}%` }} />
                    <div className="bg-destructive/70" style={{ width: `${(c.lostContacts / maxChannelTotal) * 100}%` }} />
                  </div>
                  {c.total >= 3 && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      WON 기여 비중: <span className={cn(
                        "tabular-nums",
                        winShare >= 50 ? "text-success" : winShare >= 25 ? "text-warning" : "text-muted-foreground",
                      )}>{winShare.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 활동 vs 매출 산점도 (간단한 grid 시각화) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">딜 산점도 — X: 활동수, Y: 매출액</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 border rounded bg-muted/10 p-2">
            {/* 축 */}
            <div className="absolute left-0 right-0 bottom-6 h-px bg-border" />
            <div className="absolute left-12 top-0 bottom-6 w-px bg-border" />
            {/* X label */}
            <div className="absolute left-1/2 bottom-0 text-[10px] text-muted-foreground -translate-x-1/2">
              활동 수 → (최대 {maxScatterActivities})
            </div>
            {/* Y label */}
            <div className="absolute left-0 top-1/2 text-[10px] text-muted-foreground -translate-y-1/2 -rotate-90 origin-center">
              매출 →
            </div>
            {/* 점 */}
            {scatter.map((s) => {
              const x = 12 + ((s.activities / maxScatterActivities) * 88);
              const y = 100 - 6 - ((s.amount / maxScatterAmount) * 92);
              const color = s.outcome === "WON" ? "bg-success"
                          : s.outcome === "LOST" ? "bg-destructive"
                          : "bg-primary";
              return (
                <div
                  key={s.id}
                  className={cn("absolute rounded-full opacity-70 hover:opacity-100 transition-opacity", color)}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: "10px",
                    height: "10px",
                    transform: "translate(-50%, -50%)",
                  }}
                  title={`${s.name}\n활동 ${s.activities}건 · ${formatCurrency(s.amount)} · ${s.outcome}`}
                />
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-center">
            <span><span className="inline-block h-2 w-2 rounded-full bg-success mr-1" />WON</span>
            <span><span className="inline-block h-2 w-2 rounded-full bg-primary mr-1" />OPEN</span>
            <span><span className="inline-block h-2 w-2 rounded-full bg-destructive mr-1" />LOST</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompareBar({
  label, value, max, tone, subtitle,
}: {
  label: string;
  value: number;
  max: number;
  tone: "success" | "destructive" | "primary";
  subtitle: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const colorClass = tone === "success" ? "bg-success/70"
                   : tone === "destructive" ? "bg-destructive/70"
                   : "bg-primary/70";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm tabular-nums">
          {value.toFixed(1)}건 <span className="text-xs text-muted-foreground">({subtitle})</span>
        </span>
      </div>
      <div className="h-6 bg-muted/30 rounded">
        <div className={cn("h-full rounded transition-all", colorClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
