"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_TASKS } from "@/lib/mock/activities";
import { relativeTime } from "@/lib/utils/format";

interface Notification {
  id: string;
  kind: "DORMANT" | "STALE_DEAL" | "OVERDUE_TASK" | "NO_CONTACT_KEY";
  severity: "HIGH" | "MED" | "LOW";
  title: string;
  detail?: string;
  href: string;
  ageMs: number;
}

function ageMs(date: string | Date): number {
  return Date.now() - new Date(date).getTime();
}

function detectNotifications(): Notification[] {
  const out: Notification[] = [];
  const now = Date.now();

  // 1) DORMANT 진입한 KEY/GROWTH 고객사 (90일+ 미접촉)
  for (const a of MOCK_ACCOUNTS) {
    if (a.grade !== "KEY_ACCOUNT" && a.grade !== "GROWTH") continue;
    const days = Math.floor(ageMs(a.lastActivityAt) / 86400000);
    if (days >= 60) {
      out.push({
        id: `dorm-${a.id}`,
        kind: "DORMANT",
        severity: days >= 90 ? "HIGH" : "MED",
        title: `${a.name} ${days}일 미접촉`,
        detail: `${a.grade === "KEY_ACCOUNT" ? "KEY" : "GROWTH"} · ${a.countryName}`,
        href: `/crm/accounts/${a.id}`,
        ageMs: ageMs(a.lastActivityAt),
      });
    }
  }

  // 2) 정체된 OPEN 딜 (단계 체류 14일+)
  for (const d of MOCK_DEALS) {
    if (d.outcome !== "OPEN") continue;
    if (d.daysInStage >= 14) {
      out.push({
        id: `stale-${d.id}`,
        kind: "STALE_DEAL",
        severity: d.daysInStage >= 21 ? "HIGH" : "MED",
        title: `${d.name} ${d.daysInStage}일 정체`,
        detail: `${d.accountName} · ${d.stageName}`,
        href: `/crm/deals/${d.id}`,
        ageMs: d.daysInStage * 86400000,
      });
    }
  }

  // 3) 지연된 태스크
  for (const t of MOCK_TASKS) {
    if (t.status !== "TODO" || !t.dueAt) continue;
    const due = new Date(t.dueAt).getTime();
    if (due < now) {
      const daysLate = Math.floor((now - due) / 86400000);
      out.push({
        id: `task-${t.id}`,
        kind: "OVERDUE_TASK",
        severity: t.priority === "HIGH" ? "HIGH" : "MED",
        title: `🔴 ${t.title}`,
        detail: `${daysLate}일 지연 · ${t.relatedAccountName ?? ""}`,
        href: "/tasks",
        ageMs: now - due,
      });
    }
  }

  out.sort((a, b) => {
    const sevOrder = { HIGH: 0, MED: 1, LOW: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity] || b.ageMs - a.ageMs;
  });

  return out;
}

export function NotificationBell() {
  const notifications = useMemo(() => detectNotifications(), []);
  const unread = notifications.length;
  const high = notifications.filter((n) => n.severity === "HIGH").length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors" aria-label="알림">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className={`absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
            high > 0 ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"
          }`}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto p-0">
        <DropdownMenuLabel className="px-3 py-2.5 flex items-center justify-between">
          <span>알림 ({unread})</span>
          {high > 0 && <Badge variant="destructive" className="text-xs">긴급 {high}</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            알림이 없습니다 — 잘하고 있습니다 👍
          </div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li key={n.id} className="border-b last:border-0">
                <Link
                  href={n.href}
                  className="block px-3 py-2.5 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <Badge
                      variant={n.severity === "HIGH" ? "destructive" : "warning"}
                      className="text-[10px] shrink-0 mt-0.5"
                    >
                      {n.kind === "DORMANT" ? "미접촉" :
                       n.kind === "STALE_DEAL" ? "정체" :
                       n.kind === "OVERDUE_TASK" ? "지연" : "알림"}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight truncate">{n.title}</div>
                      {n.detail && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{n.detail}</div>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
