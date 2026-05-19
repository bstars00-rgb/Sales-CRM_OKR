"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Briefcase, Calendar, Target, BarChart3,
  FileText, Settings, ListTodo, TrendingUp, Bell, Shield, RefreshCw, ScrollText, Hotel,
  Save, Upload, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/lib/auth/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "대시보드",
    items: [
      // 내 대시보드: C레벨은 보지 않음 (개인 KPI 영역)
      { href: "/dashboard/manager", label: "내 대시보드", icon: LayoutDashboard, roles: ["MEMBER", "MANAGER", "DIRECTOR"] },
      { href: "/digest",            label: "다이제스트", icon: Bell, roles: ["MEMBER", "MANAGER", "DIRECTOR"] },
      { href: "/dashboard/lead",    label: "팀 대시보드", icon: BarChart3, roles: ["MANAGER", "DIRECTOR"] },
      { href: "/dashboard/ceo",     label: "회사 대시보드", icon: BarChart3, roles: ["DIRECTOR", "EXECUTIVE"] },
    ],
  },
  {
    section: "CRM",
    items: [
      { href: "/crm/accounts",      label: "고객사", icon: Building2 },
      { href: "/crm/deals/kanban",  label: "딜 칸반", icon: Briefcase },
      { href: "/crm/forecast",      label: "Forecast", icon: TrendingUp },
      { href: "/crm/hotel-metrics", label: "호텔 지표", icon: Hotel },
      { href: "/crm/renewals",      label: "갱신 파이프", icon: RefreshCw },
      { href: "/crm/activities",    label: "활동", icon: Calendar, roles: ["MEMBER", "MANAGER", "DIRECTOR"] },
      { href: "/tasks",             label: "태스크", icon: ListTodo, roles: ["MEMBER", "MANAGER", "DIRECTOR"] },
    ],
  },
  {
    section: "목표 · 성과",
    items: [
      { href: "/okr",                label: "OKR", icon: Target },
      { href: "/okr/critical-six",   label: "Critical 6", icon: Target, roles: ["MEMBER", "MANAGER", "DIRECTOR"] },
      { href: "/kpi",                label: "KPI · 인센티브", icon: BarChart3 },
      { href: "/analytics",          label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    section: "보고",
    items: [
      { href: "/brief",              label: "내 주간보고", icon: FileText, roles: ["MEMBER", "MANAGER", "DIRECTOR"] },
      { href: "/brief/team",         label: "팀 주간보고", icon: FileText, roles: ["MANAGER", "DIRECTOR", "EXECUTIVE"] },
      { href: "/brief/company",      label: "회사 주간보고", icon: FileText, roles: ["DIRECTOR", "EXECUTIVE"] },
    ],
  },
  {
    section: "팀",
    items: [
      { href: "/team/one-on-ones",   label: "1on1 노트", icon: MessageSquare, roles: ["MANAGER", "DIRECTOR"] },
    ],
  },
  {
    section: "설정",
    items: [
      { href: "/settings/notifications", label: "알림 룰", icon: Bell, roles: ["MEMBER", "MANAGER", "DIRECTOR"] },
      { href: "/settings/audit",         label: "감사 로그", icon: ScrollText, roles: ["MANAGER", "DIRECTOR", "EXECUTIVE"] },
      { href: "/settings/import",        label: "CSV 가져오기", icon: Upload, roles: ["MANAGER", "DIRECTOR"] },
      { href: "/settings/backup",        label: "백업/복원", icon: Save },
      { href: "/settings/permissions",   label: "권한", icon: Shield },
      { href: "/settings/org",           label: "조직 설정", icon: Settings, roles: ["DIRECTOR"] },
    ],
  },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r bg-card flex flex-col">
      <div className="h-14 flex items-center px-5 border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm">
            S
          </span>
          <span>Sales CRM</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-3" aria-label="주 메뉴">
        {NAV.map((sec) => {
          const visible = sec.items.filter((it) => !it.roles || it.roles.includes(role));
          if (visible.length === 0) return null;
          return (
            <div key={sec.section} className="mb-4">
              <div className="px-5 mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {sec.section}
              </div>
              <ul>
                {visible.map((it) => {
                  const Icon = it.icon;
                  const active = pathname === it.href || pathname.startsWith(it.href + "/");
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={cn(
                          "flex items-center gap-3 px-5 py-2 text-sm hover:bg-accent transition-colors",
                          active && "bg-accent text-foreground font-medium border-l-2 border-primary -ml-px pl-[19px]"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {it.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t text-xs text-muted-foreground">
        v0.1 · Prototype
      </div>
    </aside>
  );
}
