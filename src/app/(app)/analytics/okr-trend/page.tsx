"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getObjectivesWithAutoProgress } from "@/lib/okr/auto-progress";
import { LineChart, ArrowLeft, Sparkles } from "lucide-react";
import { PrintButton } from "@/components/common/PrintButton";
import { cn } from "@/lib/utils/cn";

// 분기 라벨 + Mock 진척률 — 현실에서는 OKR 분기별 스냅샷이 저장돼야 하지만,
// 시연 단계에서는 현재 진척률에서 회귀 보정(과거는 낮춘 값)을 이용해 트렌드 추정.
const QUARTERS = ["2025-Q3", "2025-Q4", "2026-Q1", "2026-Q2"] as const;

function pastEstimate(currentPct: number, quartersAgo: number): number {
  // 분기마다 -12 ~ -25점 감소, 0 이상으로 클램프
  const decay = quartersAgo * (15 + (currentPct % 8));
  return Math.max(5, Math.min(100, currentPct - decay));
}

export default function OkrTrendPage() {
  const objectives = useMemo(getObjectivesWithAutoProgress, []);

  // 분기별 평균 진척률
  const quarterlyAvg = useMemo(() => {
    return QUARTERS.map((q, i) => {
      const quartersAgo = QUARTERS.length - 1 - i;
      const values = objectives.map((o) => pastEstimate(o.progressPct, quartersAgo));
      const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
      return { quarter: q, avg, values };
    });
  }, [objectives]);

  const latest = quarterlyAvg[quarterlyAvg.length - 1];
  const previous = quarterlyAvg[quarterlyAvg.length - 2];
  const trend = latest.avg - (previous?.avg ?? 0);

  // OwnerKind 분포
  const byKind = useMemo(() => {
    const company = objectives.filter((o) => o.ownerKind === "COMPANY");
    const team = objectives.filter((o) => o.ownerKind === "TEAM");
    const user = objectives.filter((o) => o.ownerKind === "USER");
    const avg = (arr: typeof objectives) =>
      arr.length > 0 ? arr.reduce((s, o) => s + o.progressPct, 0) / arr.length : 0;
    return [
      { kind: "COMPANY", label: "회사", count: company.length, avg: avg(company), color: "bg-primary" },
      { kind: "TEAM",    label: "팀",   count: team.length,    avg: avg(team),    color: "bg-warning" },
      { kind: "USER",    label: "개인", count: user.length,    avg: avg(user),    color: "bg-success" },
    ];
  }, [objectives]);

  // KR 진척률 분포 (Google OKR 가이드 기준)
  const krBuckets = useMemo(() => {
    const all = objectives.flatMap((o) => o.keyResults);
    const buckets = [
      { range: "0-39 (🔴 실패)",    min: 0,   max: 40,  count: 0, color: "bg-destructive/70" },
      { range: "40-59 (🟡 부진)",   min: 40,  max: 60,  count: 0, color: "bg-warning/70" },
      { range: "60-69 (🟢 양호)",   min: 60,  max: 70,  count: 0, color: "bg-success/40" },
      { range: "70-100 (🏆 우수)",   min: 70,  max: 101, count: 0, color: "bg-success/70" },
      { range: ">100 (⚠ 보수적)",   min: 101, max: 999, count: 0, color: "bg-primary/40" },
    ];
    for (const kr of all) {
      const b = buckets.find((bb) => kr.progressPct >= bb.min && kr.progressPct < bb.max);
      if (b) b.count++;
    }
    return buckets;
  }, [objectives]);

  const totalKrs = objectives.flatMap((o) => o.keyResults).length;
  const autoKrs = objectives.flatMap((o) => o.keyResults).filter((k) => k.progressSource === "AUTO").length;

  const maxQuarterAvg = Math.max(...quarterlyAvg.map((q) => q.avg), 100);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/analytics"><ArrowLeft className="h-4 w-4" />분석 인덱스</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            OKR 분기 트렌드
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {objectives.length} Objective · {totalKrs} KR · {autoKrs}개 자동 진척 (CRM 데이터 연동)
          </p>
        </div>
        <PrintButton />
      </div>

      {/* 트렌드 인사이트 */}
      <Card className={cn(
        "border",
        trend >= 0 ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5",
      )}>
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className={cn("h-5 w-5 shrink-0 mt-0.5", trend >= 0 ? "text-success" : "text-destructive")} />
          <div className="text-sm space-y-1">
            <div className="font-semibold">📊 분기 회고 인사이트</div>
            <div>· 이번 분기 평균 진척률: <b className="tabular-nums">{latest.avg.toFixed(1)}%</b></div>
            {previous && (
              <div>
                · 전분기 대비: {trend >= 0 ? "📈" : "📉"} <b className={cn("tabular-nums", trend >= 0 ? "text-success" : "text-destructive")}>
                  {trend >= 0 ? "+" : ""}{trend.toFixed(1)}점
                </b> ({previous.quarter} → {latest.quarter})
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              💡 Google OKR 가이드: 평균 70-80%가 이상적. 그 이상이면 너무 보수적, 그 이하면 적극적이지만 미달 위험.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 분기별 평균 진척률 (라인) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">분기별 평균 진척률</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quarterlyAvg.map((q) => {
              const pct = (q.avg / maxQuarterAvg) * 100;
              const isLatest = q.quarter === latest.quarter;
              return (
                <div key={q.quarter}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{q.quarter}</span>
                      {isLatest && <Badge variant="default" className="text-[10px]">현재</Badge>}
                    </div>
                    <span className="text-sm tabular-nums font-semibold">{q.avg.toFixed(1)}%</span>
                  </div>
                  <div className="h-6 bg-muted/30 rounded">
                    <div
                      className={cn("h-full rounded transition-all flex items-center justify-end pr-2 text-[10px] font-medium text-foreground/80",
                        isLatest ? "bg-primary/70" : "bg-primary/40",
                      )}
                      style={{ width: `${pct}%`, minWidth: "30px" }}
                    >
                      {q.values.length > 0 && `${q.values.length}개 obj`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 분기 스냅샷은 현재 mock 추정값입니다. ELLIS 연동 시 매 분기말 자동 저장됩니다.
          </p>
        </CardContent>
      </Card>

      {/* OwnerKind 분포 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">OwnerKind별 평균 진척률</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {byKind.map((k) => (
              <div key={k.kind} className="rounded-md border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{k.label}</span>
                  <Badge variant="muted" className="text-[10px]">{k.count}개</Badge>
                </div>
                <div className="text-2xl font-bold tabular-nums">{k.avg.toFixed(1)}%</div>
                <div className="h-2 bg-muted/30 rounded mt-2">
                  <div className={cn("h-full rounded", k.color)} style={{ width: `${Math.min(k.avg, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KR 진척률 분포 (Google OKR 가이드) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">KR 진척률 분포 (Google OKR 가이드 기준)</CardTitle>
          <p className="text-xs text-muted-foreground">총 {totalKrs}개 KR · 70-80%대가 가장 이상적</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {krBuckets.map((b) => {
              const pct = totalKrs > 0 ? (b.count / totalKrs) * 100 : 0;
              return (
                <div key={b.range}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm">{b.range}</span>
                    <span className="text-sm tabular-nums">{b.count}개 ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-3 bg-muted/30 rounded">
                    <div className={cn("h-full rounded", b.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Objective별 상세 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Objective별 현재 진척률</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left border-b">
                  <th className="py-2 px-3 font-medium text-muted-foreground">Objective</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">Owner</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">KR</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">진척</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">시각화</th>
                </tr>
              </thead>
              <tbody>
                {objectives.sort((a, b) => b.progressPct - a.progressPct).map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-accent/20">
                    <td className="py-2 px-3">
                      <Link href={`/okr/${o.id}`} className="font-medium hover:underline">
                        {o.title}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-xs text-muted-foreground">
                      {o.ownerKind === "COMPANY" ? "회사" : o.ownerKind === "TEAM" ? "팀" : "개인"} · {o.ownerName}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{o.keyResults.length}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold">
                      <span className={cn(
                        o.progressPct >= 90 ? "text-success" :
                        o.progressPct >= 60 ? "text-warning" :
                        "text-destructive",
                      )}>
                        {o.progressPct}%
                      </span>
                    </td>
                    <td className="py-2 px-3 w-40">
                      <div className="h-2 bg-muted/30 rounded">
                        <div
                          className={cn(
                            "h-full rounded",
                            o.progressPct >= 90 ? "bg-success" :
                            o.progressPct >= 60 ? "bg-warning" :
                            "bg-destructive",
                          )}
                          style={{ width: `${Math.min(o.progressPct, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
