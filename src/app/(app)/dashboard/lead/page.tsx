"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KpiCardWidget } from "@/components/dashboard/KpiCard";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { getTeamMembersComputed } from "@/lib/team/members";
import { getTeamBrief, KOREA_TEAM_OWNERS, VIETNAM_TEAM_OWNERS, JAPAN_TEAM_OWNERS, SEA_TEAM_OWNERS } from "@/lib/brief/aggregate";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { AlertTriangle } from "lucide-react";

const TEAMS = [
  { id: "korea",   name: "Korea Sales Team",   owners: KOREA_TEAM_OWNERS },
  { id: "vietnam", name: "Vietnam Sales Team", owners: VIETNAM_TEAM_OWNERS },
  { id: "japan",   name: "Japan Sales Team",   owners: JAPAN_TEAM_OWNERS },
  { id: "sea",     name: "SEA Sales Team",     owners: SEA_TEAM_OWNERS },
];

const PACING_DOT = { ok: "bg-success", warn: "bg-warning", bad: "bg-destructive" };

export default function LeadDashboardPage() {
  const [activeTeam, setActiveTeam] = useState(TEAMS[0]);

  const members = useMemo(
    () => getTeamMembersComputed(activeTeam.owners),
    [activeTeam]
  );

  const brief = useMemo(() => getTeamBrief(activeTeam.name), [activeTeam]);

  const stalled = useMemo(
    () => MOCK_DEALS.filter(
      (d) => d.outcome === "OPEN"
        && d.daysInStage >= 14
        && activeTeam.owners.includes(d.ownerUserId)
    ),
    [activeTeam]
  );

  // 팀 KPI 카드 — Brief 합산값으로
  const teamKpiCards = [
    { code: "TEAM_REVENUE", label: "팀 매출 (분기 추정)", unit: "KRW",
      current: brief.revenue * 4, target: 2_000_000_000,
      achievementPct: Math.round(((brief.revenue * 4) / 2_000_000_000) * 100) },
    { code: "TEAM_GP", label: "팀 GP", unit: "KRW",
      current: brief.gp * 4, target: 300_000_000,
      achievementPct: Math.round(((brief.gp * 4) / 300_000_000) * 100) },
    { code: "TEAM_NEW", label: "신규 활성", unit: "건",
      current: brief.newAccounts, target: 8,
      achievementPct: Math.round((brief.newAccounts / 8) * 100) },
    { code: "TEAM_OPEN", label: "OPEN 파이프라인", unit: "KRW",
      current: brief.pipelineOpen, target: 0, achievementPct: 0 },
    { code: "STALE", label: "정체 딜 (14일+)", unit: "건",
      current: brief.staleDealCount, target: 0, achievementPct: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">팀 대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">자동 집계 · {brief.scopeName}</p>
      </div>

      {/* 팀 전환 탭 */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {TEAMS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTeam(t)}
            className={cn(
              "px-3 py-2 text-sm border-b-2 transition-colors -mb-px whitespace-nowrap",
              activeTeam.id === t.id
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.name.replace(" Sales Team", "")} ({t.owners.length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {teamKpiCards.map((card) => (
          <KpiCardWidget key={card.code} card={card} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>팀원별 KPI 매트릭스</span>
            <Badge variant="muted" className="text-xs">{members.length}명 · 자동 합산</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">멤버</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">매출 진척</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">GP</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">미팅</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">제안</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Win율</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">인센 추정</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">C6/BRIEF</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">알림</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.userId} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", PACING_DOT[m.pacing])} />
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground hidden md:inline">{m.role}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={Math.min(m.revenueAchievementPct, 100)} className="w-12 md:w-16 h-1.5" />
                        <span className="font-medium tabular-nums w-10 text-right">{m.revenueAchievementPct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">{m.gpAchievementPct}%</td>
                    <td className="py-3 px-3 text-right tabular-nums">{m.meetings}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{m.proposals}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{m.winRate}%</td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatCurrency(m.totalIncentive)}</td>
                    <td className="py-3 px-3 text-right text-xs">
                      <span className={m.briefRate < 70 ? "text-destructive font-medium" : ""}>
                        {m.critical6Done}/{m.critical6Total} · {m.briefRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {m.alerts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.alerts.map((a, i) => (
                            <Badge key={i} variant="warning" className="text-xs">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              정체된 딜 ({stalled.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stalled.length === 0 ? (
              <div className="text-sm text-muted-foreground py-3 text-center">정체 딜 없음 — 잘 흐르고 있습니다 👍</div>
            ) : (
              stalled.map((d) => (
                <Link
                  key={d.id}
                  href={`/crm/deals/${d.id}`}
                  className="flex items-center justify-between gap-2 text-sm border-b last:border-0 py-2 hover:bg-accent/30 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{d.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {d.accountName} · {d.stageName} · {d.ownerName}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-medium tabular-nums">{formatCurrency(d.amount)}</div>
                    <Badge variant={d.daysInStage >= 21 ? "destructive" : "warning"} className="text-xs">
                      {d.daysInStage}일
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>이번주 한 줄</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row k="WON 매출" v={formatCurrency(brief.revenue)} good />
            <Row k="WON 건수" v={`${brief.wonCount}건`} good />
            <Row k="LOST" v={`${brief.lostCount}건 · ${formatCurrency(brief.lostAmount)}`}
                 bad={brief.lostAmount > 0} />
            <Row k="활동 합계" v={`${brief.meetings + brief.calls + brief.emails + brief.proposals + brief.messengers}건`} />
            <Row k="OPEN 파이프" v={formatCurrency(brief.pipelineOpen)} />
            <Row k="미접촉 KEY/GROWTH" v={`${brief.dormantKeyAccounts}건`}
                 bad={brief.dormantKeyAccounts > 0} />
            <Link href="/brief/team" className="text-xs text-primary hover:underline inline-block mt-2">
              팀 주간보고 전체 보기 →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v, good, bad }: { k: string; v: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="flex justify-between border-b last:border-0 py-1.5">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("font-medium tabular-nums", good && "text-success", bad && "text-destructive")}>{v}</span>
    </div>
  );
}
