"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_TEAM_MEMBERS } from "@/lib/mock/kpi";
import { formatCurrency } from "@/lib/utils/format";

export default function TeamBriefPage() {
  const week = currentIsoWeek();
  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">팀 Weekly Sales Brief</h1>
        <p className="text-sm text-muted-foreground mt-1">Korea Sales Team · W{week} · Lead 박상무</p>
      </div>

      <Card>
        <CardHeader><CardTitle>🤖 팀 자동 요약</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">실적 합산</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="매출" value={formatCurrency(412_000_000)} delta="▲18%" />
              <Stat label="GP" value={formatCurrency(61_000_000)} />
              <Stat label="WON" value="7건" />
              <Stat label="신규" value="3개" />
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">KPI 진척 (분기 누적)</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="REVENUE" value="84%" badge="ok" />
              <Stat label="GP" value="80%" badge="ok" />
              <Stat label="신규" value="75%" badge="warn" />
              <Stat label="WIN율" value="32%" badge="ok" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>🤖 팀원별 한 줄</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {MOCK_TEAM_MEMBERS.map((m) => (
            <div key={m.userId} className="flex items-center justify-between text-sm border-b last:border-0 py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{m.name}</span>
                <Badge
                  variant={m.pacing === "ok" ? "success" : m.pacing === "warn" ? "warning" : "destructive"}
                  className="text-xs"
                >
                  {m.revenueAchievementPct}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                C6 {m.critical6Done}/{m.critical6Total} · BRIEF {m.briefRate}%
                {m.alerts.length > 0 && <span className="text-warning"> · ⚠ {m.alerts[0]}</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>🤖 Lost Deal 분석 (직전 4주)</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>이번 주 LOST 2건 합 ₩48M</div>
          <div className="text-muted-foreground">
            • XYZ 5월 단발 ₩28M — Reason: PRICE (경쟁사: Agoda)
          </div>
          <div className="border-l-2 border-warning pl-3 mt-2 bg-warning/5 p-2 rounded">
            💡 인사이트: 4주 추세 PRICE 사유 43% — 가격 가이드 검토 필요
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>✏️ 다음 주 팀 우선순위 (Lead 입력)</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm list-disc pl-5">
            <li>XYZ DMC 정체 해소 — 가격 결정권 임원 동석 미팅 검토</li>
            <li>박지영 1on1 즉시 (4주 누락 + 페이스 62%)</li>
            <li>Q3 가격 가이드 회의 — 임원진 결정 필요</li>
            <li>신규 KEY 후보 JKL 집중</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, delta, badge }: { label: string; value: string; delta?: string; badge?: "ok" | "warn" }) {
  return (
    <div className="rounded border bg-muted/20 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-bold mt-0.5 flex items-center gap-2">
        {value}
        {delta && <span className="text-success text-xs">{delta}</span>}
      </div>
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
