"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getObjectivesWithAutoProgress } from "@/lib/okr/auto-progress";
import { useSalesVersion } from "@/lib/store/sales-store";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const KIND_LABEL: Record<"COMPANY" | "TEAM" | "USER", string> = {
  COMPANY: "회사", TEAM: "팀", USER: "개인",
};

export default function OkrRetroPage() {
  const version = useSalesVersion();
  const objectives = useMemo(() => getObjectivesWithAutoProgress(), [version]);

  // 분기 회고 점수 계산:
  // - 평균 진척률 = OKR 점수 (Google OKR 가이드: 60-80%가 이상적)
  // - 70-80%: 우수 (도전적이면서 달성)
  // - 60-69%: 양호
  // - <60%: 부진 (보수적 목표였거나 실행 실패)
  // - 100%+: 너무 보수적 (다음 분기 더 도전적으로)
  const avgScore = Math.round(
    objectives.reduce((s, o) => s + o.progressPct, 0) / objectives.length
  );

  const ratings: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "default"; advice: string }> = {
    excellent: { label: "🏆 우수",   variant: "success",     advice: "도전적인 목표를 달성. 다음 분기에도 비슷한 난이도 권장." },
    good:      { label: "🟢 양호",   variant: "default",     advice: "Google OKR 가이드의 이상적 범위 (60-80%). 잘 운영됨." },
    weak:      { label: "🟡 부진",   variant: "warning",     advice: "목표가 너무 컸거나 실행이 부족. 1on1에서 원인 분석 필요." },
    failed:    { label: "🔴 실패",   variant: "destructive", advice: "목표 재검토 필수. 실행 장애물 회고 필요." },
    overconservative: { label: "⚠ 너무 보수적", variant: "warning", advice: "100% 초과 — 다음 분기는 더 도전적으로 (Stretch 50% 가정)." },
  };

  function rateScore(pct: number): typeof ratings[string] {
    if (pct >= 100) return ratings.overconservative;
    if (pct >= 70 && pct < 100) return ratings.excellent;
    if (pct >= 60) return ratings.good;
    if (pct >= 40) return ratings.weak;
    return ratings.failed;
  }

  const overallRating = rateScore(avgScore);

  // 회사/팀/개인별 분류
  const byKind = {
    COMPANY: objectives.filter((o) => o.ownerKind === "COMPANY"),
    TEAM:    objectives.filter((o) => o.ownerKind === "TEAM"),
    USER:    objectives.filter((o) => o.ownerKind === "USER"),
  };

  const topPerformers = [...objectives].sort((a, b) => b.progressPct - a.progressPct).slice(0, 3);
  const bottomPerformers = [...objectives].sort((a, b) => a.progressPct - b.progressPct).slice(0, 3);

  // AUTO vs MANUAL KR 비율 (시각화)
  const allKrs = objectives.flatMap((o) => o.keyResults);
  const autoKrs = allKrs.filter((k) => k.progressSource === "AUTO");

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/okr" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />OKR
        </Link>
        <span>/</span>
        <span className="text-foreground">분기 회고</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <span>2026 Q2 분기 회고 (시뮬)</span>
            <Badge variant="muted" className="text-xs">자동 집계</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <div className="text-xs text-muted-foreground mb-2">전체 OKR 평균 점수</div>
            <div className="text-6xl font-bold tabular-nums">{avgScore}<span className="text-2xl">%</span></div>
            <Badge variant={overallRating.variant} className="mt-3 text-sm px-3 py-1">{overallRating.label}</Badge>
            <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{overallRating.advice}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Tier kind="COMPANY" objectives={byKind.COMPANY} rateFn={rateScore} />
            <Tier kind="TEAM"    objectives={byKind.TEAM}    rateFn={rateScore} />
            <Tier kind="USER"    objectives={byKind.USER}    rateFn={rateScore} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-success" />
              상위 성과 OKR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPerformers.map((o) => (
              <Link key={o.id} href={`/okr/${o.id}`} className="block">
                <div className="flex items-start justify-between gap-2 text-sm border-b last:border-0 py-2 hover:bg-accent/30 -mx-2 px-2 rounded">
                  <div className="min-w-0 flex-1">
                    <Badge variant="muted" className="text-[10px]">{KIND_LABEL[o.ownerKind]}</Badge>
                    <div className="font-medium leading-tight mt-1">{o.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{o.ownerName}</div>
                  </div>
                  <span className="text-xl font-bold text-success tabular-nums shrink-0">{o.progressPct}%</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              회고 필요 OKR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bottomPerformers.map((o) => (
              <Link key={o.id} href={`/okr/${o.id}`} className="block">
                <div className="flex items-start justify-between gap-2 text-sm border-b last:border-0 py-2 hover:bg-accent/30 -mx-2 px-2 rounded">
                  <div className="min-w-0 flex-1">
                    <Badge variant="muted" className="text-[10px]">{KIND_LABEL[o.ownerKind]}</Badge>
                    <div className="font-medium leading-tight mt-1">{o.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{o.ownerName}</div>
                  </div>
                  <span className="text-xl font-bold text-destructive tabular-nums shrink-0">{o.progressPct}%</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            자동 진척 KR 비중
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm">
              <span className="font-medium">{autoKrs.length}</span>
              <span className="text-muted-foreground"> / {allKrs.length} KR이 CRM 데이터로 자동 진척</span>
            </div>
            <span className="text-2xl font-bold tabular-nums">
              {Math.round((autoKrs.length / allKrs.length) * 100)}%
            </span>
          </div>
          <Progress
            value={(autoKrs.length / allKrs.length) * 100}
            indicatorClassName="bg-primary"
          />
          <p className="text-xs text-muted-foreground mt-3">
            💡 AUTO KR이 많을수록 운영 부담 감소. 나머지 KR도 데이터 소스를 정의하면 자동화 가능.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground space-y-2">
          <div className="font-medium text-foreground">📊 분기 회고 운영 가이드</div>
          <ul className="space-y-1 list-disc pl-5">
            <li><strong className="text-foreground">70-80%</strong>가 OKR의 이상적 범위 (Google 가이드). 너무 낮거나 100% 초과는 모두 신호.</li>
            <li>분기 회고는 <strong>실패 분석 + 다음 분기 OKR 초안</strong> 작성으로 끝나야 함.</li>
            <li>실제 운영 시에는 분기말 자동 알림 → CFR(Conversation/Feedback/Recognition) 기록.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/okr">OKR 리스트로</Link>
        </Button>
        <Button asChild>
          <Link href="/okr/new">
            <Target className="h-4 w-4" />다음 분기 OKR 작성
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Tier({
  kind, objectives, rateFn,
}: {
  kind: "COMPANY" | "TEAM" | "USER";
  objectives: ReturnType<typeof getObjectivesWithAutoProgress>;
  rateFn: (pct: number) => { variant: "success" | "warning" | "destructive" | "default"; label: string };
}) {
  const avg = objectives.length > 0
    ? Math.round(objectives.reduce((s, o) => s + o.progressPct, 0) / objectives.length)
    : 0;
  const rating = rateFn(avg);
  const label = kind === "COMPANY" ? "회사" : kind === "TEAM" ? "팀" : "개인";

  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs text-muted-foreground mb-1">{label} ({objectives.length})</div>
      <div className="text-3xl font-bold tabular-nums">{avg}%</div>
      <Badge variant={rating.variant} className="mt-2 text-xs">{rating.label}</Badge>
      <Progress value={avg} className="mt-2 h-1.5" />
    </div>
  );
}
