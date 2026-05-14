"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MOCK_CRITICAL_6, MOCK_KPI_MANAGER } from "@/lib/mock/kpi";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_ACTIVITIES, MOCK_TASKS } from "@/lib/mock/activities";
import { formatCurrency, formatPercent, relativeTime } from "@/lib/utils/format";
import { CheckCircle2, Sparkles, Send, Save, Printer, Cloud, Loader2 } from "lucide-react";

const RECOMMENDED_HIGHLIGHTS = [
  "ABC Travel Q3 패키지 가격 합의 도출 ($94/night)",
  "JKL Travel 첫 미팅 — 결정권자 임원 직접 참석",
];

const RECOMMENDED_ACTIONS = [
  "XYZ DMC 결정권자 직접 통화 (18일 정체 해소)",
  "ABC Q4 견적서 작성 시작",
  "JKL 분기 거래 제안서 v1 (1주 내)",
  "부산 출장 5/16-17 (LMN 사후 미팅 + 신규 컨택 2건)",
  "OPQ Wholesale 미팅 잡기",
];

const AUTO_ISSUES = [
  "XYZ DMC Proposal Sent 18일째 — 무활동 5일",
  "OPQ Wholesale Contact 14일째 — 평균 3일 초과",
  "ABC API 일정 ABC측 IT 답신 지연",
];

type SaveStatus = "idle" | "saving" | "saved";

