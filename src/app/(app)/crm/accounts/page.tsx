"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GradeBadge, StatusBadge, SegmentBadge, CountryFlag, RiskDot } from "@/components/crm/AccountBadges";
import { EmptyState } from "@/components/common/StateCards";
import { useToast } from "@/components/common/ToastContext";
import { useFavorites } from "@/lib/store/favorites";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import type { Account } from "@/lib/mock/types";
import { formatCurrency, relativeTime } from "@/lib/utils/format";
import { generateCsv, downloadCsv } from "@/lib/utils/csv";
import { Plus, Search, Filter, Star, Building2, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SortKey =
  | "name" | "country" | "grade" | "status" | "owner"
  | "lastActivityAt" | "revenue3M" | "gp3M" | "pipelineAmount";

interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

const PAGE_SIZE = 12;

export default function AccountsPage() {
  const toast = useToast();
  const favs = useFavorites();
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState<string>("ALL");
  const [country, setCountry] = useState<string>("ALL");
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: "lastActivityAt", dir: "desc" });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return MOCK_ACCOUNTS.filter((a) => {
      if (favOnly && !favs.isFavorite(a.id)) return false;
      if (q && !a.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (grade !== "ALL" && a.grade !== grade) return false;
      if (country !== "ALL" && a.countryCode !== country) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, grade, country, favOnly, favs.count]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const compare = (a: Account, b: Account): number => {
      const get = (x: Account): string | number => {
        switch (sort.key) {
          case "name":            return x.name;
          case "country":         return x.countryCode;
          case "grade":           return x.grade;
          case "status":          return x.status;
          case "owner":           return x.ownerName;
          case "lastActivityAt":  return new Date(x.lastActivityAt).getTime();
          case "revenue3M":       return x.revenue3M;
          case "gp3M":            return x.gp3M;
          case "pipelineAmount":  return x.pipelineAmount;
        }
      };
      const va = get(a);
      const vb = get(b);
      if (typeof va === "number" && typeof vb === "number") {
        return sort.dir === "asc" ? va - vb : vb - va;
      }
      return sort.dir === "asc"
        ? String(va).localeCompare(String(vb), "ko")
        : String(vb).localeCompare(String(va), "ko");
    };
    arr.sort(compare);
    return arr;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const countries = Array.from(new Set(MOCK_ACCOUNTS.map((a) => a.countryCode)));

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
    setPage(0);
  };

  const SortHeader = ({ sortKey, label, align = "left", className = "" }: {
    sortKey: SortKey; label: string; align?: "left" | "right"; className?: string;
  }) => {
    const isActive = sort.key === sortKey;
    return (
      <th className={cn("py-2.5 px-3 font-medium text-muted-foreground select-none", className)}>
        <button
          onClick={() => toggleSort(sortKey)}
          className={cn(
            "flex items-center gap-1 hover:text-foreground transition-colors",
            align === "right" && "justify-end w-full",
            isActive && "text-foreground font-semibold"
          )}
        >
          {label}
          {isActive && (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
        </button>
      </th>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">고객사</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sorted.length}개 / 전체 {MOCK_ACCOUNTS.length}
            {sorted.length > PAGE_SIZE && ` · ${safePage * PAGE_SIZE + 1}-${Math.min((safePage + 1) * PAGE_SIZE, sorted.length)} 표시`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => {
              const csv = generateCsv(sorted, [
                { label: "ID",          get: (a) => a.id },
                { label: "고객사명",     get: (a) => a.name },
                { label: "타입",        get: (a) => a.segment },
                { label: "등급",        get: (a) => a.grade },
                { label: "상태",        get: (a) => a.status },
                { label: "국가",        get: (a) => a.countryName },
                { label: "도시",        get: (a) => a.city },
                { label: "담당",        get: (a) => a.ownerName },
                { label: "최근 활동",    get: (a) => a.lastActivityAt },
                { label: "3M 거래액",   get: (a) => a.revenue3M },
                { label: "3M GP",       get: (a) => a.gp3M },
                { label: "YTD 거래액",   get: (a) => a.totalRevenueYtd },
                { label: "YTD GP",      get: (a) => a.totalGpYtd },
                { label: "파이프라인",   get: (a) => a.pipelineAmount },
                { label: "리스크",       get: (a) => a.riskLevel },
                { label: "성장 가능성",  get: (a) => a.growthPotential },
                { label: "첫 컨택",      get: (a) => a.firstContactDate },
              ]);
              const date = new Date().toISOString().split("T")[0];
              downloadCsv(`accounts-${date}`, csv);
              toast.success("CSV 내보내기", `${sorted.length}개 고객사 다운로드`);
            }}
          >
            <Download className="h-4 w-4" />CSV ({sorted.length})
          </Button>
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
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              className="pl-9 h-9"
            />
          </div>
          <FilterChip label="국가" value={country} onChange={(v) => { setCountry(v); setPage(0); }} options={[
            { value: "ALL", label: "전체" },
            ...countries.map((c) => ({ value: c, label: c })),
          ]} />
          <FilterChip label="등급" value={grade} onChange={(v) => { setGrade(v); setPage(0); }} options={[
            { value: "ALL", label: "전체" },
            { value: "KEY_ACCOUNT", label: "KEY" },
            { value: "GROWTH", label: "GROWTH" },
            { value: "NEW_PROSPECT", label: "NEW" },
            { value: "DORMANT", label: "DORMANT" },
            { value: "LOW_POTENTIAL", label: "LOW" },
          ]} />
          <Button
            variant={favOnly ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFavOnly((v) => !v); setPage(0); }}
            title="즐겨찾기만 보기"
          >
            <Star className={cn("h-4 w-4", favOnly && "fill-current")} />
            즐겨찾기 {favs.count > 0 && `(${favs.count})`}
          </Button>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />필터 추가
          </Button>
        </div>
      </Card>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title={q || grade !== "ALL" || country !== "ALL" ? "조건에 맞는 고객사가 없습니다" : "아직 등록된 고객사가 없습니다"}
          description={q || grade !== "ALL" || country !== "ALL"
            ? "필터를 초기화하거나 다른 검색어를 시도해보세요."
            : "첫 번째 고객사를 등록하고 영업을 시작하세요."}
          action={{ label: "필터 초기화", onClick: () => { setQ(""); setGrade("ALL"); setCountry("ALL"); setPage(0); } }}
        />
      ) : (
      <>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b text-left">
                  <th className="py-2.5 px-3 w-8"></th>
                  <SortHeader sortKey="name"           label="고객사" />
                  <SortHeader sortKey="country"        label="국가/도시" />
                  <th className="py-2.5 px-3 font-medium text-muted-foreground">타입</th>
                  <SortHeader sortKey="grade"          label="등급" />
                  <SortHeader sortKey="status"         label="상태" />
                  <SortHeader sortKey="owner"          label="담당" />
                  <SortHeader sortKey="lastActivityAt" label="접촉" />
                  <th className="py-2.5 px-3 font-medium text-muted-foreground">다음 액션</th>
                  <SortHeader sortKey="revenue3M"      label="3M 거래" align="right" />
                  <SortHeader sortKey="gp3M"           label="3M GP" align="right" />
                  <SortHeader sortKey="pipelineAmount" label="파이프" align="right" />
                  <th className="py-2.5 px-3 font-medium text-muted-foreground w-8">⚠</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-accent/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => favs.toggle(a.id)}
                        aria-label={favs.isFavorite(a.id) ? "즐겨찾기 해제" : "즐겨찾기"}
                        className="cursor-pointer"
                      >
                        <Star
                          className={cn(
                            "h-4 w-4 transition-colors",
                            favs.isFavorite(a.id)
                              ? "text-warning fill-current"
                              : "text-muted-foreground hover:text-warning"
                          )}
                        />
                      </button>
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
                      {a.nextActionTitle ? <span>{a.nextActionTitle}</span> : <span className="text-muted-foreground">—</span>}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {safePage + 1} / {totalPages} 페이지 ({sorted.length}건)
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
              >
                <ChevronLeft className="h-4 w-4" />이전
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={i === safePage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i)}
                  className="w-9"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
              >
                다음<ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </>
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
