"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/common/PrintButton";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_ACTIVITIES } from "@/lib/mock/activities";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import {
  BarChart3, TrendingDown, Filter, Target, MessageSquare, LineChart, ArrowRight,
  Users, Grid3x3,
} from "lucide-react";

const PAGES = [
  {
    href: "/analytics/lost-reasons",
    title: "Lost Reason 분석",
    description: "왜 잃었나 — 사유 분포 + Segment·국가별 패턴",
    icon: TrendingDown,
    tone: "destructive" as const,
  },
  {
    href: "/analytics/funnel",
    title: "Sales Funnel",
    description: "단계별 이탈률 + 평균 체류일 + 병목 진단",
    icon: Filter,
    tone: "warning" as const,
  },
  {
    href: "/analytics/win-rate",
    title: "Win Rate by Segment",
    description: "어느 채널이 가장 잘 닫히나",
    icon: Target,
    tone: "success" as const,
  },
  {
    href: "/analytics/activities",
    title: "활동 → 매출 상관관계",
    description: "Win 딜당 평균 활동 N회 + 채널 효과",
    icon: MessageSquare,
    tone: "default" as const,
  },
  {
    href: "/analytics/okr-trend",
    title: "OKR 분기 트렌드",
    description: "분기별 진척률 추이 + KR 카테고리 분포",
    icon: LineChart,
    tone: "secondary" as const,
  },
  {
    href: "/analytics/cohort",
    title: "고객 코호트 분석",
    description: "첫 컨택 월별 묶음 — 매출/Win Rate 패턴",
    icon: Users,
    tone: "default" as const,
  },
  {
    href: "/analytics/visualize",
    title: "히트맵 / 워터폴",
    description: "활동 요일×시간대 + OKR 진척 분해 + 매출 워터폴",
    icon: Grid3x3,
    tone: "default" as const,
  },
];

export default function AnalyticsIndexPage() {
  const version = useSalesVersion();
  void version;

  const stats = useMemo(() => {
    const won = MOCK_DEALS.filter((d) => d.outcome === "WON");
    const lost = MOCK_DEALS.filter((d) => d.outcome === "LOST");
    const open = MOCK_DEALS.filter((d) => d.outcome === "OPEN");
    const closed = won.length + lost.length;
    return {
      wonCount: won.length,
      lostCount: lost.length,
      openCount: open.length,
      winRate: closed > 0 ? (won.length / closed) * 100 : 0,
      wonAmount: won.reduce((s, d) => s + d.amount, 0),
      lostAmount: lost.reduce((s, d) => s + d.amount, 0),
      activityCount: MOCK_ACTIVITIES.length,
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            영업 데이터를 분기 회고·OKR 설정·임원 보고에 활용 가능한 형태로 가공.
          </p>
        </div>
        <PrintButton label="요약 인쇄/PDF" />
      </div>

      {/* 상단 KPI 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="WON 딜" value={`${stats.wonCount}건`} sub={formatCurrency(stats.wonAmount)} tone="success" />
        <SummaryCard label="LOST 딜" value={`${stats.lostCount}건`} sub={formatCurrency(stats.lostAmount)} tone="destructive" />
        <SummaryCard label="OPEN 딜" value={`${stats.openCount}건`} sub="진행 중" tone="default" />
        <SummaryCard label="Win Rate" value={formatPercent(stats.winRate, 1)} sub={`${stats.wonCount} / ${stats.wonCount + stats.lostCount} 종결`} tone="primary" />
      </div>

      {/* 분석 페이지 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PAGES.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.href}
              href={p.href}
              className="group rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{p.title}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{p.description}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-base">데이터 보강 안내</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div>💡 WON/LOST 딜이 늘어날수록 분석이 정확해집니다. 칸반에서 카드를 Win/Lost 컬럼으로 드래그하면 즉시 반영됩니다.</div>
          <div>💡 모든 차트는 mock 데이터에서 실시간 계산되며, ELLIS 연동 시 실 데이터로 교체됩니다.</div>
          <Badge variant="muted" className="mt-2 text-[10px]">
            현재 활동 {stats.activityCount}건 · 종결 딜 {stats.wonCount + stats.lostCount}건
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label, value, sub, tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "success" | "destructive" | "default" | "primary";
}) {
  const colorClass = tone === "success" ? "text-success"
                   : tone === "destructive" ? "text-destructive"
                   : tone === "primary" ? "text-primary"
                   : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-bold tabular-nums mt-1 ${colorClass}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}
