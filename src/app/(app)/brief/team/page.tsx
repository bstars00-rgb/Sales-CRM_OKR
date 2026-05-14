"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTeamBrief } from "@/lib/brief/aggregate";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useState } from "react";

const TEAMS = [
  "Korea Sales Team",
  "Vietnam Sales Team",
  "Japan Sales Team",
  "SEA Sales Team",
];

const PACING_COLOR = {
  ok:   "bg-success",
  warn: "bg-warning",
  bad:  "bg-destructive",
};

export default function TeamBriefPage() {
  const [team, setTeam] = useState(TEAMS[0]);
  const brief = getTeamBrief(team);
  const week = currentIsoWeek();
  const gpRate = brief.revenue > 0 ? (brief.gp / brief.revenue) * 100 : 0;

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">팀 Weekly Sales Brief</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {brief.scopeName} · W{week} · <Badge variant="muted">자동 집계</Badge>
        </p>
      </div>

      {/* 팀 전환 탭 */}
      <div className="flex gap-1 border-b">
        {TEAMS.map((t) => (
          <button
            key={t}
            onClick={() => setTeam(t)}
            className={cn(
              "px-3 py-2 text-sm border-b-2 transition-colors -mb-px",
              team === t
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.replace(" Sales Team", "")}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">🤖 팀 자동 요약</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="text-xs text-muted-foreground mb-2">이번주 실적 합산</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="WON 매출" value={formatCurrency(brief.revenue)} sub={`${brief.wonCount}건`} accent="success" />
              <Stat label="GP" value={formatCurrency(brief.gp)} sub={gpRate > 0 ? `${gpRate.toFixed(1)}% 마진` : ""} />
              <Stat label="LOST" value={formatCurrency(brief.lostAmount)} sub={`${brief.lostCount}건`} accent={brief.lostAmount > 0 ? "destructive" : "muted"} />
              <Stat label="신규 활성" value={`${brief.newAccounts}건`} accent="primary" />
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">이번주 활동</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Stat label="미팅" value={`${brief.meetings}건`} />
              <Stat label="통화" value={`${brief.calls}건`} />
              <Stat label="제안" value={`${brief.proposals}건`} />
              <Stat label="이메일" value={`${brief.emails}건`} />
              <Stat label="메신저" value={`${brief.messengers}건`} />
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">파이프라인</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat label="OPEN 합계" value={formatCurrency(brief.pipelineOpen)}
                    sub={<><TrendingUp className="inline h-3 w-3 text-success" /> +{brief.pipelineDelta}%</>} />
              <Stat label="정체 딜 (14일+)" value={`${brief.staleDealCount}건`}
                    accent={brief.staleDealCount >= 3 ? "destructive" : brief.staleDealCount >= 1 ? "warning" : "muted"} />
              <Stat label="미접촉 KEY/GROWTH" value={`${brief.dormantKeyAccounts}건`}
                    accent={brief.dormantKeyAccounts >= 2 ? "destructive" : brief.dormantKeyAccounts >= 1 ? "warning" : "muted"} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">🤖 팀원별 한 줄 ({brief.ownerSummaries.length}명)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {brief.ownerSummaries.map((o) => (
            <div key={o.ownerUserId} className="flex items-center justify-between gap-3 text-sm border-b last:border-0 py-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", PACING_COLOR[o.pacing])} />
                <span className="font-medium">{o.ownerName}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>WON {o.wonCount}건 · {formatCurrency(o.wonAmount)}</span>
                <span>미팅 {o.meetings}건</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {brief.topWonDeals.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />이번주 WON TOP {brief.topWonDeals.length}
          </CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {brief.topWonDeals.map((d, i) => (
              <div key={i} className="flex justify-between text-sm border-b last:border-0 py-2">
                <div>
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground"> · {d.accountName}</span>
                </div>
                <span className="font-medium tabular-nums">{formatCurrency(d.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {brief.topLostDeals.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader><CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />이번주 LOST 분석
          </CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {brief.topLostDeals.map((d, i) => (
              <div key={i} className="flex justify-between text-sm border-b last:border-0 py-2">
                <div>
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground"> · {d.accountName}</span>
                </div>
                <span className="font-medium tabular-nums">{formatCurrency(d.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />다음 주 팀 우선순위 (Lead 입력)
        </CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {brief.staleDealCount > 0 && (
            <div className="text-sm">🔧 정체 딜 {brief.staleDealCount}건 해소 — 결정권자 직접 통화·임원 동석 미팅</div>
          )}
          {brief.dormantKeyAccounts > 0 && (
            <div className="text-sm">🚨 미접촉 KEY/GROWTH {brief.dormantKeyAccounts}건 재진입 시도</div>
          )}
          {brief.lostCount > 0 && (
            <div className="text-sm">🔍 LOST 사유 분석 회의 — 가격 vs 경쟁사 vs 타이밍 비중</div>
          )}
          <div className="text-sm">📈 분기말까지 OPEN {formatCurrency(brief.pipelineOpen)} 중 60% 클로징 목표</div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-between">
        <Button variant="outline" asChild>
          <Link href="/brief">← 내 보고서</Link>
        </Button>
        <Button asChild>
          <Link href="/brief/company">회사 보고서 <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({
  label, value, sub, accent,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  accent?: "success" | "warning" | "destructive" | "primary" | "muted";
}) {
  const accentCls = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    primary: "text-primary",
    muted: "text-foreground",
  };
  return (
    <div className="rounded border bg-muted/20 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-base font-bold mt-0.5", accent && accentCls[accent])}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function currentIsoWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
