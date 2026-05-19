"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_CONTACTS } from "@/lib/mock/contacts";
import { MOCK_ACTIVITIES, MOCK_TASKS } from "@/lib/mock/activities";
import { MOCK_OBJECTIVES } from "@/lib/mock/kpi";
import { useSalesVersion } from "@/lib/store/sales-store";
import { useRecentItems } from "@/lib/store/recent-items";
import { relativeTime } from "@/lib/utils/format";
import { Search, Building2, Briefcase, User, LayoutDashboard, Target, FileText, ListTodo, Calendar, CheckSquare, BarChart3, Clock } from "lucide-react";

interface SearchResult {
  kind: "account" | "deal" | "contact" | "activity" | "task" | "okr" | "page";
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const PAGES: SearchResult[] = [
  { kind: "page", id: "p1", title: "내 대시보드",   icon: LayoutDashboard, href: "/dashboard/manager" },
  { kind: "page", id: "p2", title: "팀 대시보드",   icon: LayoutDashboard, href: "/dashboard/lead" },
  { kind: "page", id: "p3", title: "회사 대시보드", icon: LayoutDashboard, href: "/dashboard/ceo" },
  { kind: "page", id: "p4", title: "고객사",         icon: Building2,       href: "/crm/accounts" },
  { kind: "page", id: "p5", title: "딜 칸반",        icon: Briefcase,       href: "/crm/deals/kanban" },
  { kind: "page", id: "p6", title: "활동",           icon: FileText,        href: "/crm/activities" },
  { kind: "page", id: "p7", title: "태스크",         icon: ListTodo,        href: "/tasks" },
  { kind: "page", id: "p8", title: "OKR",            icon: Target,          href: "/okr" },
  { kind: "page", id: "p9", title: "Critical 6",     icon: Target,          href: "/okr/critical-six" },
  { kind: "page", id: "p10", title: "KPI · 인센티브", icon: LayoutDashboard, href: "/kpi" },
  { kind: "page", id: "p11", title: "내 주간보고",    icon: FileText,        href: "/brief" },
  { kind: "page", id: "p12", title: "Analytics — Lost Reason",   icon: BarChart3, href: "/analytics/lost-reasons" },
  { kind: "page", id: "p13", title: "Analytics — Sales Funnel",  icon: BarChart3, href: "/analytics/funnel" },
  { kind: "page", id: "p14", title: "Analytics — Win Rate",      icon: BarChart3, href: "/analytics/win-rate" },
  { kind: "page", id: "p15", title: "Analytics — 활동 상관관계", icon: BarChart3, href: "/analytics/activities" },
  { kind: "page", id: "p16", title: "Analytics — OKR 트렌드",    icon: BarChart3, href: "/analytics/okr-trend" },
  { kind: "page", id: "p17", title: "1on1 노트",                 icon: User,      href: "/team/one-on-ones" },
];

export function CommandK() {
  const router = useRouter();
  const version = useSalesVersion();
  const recent = useRecentItems();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    void version;
    const all: SearchResult[] = [
      ...MOCK_ACCOUNTS.map((a): SearchResult => ({
        kind: "account",
        id: a.id,
        title: a.name,
        subtitle: `${a.countryName} · ${a.city} · ${a.segment}`,
        icon: Building2,
        href: `/crm/accounts/${a.id}`,
      })),
      ...MOCK_DEALS.map((d): SearchResult => ({
        kind: "deal",
        id: d.id,
        title: d.name,
        subtitle: `${d.accountName} · ${d.stageName}${d.outcome !== "OPEN" ? ` · ${d.outcome}` : ""}`,
        icon: Briefcase,
        href: `/crm/deals/${d.id}`,
      })),
      ...MOCK_CONTACTS.map((c): SearchResult => ({
        kind: "contact",
        id: c.id,
        title: `${c.firstName} ${c.lastName ?? ""}`.trim(),
        subtitle: `${c.title ?? ""}${c.email ? ` · ${c.email}` : ""}`,
        icon: User,
        href: `/crm/accounts/${c.accountId}`,
      })),
      ...MOCK_ACTIVITIES.slice(0, 30).map((a): SearchResult => ({
        kind: "activity",
        id: a.id,
        title: a.subject ?? a.content?.slice(0, 60) ?? `${a.activityType} 활동`,
        subtitle: `${a.activityType} · ${a.accountName ?? a.dealName ?? ""} · ${relativeTime(a.occurredAt)}`,
        icon: Calendar,
        href: a.dealId ? `/crm/deals/${a.dealId}` : a.accountId ? `/crm/accounts/${a.accountId}` : "/crm/activities",
      })),
      ...MOCK_TASKS.filter((t) => t.status === "TODO").map((t): SearchResult => ({
        kind: "task",
        id: t.id,
        title: t.title,
        subtitle: `${t.priority}${t.dueAt ? ` · ${new Date(t.dueAt).toLocaleDateString("ko-KR")}` : ""}${t.relatedAccountName ? ` · ${t.relatedAccountName}` : ""}`,
        icon: CheckSquare,
        href: "/tasks",
      })),
      ...MOCK_OBJECTIVES.map((o): SearchResult => ({
        kind: "okr",
        id: o.id,
        title: o.title,
        subtitle: `${o.ownerKind === "COMPANY" ? "회사" : o.ownerKind === "TEAM" ? "팀" : "개인"} · ${o.ownerName} · ${o.periodLabel} · ${o.progressPct}%`,
        icon: Target,
        href: `/okr/${o.id}`,
      })),
      ...PAGES,
    ];
    if (!q) {
      // 비어있을 때: 최근 사용 항목 우선 → 없으면 PAGES
      const recentItems = recent.all().slice(0, 8);
      const recentMapped: SearchResult[] = recentItems
        .map((r) => all.find((x) => x.id === r.id))
        .filter((x): x is SearchResult => x !== undefined);
      if (recentMapped.length > 0) {
        // 최근 + 인기 페이지 일부
        const seen = new Set(recentMapped.map((r) => r.id));
        const pages = PAGES.filter((p) => !seen.has(p.id)).slice(0, 4);
        return [...recentMapped, ...pages];
      }
      return PAGES.slice(0, 6);
    }
    // 쿼리 있음: 매칭 + ranking (제목 시작 > 제목 포함 > 부제 포함, 최근 사용 가중)
    const scored = all
      .map((r) => {
        const title = r.title.toLowerCase();
        const subtitle = (r.subtitle ?? "").toLowerCase();
        let score = 0;
        if (title.startsWith(q)) score += 100;
        else if (title.includes(q)) score += 60;
        else if (subtitle.includes(q)) score += 20;
        else return null;
        // 짧을수록 (전체 일치에 가까울수록) 가산점
        score += Math.max(0, 30 - title.length / 2);
        // 최근 사용 가중치
        score += recent.weight(r.id);
        return { r, score };
      })
      .filter((x): x is { r: SearchResult; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((x) => x.r);
    return scored;
  }, [query, version, recent]);

  const isEmptyQuery = query.trim() === "";
  const recentIds = useMemo(() => new Set(recent.all().slice(0, 8).map((r) => r.id)), [recent]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const select = (r: SearchResult) => {
    recent.record({ id: r.id, title: r.title, href: r.href, kind: r.kind });
    setOpen(false);
    setQuery("");
    router.push(r.href);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIndex];
      if (r) select(r);
    }
  };

