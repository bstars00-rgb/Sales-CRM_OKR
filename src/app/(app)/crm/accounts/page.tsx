"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradeBadge, StatusBadge, SegmentBadge, CountryFlag, RiskDot } from "@/components/crm/AccountBadges";
import { EmptyState } from "@/components/common/StateCards";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { formatCurrency, relativeTime } from "@/lib/utils/format";
import { Plus, Search, Filter, Star, Building2 } from "lucide-react";

export default function AccountsPage() {
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState<string>("ALL");
  const [country, setCountry] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return MOCK_ACCOUNTS.filter((a) => {
      if (q && !a.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (grade !== "ALL" && a.grade !== grade) return false;
      if (country !== "ALL" && a.countryCode !== country) return false;
      return true;
    });
  }, [q, grade, country]);

  const countries = Array.from(new Set(MOCK_ACCOUNTS.map((a) => a.countryCode)));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">고객사</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length}개 / 전체 {MOCK_ACCOUNTS.length}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">CSV 내보내기</Button>
          <Button size="sm" asChild>
            <Link href="/crm/accounts/new"><Plus className="h-4 w-4" />새 고객사</Link>
          </Button>
        </div>
      </div>

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
          <FilterChip label="국가" value={country} onChange={setCountry} options={[
            { value: "ALL", label: "전체" },
            ...countries.map((c) => ({ value: c, label: c })),
          ]} />
          <FilterChip label="등급" value={grade} onChange={setGrade} options={[
            { value: "ALL", label: "전체" },
            { value: "KEY_ACCOUNT", label: "KEY" },
            { value: "GROWTH", label: "GROWTH" },
            { value: "NEW_PROSPECT", label: "NEW" },
            { value: "DORMANT", label: "DORMANT" },
            { value: "LOW_POTENTIAL", label: "LOW" },
          ]} />
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />필터 추가
          </Button>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title={q || grade !== "ALL" || country !== "ALL" ? "조건에 맞는 고객사가 없습니다" : "아직 등록된 고객사가 없습니다"}
          description={q || grade !== "ALL" || country !== "ALL"
            ? "필터를 초기화하거나 다른 검색어를 시도해보세요."
            : "첫 번째 고객사를 등록하고 영업을 시작하세요."}
          action={{ label: "필터 초기화", onClick: () => { setQ(""); setGrade("ALL"); setCountry("ALL"); } }}
        />
      ) : (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b text-left">
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground">고객사</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground">국가/도시</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground">타입</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground">등급</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground">상태</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground">담당</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground">접촉</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground">다음 액션</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground text-right">3M 거래</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground text-right">3M GP</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground text-right">파이프</th>
                <th className="py-2.5 px-3 font-medium text-muted-foreground w-8">⚠</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-accent/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <Star className="h-4 w-4 text-muted-foreground hover:text-warning cursor-pointer" />
                  </td>
                  <td className="py-2.5 px-3">
                    <Link href={`/crm/accounts/${a.id}`} className="font-medium hover:underline">
                      {a.name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-xs">
                    <CountryFlag code={a.countryCode} /> {a.countryName} · {a.city}
                  </td>
                  <td className="py-2.5 px-3"><SegmentBadge segment={a.segment} /></td>
                  <td className="py-2.5 px-3"><GradeBadge grade={a.grade} /></td>
                  <td className="py-2.5 px-3"><StatusBadge status={a.status} /></td>
                  <td className="py-2.5 px-3 text-xs">{a.ownerName}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">
                    {relativeTime(a.lastActivityAt)}
                  </td>
                  <td className="py-2.5 px-3 text-xs">
                    {a.nextActionTitle ? (
                      <span>{a.nextActionTitle}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {a.revenue3M > 0 ? formatCurrency(a.revenue3M) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {a.gp3M > 0 ? formatCurrency(a.gp3M) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {a.pipelineAmount > 0 ? formatCurrency(a.pipelineAmount) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <RiskDot level={a.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
}

function FilterChip({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
