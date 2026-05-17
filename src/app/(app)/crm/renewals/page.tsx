"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/ToastContext";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_CONTRACTS, getDaysUntilExpiry, getRenewalUrgency, URGENCY_BADGE, type RenewalUrgency } from "@/lib/mock/contracts";
import { generateCsv, downloadCsv } from "@/lib/utils/csv";
import { formatCurrency } from "@/lib/utils/format";
import { CountryFlag, GradeBadge } from "@/components/crm/AccountBadges";
import { RefreshCw, Search, Download, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const URGENCY_ORDER: RenewalUrgency[] = ["CRITICAL", "HIGH", "MID", "LOW"];

export default function RenewalsPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"ALL" | RenewalUrgency>("ALL");
  const [autoRenewFilter, setAutoRenewFilter] = useState<"ALL" | "YES" | "NO">("ALL");

  const today = new Date();

  const enriched = useMemo(() => {
    return MOCK_CONTRACTS.map((c) => {
      const account = MOCK_ACCOUNTS.find((a) => a.id === c.accountId);
      const daysLeft = getDaysUntilExpiry(c.contractEndDate, today);
      const urgency = getRenewalUrgency(daysLeft);
      return { contract: c, account, daysLeft, urgency };
    }).filter((x) => x.account); // 매핑 누락 제외
  }, [today]);

  const filtered = useMemo(() => {
    return enriched
      .filter((x) => {
        if (urgencyFilter !== "ALL" && x.urgency !== urgencyFilter) return false;
        if (autoRenewFilter === "YES" && !x.contract.autoRenew) return false;
        if (autoRenewFilter === "NO" && x.contract.autoRenew) return false;
        if (q && !x.account!.name.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [enriched, urgencyFilter, autoRenewFilter, q]);

  // 요약 통계
  const summary = useMemo(() => {
    const groups: Record<RenewalUrgency, { count: number; value: number }> = {
      CRITICAL: { count: 0, value: 0 },
      HIGH:     { count: 0, value: 0 },
      MID:      { count: 0, value: 0 },
      LOW:      { count: 0, value: 0 },
    };
    enriched.forEach((x) => {
      groups[x.urgency].count++;
      groups[x.urgency].value += x.contract.annualValue;
    });
    return groups;
  }, [enriched]);

  const totalAtRisk = summary.CRITICAL.value + summary.HIGH.value;

  const exportCsv = () => {
    const csv = generateCsv(filtered, [
      { label: "고객사",          get: (x) => x.account!.name },
      { label: "국가",            get: (x) => x.account!.countryName },
      { label: "등급",            get: (x) => x.account!.grade },
      { label: "계약 시작일",      get: (x) => x.contract.contractStartDate },
      { label: "계약 만료일",      get: (x) => x.contract.contractEndDate },
      { label: "남은 일수",        get: (x) => x.daysLeft },
      { label: "긴급도",          get: (x) => x.urgency },
      { label: "자동 갱신",        get: (x) => x.contract.autoRenew ? "YES" : "NO" },
      { label: "연간 가치(KRW)",   get: (x) => x.contract.annualValue },
      { label: "담당",            get: (x) => x.account!.ownerName },
      { label: "비고",            get: (x) => x.contract.notes ?? "" },
    ]);
    const date = new Date().toISOString().split("T")[0];
    downloadCsv(`renewals-${date}`, csv);
    toast.success("CSV 내보내기", `${filtered.length}건 다운로드`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-primary" />
            계약 갱신 파이프라인
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            전체 {enriched.length}건 · 위험 노출 (≤60일) {formatCurrency(totalAtRisk)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" />CSV ({filtered.length})
        </Button>
      </div>

      {/* 4가지 긴급도 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {URGENCY_ORDER.map((u) => {
          const meta = URGENCY_BADGE[u];
          const data = summary[u];
          return (
            <Card
              key={u}
              className={cn(
                "cursor-pointer hover:shadow-md transition-all",
                urgencyFilter === u && "ring-2 ring-primary",
              )}
              onClick={() => setUrgencyFilter((cur) => (cur === u ? "ALL" : u))}
            >
              <CardContent className="p-4">
                <div className="text-2xl mb-1">{meta.emoji}</div>
                <div className="text-xs text-muted-foreground">{meta.label}</div>
                <div className="text-2xl font-bold tabular-nums mt-1">{data.count}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {formatCurrency(data.value)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 검색 / 필터 */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="고객사명 검색..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">자동 갱신</span>
            <select
              value={autoRenewFilter}
              onChange={(e) => setAutoRenewFilter(e.target.value as typeof autoRenewFilter)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">전체</option>
              <option value="YES">예</option>
              <option value="NO">아니오 (액션 필요)</option>
            </select>
          </div>
          {(urgencyFilter !== "ALL" || autoRenewFilter !== "ALL" || q) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setUrgencyFilter("ALL"); setAutoRenewFilter("ALL"); setQ(""); }}
            >
              필터 초기화
            </Button>
          )}
        </div>
      </Card>

      {/* 리스트 */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">조건에 맞는 계약이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left border-b">
                    <th className="py-2.5 px-3 font-medium text-muted-foreground w-8"></th>
                    <th className="py-2.5 px-3 font-medium text-muted-foreground">고객사</th>
                    <th className="py-2.5 px-3 font-medium text-muted-foreground">국가</th>
                    <th className="py-2.5 px-3 font-medium text-muted-foreground">등급</th>
                    <th className="py-2.5 px-3 font-medium text-muted-foreground">만료일</th>
                    <th className="py-2.5 px-3 font-medium text-muted-foreground text-right">남은</th>
                    <th className="py-2.5 px-3 font-medium text-muted-foreground">자동</th>
                    <th className="py-2.5 px-3 font-medium text-muted-foreground text-right">연간 가치</th>
                    <th className="py-2.5 px-3 font-medium text-muted-foreground">담당</th>
                    <th className="py-2.5 px-3 font-medium text-muted-foreground">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((x) => {
                    const meta = URGENCY_BADGE[x.urgency];
                    return (
                      <tr key={x.contract.accountId} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                        <td className="py-2.5 px-3 text-lg">{meta.emoji}</td>
                        <td className="py-2.5 px-3">
                          <Link
                            href={`/crm/accounts/${x.account!.id}`}
                            className="font-medium hover:underline flex items-center gap-1.5"
                          >
                            {x.account!.name}
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </Link>
                        </td>
                        <td className="py-2.5 px-3 text-xs">
                          <CountryFlag code={x.account!.countryCode} /> {x.account!.countryName}
                        </td>
                        <td className="py-2.5 px-3"><GradeBadge grade={x.account!.grade} /></td>
                        <td className="py-2.5 px-3 text-xs tabular-nums">{x.contract.contractEndDate}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <Badge variant={meta.tone}>{x.daysLeft}일</Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          {x.contract.autoRenew ? (
                            <span className="text-success flex items-center gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3" />자동
                            </span>
                          ) : (
                            <span className="text-warning flex items-center gap-1 text-xs">
                              <AlertTriangle className="h-3 w-3" />수동
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {formatCurrency(x.contract.annualValue)}
                        </td>
                        <td className="py-2.5 px-3 text-xs">{x.account!.ownerName}</td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-[200px] truncate" title={x.contract.notes}>
                          {x.contract.notes ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 추천 액션 */}
      {summary.CRITICAL.count > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              추천 액션
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div>🔴 <b>긴급 ({summary.CRITICAL.count}건)</b> — {formatCurrency(summary.CRITICAL.value)} 규모. 7일 내 갱신 미팅 잡기.</div>
              {summary.HIGH.count > 0 && (
                <div>🟠 <b>임박 ({summary.HIGH.count}건)</b> — {formatCurrency(summary.HIGH.value)} 규모. 30일 내 견적 발송.</div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                💡 자동 갱신 NO + 긴급도 HIGH 이상인 계약을 우선 처리하세요.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
