"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCompanyBrief, getTeamBrief } from "@/lib/brief/aggregate";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Globe } from "lucide-react";

const TEAMS = ["Korea Sales Team", "Vietnam Sales Team", "Japan Sales Team", "SEA Sales Team"];

export default function CompanyBriefPage() {
  const brief = getCompanyBrief();
  const teamBriefs = TEAMS.map((t) => ({ name: t, brief: getTeamBrief(t) }));
  const week = currentIsoWeek();
  const gpRate = brief.revenue > 0 ? (brief.gp / brief.revenue) * 100 : 0;

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">회사 Weekly Sales Brief</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {brief.scopeName} · W{week} · <Badge variant="muted">자동 집계</Badge>
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />🤖 회사 자동 요약
        </CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="text-xs text-muted-foreground mb-2">이번주 실적 합산</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="회사 WON 매출" value={formatCurrency(brief.revenue)} sub={`${brief.wonCount}건`} accent="success" />
              <Stat label="회사 GP" value={formatCurrency(brief.gp)} sub={gpRate > 0 ? `${gpRate.toFixed(1)}% 마진` : ""} />
              <Stat label="LOST 합계" value={formatCurrency(brief.lostAmount)} sub={`${brief.lostCount}건`}
                    accent={brief.lostAmount > 0 ? "destructive" : "muted"} />
              <Stat label="신규 활성" value={`${brief.newAccounts}건`} accent="primary" />
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">활동·파이프라인</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="미팅" value={`${brief.meetings}건`} />
              <Stat label="제안" value={`${brief.proposals}건`} />
              <Stat label="OPEN 합계" value={formatCurrency(brief.pipelineOpen)} sub={`+${brief.pipelineDelta}% 전주 대비`} />
              <Stat label="정체 + 미접촉" value={`${brief.staleDealCount + brief.dormantKeyAccounts}건`}
                    accent={(brief.staleDealCount + brief.dormantKeyAccounts) >= 5 ? "destructive" : "warning"} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">🌏 팀별 비교</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">팀</th>
                  <th className="text-right py-2 font-medium">WON</th>
                  <th className="text-right py-2 font-medium">GP</th>
                  <th className="text-right py-2 font-medium">미팅</th>
                  <th className="text-right py-2 font-medium">OPEN 파이프</th>
                  <th className="text-right py-2 font-medium">정체</th>
                  <th className="text-right py-2 font-medium">미접촉 KEY</th>
                </tr>
              </thead>
              <tbody>
                {teamBriefs.map(({ name, brief: t }) => (
                  <tr key={name} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="py-2.5">
                      <span className="font-medium">{name.replace(" Sales Team", "")}</span>
                      <span className="text-xs text-muted-foreground ml-1">({t.members.length})</span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(t.revenue)}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(t.gp)}</td>
                    <td className="py-2.5 text-right tabular-nums">{t.meetings}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(t.pipelineOpen)}</td>
                    <td className={cn("py-2.5 text-right tabular-nums", t.staleDealCount >= 2 && "text-warning font-medium")}>
                      {t.staleDealCount}
                    </td>
                    <td className={cn("py-2.5 text-right tabular-nums", t.dormantKeyAccounts >= 1 && "text-destructive font-medium")}>
                      {t.dormantKeyAccounts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />임원 / CEO 의사결정 필요사항
        </CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {brief.dormantKeyAccounts >= 2 && (
            <div>🚨 KEY/GROWTH 미접촉 {brief.dormantKeyAccounts}건 — 분기말 정리/재진입 방침 결정</div>
          )}
          {brief.staleDealCount >= 5 && (
            <div>⚠ 정체 딜 {brief.staleDealCount}건 — 가격 가이드 또는 임원 직접 개입 필요</div>
          )}
          <div>📊 분기 60% 경과 — 회사 매출 페이싱 점검 + Q3 OKR 초안 의사결정</div>
          <div>💼 Tokyo Bridge 분기말 재시도 또는 공식 종료 결정</div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-between">
        <Button variant="outline" asChild>
          <Link href="/brief/team"><ArrowLeft className="h-4 w-4" />팀 보고서</Link>
        </Button>
        <Button onClick={() => typeof window !== "undefined" && window.print()}>
          전체 발송 (PDF 인쇄)
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
  const cls = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    primary: "text-primary",
    muted: "text-foreground",
  };
  return (
    <div className="rounded border bg-muted/20 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-base font-bold mt-0.5", accent && cls[accent])}>{value}</div>
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