  const KIND_LABEL: Record<SearchResult["kind"], string> = {
    account: "고객사", deal: "딜", contact: "담당자",
    activity: "활동", task: "태스크", okr: "OKR", page: "페이지",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-xl gap-0 top-[20%]">
        <div className="border-b px-4 py-3 flex items-center gap-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="고객사·딜·담당자·페이지 검색..."
            className="border-0 focus-visible:ring-0 h-9 px-0"
            autoFocus
          />
          <kbd className="text-xs text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {query ? `"${query}"에 대한 결과 없음` : "검색어를 입력하세요"}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {isEmptyQuery && recentIds.size > 0 && (
                <li className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 pt-1 pb-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />최근 사용
                </li>
              )}
              {results.map((r, idx) => {
                const Icon = r.icon;
                const isRecent = isEmptyQuery && recentIds.has(r.id);
                const isFirstNonRecent = isEmptyQuery && idx > 0 && recentIds.has(results[idx - 1].id) && !recentIds.has(r.id);
                return (
                  <Fragment key={`${r.kind}-${r.id}`}>
                    {isFirstNonRecent && (
                      <li className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 pt-2 pb-0.5">
                        페이지
                      </li>
                    )}
                    <li>
                    <button
                      onClick={() => select(r)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full text-left flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        idx === activeIndex ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{r.title}</div>
                        {r.subtitle && (
                          <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>
                        )}
                      </div>
                      {isRecent && <Clock className="h-3 w-3 text-muted-foreground shrink-0" />}
                      <Badge variant="muted" className="text-xs shrink-0">{KIND_LABEL[r.kind]}</Badge>
                    </button>
                  </li>
                  </Fragment>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between">
          <span>↑↓ 이동 · Enter 선택</span>
          <span>Cmd/Ctrl+K로 다시 열기</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
