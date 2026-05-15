"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useSalesVersion } from "@/lib/store/sales-store";
import { relativeTime } from "@/lib/utils/format";
import { Search, Building2, Briefcase, User, LayoutDashboard, Target, FileText, ListTodo, Calendar, CheckSquare } from "lucide-react";

interface SearchResult {
  kind: "account" | "deal" | "contact" | "activity" | "task" | "page";
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
];

export function CommandK() {
  const router = useRouter();
  const version = useSalesVersion();
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
      ...PAGES,
    ];
    if (!q) return PAGES.slice(0, 6);
    const filtered = all.filter((r) =>
      [r.title, r.subtitle ?? ""].some((s) => s.toLowerCase().includes(q))
    );
    return filtered.slice(0, 15);
  }, [query, version]);

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
    activity: "활동", task: "태스크", page: "페이지",
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
              {results.map((r, idx) => {
                const Icon = r.icon;
                return (
                  <li key={`${r.kind}-${r.id}`}>
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
                      <Badge variant="muted" className="text-xs shrink-0">{KIND_LABEL[r.kind]}</Badge>
                    </button>
                  </li>
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
