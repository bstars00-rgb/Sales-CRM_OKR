"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KpiCardWidget } from "@/components/dashboard/KpiCard";
import { MOCK_KPI_LEAD, MOCK_TEAM_MEMBERS } from "@/lib/mock/kpi";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_RISK_ALERTS } from "@/lib/mock/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { AlertTriangle } from "lucide-react";

const PACING_DOT = { ok: "bg-success", warn: "bg-warning", bad: "bg-destructive" };

export default function LeadDashboardPage() {
  const stalled = MOCK_DEALS.filter((d) => d.outcome === "OPEN" && d.daysInStage >= 14);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">팀 대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">Korea Sales Team · 2026 Q2 · 6주차</p>
      </div>

      {/* Hero */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {MOCK_KPI_LEAD.map((card) => (
          <KpiCardWidget key={card.code} card={card} />
        ))}
      </div>

      {/* Team Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>팀원별 KPI 매트릭스</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">멤버</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">매출 진척</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">GP 진척</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">미팅</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">제안</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Win율</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">BRIEF</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Critical 6</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">알림</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TEAM_MEMBERS.map((m) => (
                  <tr key={m.userId} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", PACING_DOT[m.pacing])} />
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.role}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={Math.min(m.revenueAchievementPct, 100)} className="w-16 h-1.5" />
                        <span className="font-medium tabular-nums w-10 text-right">{m.revenueAchievementPct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">{m.gpAchievementPct}%</td>
                    <td className="py-3 px-3 text-right tabular-nums">{m.meetings}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{m.proposals}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{m.winRate}%</td>
                    <td className="py-3 px-3 text-right">
                      <span className={cn(m.briefRate < 70 ? "text-destructive font-medium" : "")}>
                        {m.briefRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      {m.critical6Done}/{m.critical6Total}
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
            {stalled.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2 text-sm border-b last:border-0 py-2">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.accountName} · {d.stageName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(d.amount)}</div>
                  <Badge variant={d.daysInStage >= 21 ? "destructive" : "warning"} className="text-xs">
                    {d.daysInStage}일 정체
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>🚨 위험 신호</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_RISK_ALERTS.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm border-b last:border-0 py-2">
                <Badge
                  variant={r.severity === "HIGH" ? "destructive" : "warning"}
                  className="text-xs shrink-0 mt-0.5"
                >
                  {r.kind}
                </Badge>
                <span className="flex-1">{r.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
