"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { useSalesVersion } from "@/lib/store/sales-store";
import { LOST_REASONS, CATEGORY_META, getLostReason } from "@/lib/analytics/reason-codes";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { PrintButton } from "@/components/common/PrintButton";
import { TrendingDown, ArrowLeft, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function LostReasonsPage() {
  const version = useSalesVersion();
  void version;

  const lostDeals = MOCK_DEALS.filter((d) => d.outcome === "LOST");

  // 사유별 집계
  const byReason = useMemo(() => {
    const map = new Map<string, { count: number; amount: number; deals: typeof lostDeals }>();
    for (const d of lostDeals) {
      const key = d.lostReasonCode ?? "UNCATEGORIZED";
      const cur = map.get(key) ?? { count: 0, amount: 0, deals: [] };
      cur.count++;
      cur.amount += d.amount;
      cur.deals.push(d);
      map.set(key, cur);
    }
    return Array.from(map.entries())
      .map(([code, v]) => ({ code, ...v, meta: getLostReason(code) }))
      .sort((a, b) => b.amount - a.amount);
  }, [lostDeals]);

  // 카테고리별 집계
  const byCategory = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>();
    for (const r of byReason) {
      const cat = r.meta?.category ?? "INTERNAL";
      const cur = map.get(cat) ?? { count: 0, amount: 0 };
      cur.count += r.count;
      cur.amount += r.amount;
      map.set(cat, cur);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].amount - a[1].amount);
  }, [byReason]);

  // Segment별 패턴
  const bySegment = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>();
    for (const d of lostDeals) {
      const key = d.dealType;
      const cur = map.get(key) ?? { count: 0, amount: 0 };
      cur.count++;
      cur.amount += d.amount;
      map.set(key, cur);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].amount - a[1].amount);
  }, [lostDeals]);

  // 국가별
  const byCountry = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of lostDeals) {
      map.set(d.countryCode, (map.get(d.countryCode) ?? 0) + d.amount);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [lostDeals]);

  const totalAmount = lostDeals.reduce((s, d) => s + d.amount, 0);
  const maxAmount = Math.max(...byReason.map((r) => r.amount), 1);

  // 사용 카탈로그 = LOST_REASONS 미사용 경고 회피
  void LOST_REASONS;

  // 인사이트 생성
  const topReason = byReason[0];
  const topCategory = byCategory[0];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/analytics"><ArrowLeft className="h-4 w-4" />분석 인덱스</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-destructive" />
            Lost Reason 분석
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            LOST {lostDeals.length}건 · 총 {formatCurrency(totalAmount)} 손실 가치
          </p>
        </div>
        <PrintButton />
      </div>

      {/* 인사이트 */}
      {topReason && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <div className="font-semibold">📊 핵심 인사이트</div>
              <div>
                · 가장 큰 손실 사유: <b>{topReason.meta?.label ?? topReason.code}</b> ({topReason.count}건 · {formatCurrency(topReason.amount)})
              </div>
              {topCategory && (
                <div>
                  · 카테고리 1위: <b>{CATEGORY_META[topCategory[0] as keyof typeof CATEGORY_META]?.label ?? topCategory[0]}</b> ({formatPercent((topCategory[1].amount / totalAmount) * 100, 1)})
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                💡 분기 회고 시 위 카테고리에 대한 대응 전략을 OKR Key Result로 설정하세요.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 사유별 분포 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">사유별 분포</CardTitle>
        </CardHeader>
        <CardContent>
          {byReason.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">LOST 딜이 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {byReason.map((r) => {
                const cat = r.meta?.category ?? "INTERNAL";
                const catMeta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
                return (
                  <div key={r.code}>
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{r.meta?.label ?? r.code}</span>
                        {catMeta && <Badge variant={catMeta.tone} className="text-[10px]">{catMeta.label}</Badge>}
                      </div>
                      <div className="text-xs tabular-nums">
                        <span className="font-semibold">{r.count}건</span>
                        <span className="text-muted-foreground"> · {formatCurrency(r.amount)}</span>
                      </div>
                    </div>
                    <div className="h-5 bg-muted/40 rounded">
                      <div
                        className="h-full bg-destructive/70 rounded"
                        style={{ width: `${(r.amount / maxAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 카테고리별 + Segment + 국가 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">카테고리별</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byCategory.map(([cat, v]) => {
              const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
              return (
                <div key={cat} className="flex items-center justify-between">
                  <Badge variant={meta?.tone ?? "muted"}>{meta?.label ?? cat}</Badge>
                  <div className="text-sm tabular-nums">
                    {v.count}건
                    <span className="text-xs text-muted-foreground ml-1">
                      ({formatPercent((v.amount / totalAmount) * 100, 0)})
                    </span>
                  </div>
                </div>
              );
            })}
            {byCategory.length === 0 && <div className="text-xs text-muted-foreground">데이터 없음</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">딜 타입별</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bySegment.map(([seg, v]) => (
              <div key={seg} className="flex items-center justify-between">
                <span className="text-sm">{seg.replace("_", " ")}</span>
                <div className="text-sm tabular-nums">
                  {v.count}건 · {formatCurrency(v.amount)}
                </div>
              </div>
            ))}
            {bySegment.length === 0 && <div className="text-xs text-muted-foreground">데이터 없음</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">국가별</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byCountry.map(([cc, amt]) => (
              <div key={cc} className="flex items-center justify-between">
                <span className="text-sm">{cc}</span>
                <span className="text-sm tabular-nums">{formatCurrency(amt)}</span>
              </div>
            ))}
            {byCountry.length === 0 && <div className="text-xs text-muted-foreground">데이터 없음</div>}
          </CardContent>
        </Card>
      </div>

      {/* 상세 리스트 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">LOST 딜 상세</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {lostDeals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">없음</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left border-b">
                    <th className="py-2 px-3 font-medium text-muted-foreground">딜</th>
                    <th className="py-2 px-3 font-medium text-muted-foreground">고객사</th>
                    <th className="py-2 px-3 font-medium text-muted-foreground">담당</th>
                    <th className="py-2 px-3 font-medium text-muted-foreground">사유</th>
                    <th className="py-2 px-3 font-medium text-muted-foreground text-right">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {lostDeals.map((d) => {
                    const reason = getLostReason(d.lostReasonCode);
                    const catMeta = reason ? CATEGORY_META[reason.category] : null;
                    return (
                      <tr key={d.id} className={cn("border-b last:border-0 hover:bg-accent/30")}>
                        <td className="py-2 px-3">
                          <Link href={`/crm/deals/${d.id}`} className="font-medium hover:underline">
                            {d.name}
                          </Link>
                        </td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">{d.accountName}</td>
                        <td className="py-2 px-3 text-xs">{d.ownerName}</td>
                        <td className="py-2 px-3">
                          {reason ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">{reason.label}</span>
                              {catMeta && <Badge variant={catMeta.tone} className="text-[9px]">{catMeta.label}</Badge>}
                            </div>
                          ) : (
                            <Badge variant="muted" className="text-[10px]">미분류</Badge>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(d.amount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