export default function BriefPage() {
  const [highlights, setHighlights] = useState(RECOMMENDED_HIGHLIGHTS.join("\n"));
  const [issues, setIssues] = useState("");
  const [nextWeekPlan, setNextWeekPlan] = useState(RECOMMENDED_ACTIONS.slice(0, 5).join("\n"));
  const [c6Items, setC6Items] = useState<string[]>(RECOMMENDED_ACTIONS.slice(0, 6));

  // 자동 저장 indicator — 입력 후 1.5초 debounce
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setSaveStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    }, 1500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [highlights, issues, nextWeekPlan, c6Items]);

  const week = currentIsoWeek();
  const won = MOCK_DEALS.filter((d) => d.outcome === "WON");
  const lost = MOCK_DEALS.filter((d) => d.outcome === "LOST");
  const meetings = MOCK_ACTIVITIES.filter((a) => a.activityType === "MEETING").length;
  const calls = MOCK_ACTIVITIES.filter((a) => a.activityType === "CALL").length;
  const proposals = MOCK_ACTIVITIES.filter((a) => a.activityType === "PROPOSAL_SENT").length;
  const messengers = MOCK_ACTIVITIES.filter((a) => a.activityType === "MESSENGER").length;
  const c6Done = MOCK_CRITICAL_6.filter((i) => i.done).length;
  const followupTotal = MOCK_TASKS.filter((t) => t.dueAt).length;
  const followupDone = MOCK_TASKS.filter((t) => t.status === "DONE").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr,260px] gap-4">
      {/* Left Sticky — Auto Summary */}
      <aside className="space-y-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              자동 요약
            </CardTitle>
            <p className="text-xs text-muted-foreground">CRM 데이터 기반 · 수정 불가</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Block label="이번 주 활동">
              <Row k="미팅" v={`${meetings}건`} />
              <Row k="통화" v={`${calls}건`} />
              <Row k="제안" v={`${proposals}건`} />
              <Row k="메신저" v={`${messengers}건`} />
            </Block>
            <Block label="이번 주 결과">
              <Row k="WON" v={`${won.length}건 ${formatCurrency(won.reduce((s, d) => s + d.amount, 0))}`} />
              <Row k="LOST" v={`${lost.length}건 ${formatCurrency(lost.reduce((s, d) => s + d.amount, 0))}`} />
              <Row k="신규" v="1개 (JKL Travel)" />
            </Block>
            <Block label="KPI 진척 (분기)">
              {MOCK_KPI_MANAGER.slice(0, 3).map((k) => (
                <Row key={k.code} k={k.label.replace("내 ", "").replace(" (Q2)", "")} v={`${k.achievementPct}%`} />
              ))}
            </Block>
            <Block label="Critical 6">
              <Row k="진척" v={`${c6Done}/${MOCK_CRITICAL_6.length}`} />
            </Block>
            <Block label="Follow-up">
              <Row
                k="완료율"
                v={followupTotal === 0 ? "—" : formatPercent((followupDone / followupTotal) * 100, 0)}
              />
            </Block>
          </CardContent>
        </Card>
      </aside>

      {/* Main */}
      <div className="space-y-4 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Weekly Sales Brief</h1>
            <p className="text-sm text-muted-foreground mt-1">
              김민수 · Korea Sales Team · W{week} ·
              {" "}
              <Badge variant="muted">DRAFT</Badge>
            </p>
          </div>
          <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
        </div>

        <Section title="✏️ 이번 주 주요 성과" hint="추천 2건이 아래에 자동으로 채워졌습니다. 수정 가능">
          <Recommendations items={RECOMMENDED_HIGHLIGHTS} />
          <textarea
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            className="w-full mt-2 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="이번 주 가장 인상적이었던 일..."
          />
        </Section>

        <Section title="🤖 이번 주 신규 / 미팅 / 제안 / 계약" hint="자동 리스트">
          <Card className="bg-muted/30">
            <CardContent className="p-4 text-sm space-y-2">
              <div>
                <span className="font-medium">신규 (1):</span> JKL Travel (🇰🇷 부산, OTA)
              </div>
              <div>
                <span className="font-medium">미팅 ({meetings}):</span>{" "}
                {MOCK_ACTIVITIES.filter((a) => a.activityType === "MEETING").slice(0, 3).map((a) => (
                  <span key={a.id} className="text-muted-foreground">{a.accountName} · </span>
                ))}
              </div>
              <div>
                <span className="font-medium">계약 ({won.length} WON / {lost.length} LOST):</span>{" "}
                {won.map((d) => (
                  <span key={d.id} className="text-success font-medium">WON {d.name} · </span>
                ))}
                {lost.map((d) => (
                  <span key={d.id} className="text-destructive font-medium">LOST {d.name} · </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title="🤖 진행 중 주요 딜 TOP 5" hint="OPEN 딜, 금액 큰 순">
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2">
              {MOCK_DEALS.filter((d) => d.outcome === "OPEN")
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{d.name}</span>
                      <span className="text-muted-foreground"> · {d.stageName}</span>
                    </div>
                    <div className="tabular-nums">
                      {formatCurrency(d.amount)} / {d.daysInStage}일
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </Section>

        <Section title="✏️ 막힌 이슈 / 리더 지원 필요" hint="자동 감지된 이슈 + 사용자 추가">
          <div className="space-y-1.5 mb-2">
            {AUTO_ISSUES.map((s, i) => (
              <div key={i} className="text-sm bg-warning/10 text-warning px-3 py-2 rounded">
                ⚠ {s}
              </div>
            ))}
          </div>
          <textarea
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="추가할 이슈가 있다면..."
          />
        </Section>

        <Section title="✏️ 다음 주 Action Plan" hint="추천 5개">
          <Recommendations items={RECOMMENDED_ACTIONS} />
          <textarea
            value={nextWeekPlan}
            onChange={(e) => setNextWeekPlan(e.target.value)}
            className="w-full mt-2 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </Section>

        <Section title="✏️ 다음 주 Critical 6" hint="작성 시 critical_six 자동 생성">
          <div className="space-y-2">
            {c6Items.map((item, i) => (
              <Input
                key={i}
                value={item}
                onChange={(e) => {
                  const next = [...c6Items];
                  next[i] = e.target.value;
                  setC6Items(next);
                }}
              />
            ))}
          </div>
        </Section>
      </div>

      {/* Right Sticky — Submit */}
      <aside>
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">제출 진행</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Progress value={(c6Done / 6) * 100} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">
                Critical 6: {c6Done}/6 · 마감 일요일 21:00
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <Check label="자동 요약" done />
              <Check label="이번주 성과" done={highlights.length > 0} />
              <Check label="막힌 이슈" done={AUTO_ISSUES.length > 0 || issues.length > 0} />
              <Check label="다음주 액션" done={nextWeekPlan.length > 0} />
              <Check label="다음주 Critical 6" done={c6Items.length >= 4} />
            </div>
            <div className="space-y-2 pt-2">
              <Button variant="outline" className="w-full" size="sm">
                <Save className="h-4 w-4" />
                임시저장
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => typeof window !== "undefined" && window.print()}
              >
                <Printer className="h-4 w-4" />
                인쇄 / PDF 저장
              </Button>
              <Button className="w-full">
                <Send className="h-4 w-4" />
                제출하기
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              제출 시 다음주 Critical 6가 자동 생성되고 LEAD에게 알림이 갑니다.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Recommendations({ items }: { items: string[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span className="italic">[추천] {it}</span>
        </div>
      ))}
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium tabular-nums">{v}</span>
    </div>
  );
}

function SaveIndicator({ status, lastSavedAt }: { status: SaveStatus; lastSavedAt: Date | null }) {
  if (status === "idle" && !lastSavedAt) return null;
  if (status === "saving") {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />저장 중...
      </div>
    );
  }
  return (
    <div className="text-xs text-success flex items-center gap-1.5">
      <Cloud className="h-3.5 w-3.5" />
      {lastSavedAt ? `${relativeTime(lastSavedAt)} 자동 저장됨` : "자동 저장됨"}
    </div>
  );
}

function Check({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className={`h-4 w-4 ${done ? "text-success" : "text-muted"}`} />
      <span className={done ? "" : "text-muted-foreground"}>{label}</span>
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
