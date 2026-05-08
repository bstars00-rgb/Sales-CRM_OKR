"use client";

import { notFound, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/crm/AccountBadges";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const SLIDES = [
  "cover",
  "metrics",
  "trend",
  "topHotels",
  "seasonality",
  "proposal",
] as const;
type SlideKey = typeof SLIDES[number];

// 24개월 매출 mock — sin curve로 시즌성 흉내
function generate24MonthRevenue(baseMonthly: number) {
  const out: { month: string; revenue: number; roomNights: number }[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const seasonal = 1 + 0.4 * Math.sin((d.getMonth() / 12) * Math.PI * 2 + 1);
    const growth = 1 + (24 - i) * 0.012;
    const noise = 0.85 + Math.random() * 0.3;
    const revenue = Math.round(baseMonthly * seasonal * growth * noise);
    out.push({
      month: `${String(d.getFullYear()).slice(2)}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      revenue,
      roomNights: Math.round(revenue / 110000),
    });
  }
  return out;
}

const TOP_HOTELS = [
  { name: "다낭 푸라마 리조트", country: "🇻🇳", revenue: 84_000_000 },
  { name: "호치민 르네상스", country: "🇻🇳", revenue: 62_000_000 },
  { name: "방콕 그랜드 하얏트", country: "🇹🇭", revenue: 48_000_000 },
  { name: "도쿄 임페리얼", country: "🇯🇵", revenue: 42_000_000 },
  { name: "발리 더 무리아", country: "🇮🇩", revenue: 36_000_000 },
];

const SEASON = [
  { quarter: "Q1", revenue: 78 },
  { quarter: "Q2", revenue: 92 },
  { quarter: "Q3", revenue: 124 },
  { quarter: "Q4", revenue: 106 },
];

export function CustomerInsightClient({ id }: { id: string }) {
  const router = useRouter();
  const account = MOCK_ACCOUNTS.find((a) => a.id === id);
  if (!account) notFound();

  const [slide, setSlide] = useState<number>(0);
  const [trendData] = useState(() =>
    generate24MonthRevenue(Math.max(account.totalRevenueYtd / 12, 14_000_000))
  );

  const wonDeals = MOCK_DEALS.filter((d) => d.accountId === account.id && d.outcome === "WON");
  const totalRoomNights = trendData.reduce((s, d) => s + d.roomNights, 0);
  const totalRev24m = trendData.reduce((s, d) => s + d.revenue, 0);
  const adr = totalRoomNights > 0 ? totalRev24m / totalRoomNights : 0;
  const last12mRev = trendData.slice(-12).reduce((s, d) => s + d.revenue, 0);
  const prev12mRev = trendData.slice(0, 12).reduce((s, d) => s + d.revenue, 0);
  const yoy = prev12mRev > 0 ? ((last12mRev - prev12mRev) / prev12mRev) * 100 : 0;

  const next = useCallback(() => setSlide((s) => Math.min(SLIDES.length - 1, s + 1)), []);
  const prev = useCallback(() => setSlide((s) => Math.max(0, s - 1)), []);
  const exit = useCallback(() => router.push(`/crm/accounts/${account.id}`), [router, account.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, exit]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Badge variant="warning" className="text-xs">🤝 Customer Mode</Badge>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            마진·내부 데이터 자동 숨김 · 화살표 키로 이동 · ESC 종료
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4" />PDF (v1.5)
          </Button>
          <Button variant="ghost" size="sm" onClick={exit}>
            <X className="h-4 w-4" />닫기
          </Button>
        </div>
      </div>

      {/* 슬라이드 */}
      <div className="flex-1 overflow-hidden flex items-center justify-center px-8 py-10">
        <div className="w-full max-w-5xl">
          {SLIDES[slide] === "cover" && (
            <div className="text-center space-y-6">
              <div className="text-3xl text-muted-foreground">
                <CountryFlag code={account.countryCode} /> {account.name}
              </div>
              <div className="text-5xl md:text-6xl font-bold tracking-tight">
                × 우리회사
              </div>
              <div className="text-2xl text-muted-foreground mt-8">
                {new Date().getFullYear()}년 함께 만든 임팩트
              </div>
              <div className="text-7xl md:text-8xl font-bold text-primary">
                {formatCurrency(account.totalRevenueYtd)}
              </div>
              {yoy !== 0 && (
                <div className={cn("text-2xl font-medium", yoy >= 0 ? "text-success" : "text-destructive")}>
                  작년 동기 대비 {yoy >= 0 ? "▲" : "▼"} {Math.abs(yoy).toFixed(0)}%
                </div>
              )}
            </div>
          )}

          {SLIDES[slide] === "metrics" && (
            <div className="space-y-10">
              <h2 className="text-3xl font-bold text-center">함께 만든 숫자</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <BigStat label="누적 거래액" value={formatCurrency(totalRev24m)} sub="최근 24개월" />
                <BigStat label="Room Night" value={formatNumber(totalRoomNights)} sub="객실박" />
                <BigStat label="ADR" value={formatCurrency(adr)} sub="평균 객실단가" />
                <BigStat label="WON 계약" value={`${wonDeals.length}건`} />
                <BigStat label="YoY 성장률" value={formatPercent(Math.abs(yoy), 0)}
                          sub={yoy >= 0 ? "▲ 성장" : "▼ 감소"}
                          color={yoy >= 0 ? "text-success" : "text-destructive"} />
                <BigStat label="고객사 등급" value="KEY 파트너" sub="장기 협력" />
              </div>
            </div>
          )}

          {SLIDES[slide] === "trend" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">24개월 거래 추이</h2>
              <div className="bg-card border rounded-lg p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData} margin={{ left: 40, right: 20, top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }}
                           tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                    <Tooltip
                      formatter={(v: number) => formatCurrency(v)}
                      contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))"
                          strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-lg text-muted-foreground">
                {yoy >= 10 ? "성장세가 명확히 보입니다." : yoy >= 0 ? "안정적인 거래 흐름." : "조정 구간 — 다음 분기에 회복 여지."}
              </p>
            </div>
          )}

          {SLIDES[slide] === "topHotels" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">귀사가 가장 많이 판매한 호텔 TOP 5</h2>
              <div className="space-y-3">
                {TOP_HOTELS.map((h, i) => (
                  <div key={h.name} className="flex items-center gap-4 bg-card border rounded-lg p-4">
                    <div className="text-3xl font-bold text-muted-foreground w-12">#{i + 1}</div>
                    <div className="flex-1">
                      <div className="text-xl font-medium">{h.country} {h.name}</div>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">{formatCurrency(h.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {SLIDES[slide] === "seasonality" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">시즌 패턴</h2>
              <div className="bg-card border rounded-lg p-6">
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={SEASON} margin={{ left: 30, right: 20, top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 14 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v: number) => `지수 ${v}`}
                      contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                  <div className="text-sm text-success">성수기</div>
                  <div className="text-xl font-bold mt-1">7-8월 / 12-2월</div>
                </div>
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                  <div className="text-sm text-warning">상승 여지</div>
                  <div className="text-xl font-bold mt-1">4-5월 비수기</div>
                </div>
              </div>
            </div>
          )}

          {SLIDES[slide] === "proposal" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">다음 분기 함께 갈 방향</h2>
              <div className="space-y-4">
                <ProposalCard
                  title="Q3 시즌성 패키지"
                  desc="베트남 중부 호텔 묶음 — 다낭 + 호이안"
                  impact="예상 +$80K"
                />
                <ProposalCard
                  title="신규 추천 호텔 3곳"
                  desc="귀사 고객 프로필과 매칭되는 부띠크 호텔"
                  impact="시범 운영 추천"
                />
                <ProposalCard
                  title="API 자동 가격 업데이트"
                  desc="실시간 단가 동기화로 직원 시간 절약"
                  impact="운영 효율 +30%"
                />
              </div>
              <div className="text-center pt-4">
                <p className="text-lg text-muted-foreground">
                  자세한 사항은 미팅 후 정식 제안서로 정리해드리겠습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 풋터 — 슬라이드 네비 */}
      <div className="border-t bg-card px-6 py-4 flex items-center justify-between">
        <Button variant="outline" size="lg" onClick={prev} disabled={slide === 0}>
          <ChevronLeft className="h-5 w-5" />이전
        </Button>
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === slide ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground"
              )}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
        <Button variant="default" size="lg" onClick={next} disabled={slide === SLIDES.length - 1}>
          다음<ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function BigStat({
  label, value, sub, color,
}: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="text-center bg-card border rounded-lg p-6">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={cn("text-4xl md:text-5xl font-bold mt-2", color)}>{value}</div>
      {sub && <div className="text-sm text-muted-foreground mt-2">{sub}</div>}
    </div>
  );
}

function ProposalCard({ title, desc, impact }: { title: string; desc: string; impact: string }) {
  return (
    <div className="flex items-center gap-4 bg-card border rounded-lg p-5 hover:border-primary/40 transition-colors">
      <div className="flex-1">
        <div className="text-xl font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground mt-1">{desc}</div>
      </div>
      <Badge variant="success" className="text-base px-4 py-1.5">{impact}</Badge>
    </div>
  );
}
