"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, ExternalLink, AlertTriangle, ArrowRight, Check, CheckCheck } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_TASKS } from "@/lib/mock/activities";
import { MOCK_CONTRACTS, getDaysUntilExpiry, getRenewalUrgency } from "@/lib/mock/contracts";
import { useSalesVersion } from "@/lib/store/sales-store";
import { useNotificationRules } from "@/lib/store/notification-rules";
import { formatCurrency, relativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const READ_STORAGE_KEY = "sales-crm-notif-read";

type NotifKind = "DORMANT" | "STALE_DEAL" | "OVERDUE_TASK" | "NO_CONTACT_KEY" | "RENEWAL_DUE";

interface Notification {
  id: string;
  kind: NotifKind;
  severity: "HIGH" | "MED" | "LOW";
  title: string;
  detail?: string;
  href: string;
  ageMs: number;
  refType: "account" | "deal" | "task";
  refId: string;
}

function ageMs(date: string | Date): number {
  return Date.now() - new Date(date).getTime();
}

interface DetectOpts {
  dormantDays: number;
  staleDealDays: number;
  renewalWarnDays: number;
  enableDormant: boolean;
  enableStaleDeal: boolean;
  enableOverdueTask: boolean;
  enableRenewal: boolean;
}

function detectNotifications(opts: DetectOpts): Notification[] {
  const out: Notification[] = [];
  const now = Date.now();

  // 1) DORMANT 진입한 KEY/GROWTH 고객사 (룰: dormantDays)
  if (opts.enableDormant) for (const a of MOCK_ACCOUNTS) {
    if (a.grade !== "KEY_ACCOUNT" && a.grade !== "GROWTH") continue;
    const days = Math.floor(ageMs(a.lastActivityAt) / 86400000);
    if (days >= opts.dormantDays) {
      out.push({
        id: `dorm-${a.id}`, kind: "DORMANT",
        severity: days >= 90 ? "HIGH" : "MED",
        title: `${a.name} ${days}일 미접촉`,
        detail: `${a.grade === "KEY_ACCOUNT" ? "KEY" : "GROWTH"} · ${a.countryName}`,
        href: `/crm/accounts/${a.id}`,
        ageMs: ageMs(a.lastActivityAt),
        refType: "account", refId: a.id,
      });
    }
  }

  // 2) 정체된 OPEN 딜 (룰: staleDealDays)
  if (opts.enableStaleDeal) for (const d of MOCK_DEALS) {
    if (d.outcome !== "OPEN") continue;
    if (d.daysInStage >= opts.staleDealDays) {
      out.push({
        id: `stale-${d.id}`, kind: "STALE_DEAL",
        severity: d.daysInStage >= 21 ? "HIGH" : "MED",
        title: `${d.name} ${d.daysInStage}일 정체`,
        detail: `${d.accountName} · ${d.stageName}`,
        href: `/crm/deals/${d.id}`,
        ageMs: d.daysInStage * 86400000,
        refType: "deal", refId: d.id,
      });
    }
  }

  // 3) 갱신 임박 계약 (룰: renewalWarnDays, 자동 갱신 아닌 경우만)
  if (opts.enableRenewal) for (const c of MOCK_CONTRACTS) {
    if (c.autoRenew) continue;
    const daysLeft = getDaysUntilExpiry(c.contractEndDate);
    if (daysLeft > opts.renewalWarnDays || daysLeft < 0) continue;
    const account = MOCK_ACCOUNTS.find((a) => a.id === c.accountId);
    if (!account) continue;
    const urgency = getRenewalUrgency(daysLeft);
    out.push({
      id: `renew-${c.accountId}`, kind: "RENEWAL_DUE",
      severity: urgency === "CRITICAL" ? "HIGH" : "MED",
      title: `${account.name} 계약 ${daysLeft}일 후 만료`,
      detail: `${formatCurrency(c.annualValue)} · 자동 갱신 아님`,
      href: "/crm/renewals",
      ageMs: (90 - daysLeft) * 86400000, // 마감 임박할수록 위로
      refType: "account", refId: c.accountId,
    });
  }

  // 4) 지연된 태스크
  if (opts.enableOverdueTask) for (const t of MOCK_TASKS) {
    if (t.status !== "TODO" || !t.dueAt) continue;
    const due = new Date(t.dueAt).getTime();
    if (due < now) {
      const daysLate = Math.floor((now - due) / 86400000);
      out.push({
        id: `task-${t.id}`, kind: "OVERDUE_TASK",
        severity: t.priority === "HIGH" ? "HIGH" : "MED",
        title: `🔴 ${t.title}`,
        detail: `${daysLate}일 지연 · ${t.relatedAccountName ?? ""}`,
        href: "/tasks",
        ageMs: now - due,
        refType: "task", refId: t.id,
      });
    }
  }

  out.sort((a, b) => {
    const sevOrder = { HIGH: 0, MED: 1, LOW: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity] || b.ageMs - a.ageMs;
  });
  return out;
}

const KIND_LABEL: Record<NotifKind, string> = {
  DORMANT: "미접촉",
  STALE_DEAL: "정체",
  OVERDUE_TASK: "지연",
  NO_CONTACT_KEY: "위험",
  RENEWAL_DUE: "갱신 임박",
};

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

export function NotificationBell() {
  const version = useSalesVersion();
  const { rules } = useNotificationRules();
  const notifications = useMemo(() => detectNotifications({
    dormantDays: rules.dormantDays,
    staleDealDays: rules.staleDealDays,
    renewalWarnDays: rules.renewalWarnDays,
    enableDormant: rules.enableDormant,
    enableStaleDeal: rules.enableStaleDeal,
    enableOverdueTask: rules.enableOverdueTask,
    enableRenewal: rules.enableRenewal,
  }), [version, rules]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setReadIds(loadReadIds());
    setHydrated(true);
  }, []);

  const unreadList = hydrated ? notifications.filter((n) => !readIds.has(n.id)) : notifications;
  const unread = unreadList.length;
  const high = unreadList.filter((n) => n.severity === "HIGH").length;
  const [selected, setSelected] = useState<Notification | null>(null);

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    const next = new Set<string>();
    notifications.forEach((n) => next.add(n.id));
    setReadIds(next);
    saveReadIds(next);
  };

  const handleSelect = (n: Notification) => {
    markAsRead(n.id);
    setSelected(n);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
          aria-label="알림"
        >
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
            <span>알림 ({unread}/{notifications.length})</span>
            <div className="flex items-center gap-2">
              {high > 0 && <Badge variant="destructive" className="text-xs">긴급 {high}</Badge>}
              {unread > 0 && (
                <button
                  onClick={(e) => { e.preventDefault(); markAllRead(); }}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                  title="모두 읽음 처리"
                >
                  <CheckCheck className="h-3 w-3" />모두 읽음
                </button>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="m-0" />

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              알림이 없습니다 — 잘하고 있습니다 👍
            </div>
          ) : (
            <ul>
              {notifications.map((n) => {
                const isRead = readIds.has(n.id);
                return (
                  <li key={n.id} className="border-b last:border-0">
                    <button
                      onClick={() => handleSelect(n)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 hover:bg-accent transition-colors",
                        isRead && "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" aria-label="안 읽음" />
                        )}
                        {isRead && (
                          <Check className="h-3 w-3 text-muted-foreground shrink-0 mt-1" aria-label="읽음" />
                        )}
                        <Badge
                          variant={n.severity === "HIGH" ? "destructive" : "warning"}
                          className="text-[10px] shrink-0 mt-0.5"
                        >
                          {KIND_LABEL[n.kind]}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-sm leading-tight truncate",
                            !isRead ? "font-medium" : "font-normal"
                          )}>{n.title}</div>
                          {n.detail && (
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">{n.detail}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDetailModal
        notification={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function NotificationDetailModal({
  notification, onClose,
}: { notification: Notification | null; onClose: () => void }) {
  const open = notification !== null;
  if (!notification) return <Dialog open={false} onOpenChange={onClose}><></></Dialog>;

  const details = getDetails(notification);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${notification.severity === "HIGH" ? "text-destructive" : "text-warning"}`} />
            {notification.title}
          </DialogTitle>
          <DialogDescription>{KIND_LABEL[notification.kind]} · {notification.detail}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">왜 이 알림이 발생했나</div>
            <p className="text-sm">{details.reason}</p>
          </div>

          {details.context.length > 0 && (
            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">관련 정보</div>
              <dl className="space-y-1.5 text-sm">
                {details.context.map((row, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground shrink-0">{row.k}</dt>
                    <dd className="font-medium text-right">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {details.suggestions.length > 0 && (
            <div className="rounded-md border bg-success/5 border-success/30 p-3 space-y-2">
              <div className="text-xs font-medium text-success">권장 액션</div>
              <ul className="text-sm space-y-1">
                {details.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-success mt-1 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>닫기</Button>
          <Button asChild>
            <Link href={notification.href} onClick={onClose}>
              <ExternalLink className="h-4 w-4" />상세로 이동
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface Details {
  reason: string;
  context: { k: string; v: string }[];
  suggestions: string[];
}

function getDetails(n: Notification): Details {
  if (n.refType === "account") {
    const a = MOCK_ACCOUNTS.find((x) => x.id === n.refId);
    if (!a) return { reason: "정보 없음", context: [], suggestions: [] };
    const days = Math.floor(ageMs(a.lastActivityAt) / 86400000);
    return {
      reason: `${a.grade === "KEY_ACCOUNT" ? "KEY" : "GROWTH"} 등급 고객사가 ${days}일간 어떤 활동도 기록되지 않았습니다. ${days >= 90 ? "DORMANT 상태로 진입한 상태." : "방치 시 DORMANT 진입 위험."}`,
      context: [
        { k: "국가/도시",      v: `${a.countryName} · ${a.city}` },
        { k: "담당",           v: a.ownerName },
        { k: "YTD 거래액",     v: formatCurrency(a.totalRevenueYtd) },
        { k: "마지막 활동",    v: relativeTime(a.lastActivityAt) },
        { k: "다음 액션",      v: a.nextActionTitle ?? "없음" },
      ],
      suggestions: [
        "이번 주 내 직접 통화 또는 카톡으로 컨택",
        "분기 인사 + 신규 제안으로 재진입 시도",
        a.grade === "KEY_ACCOUNT"
          ? "결렬 시 분기말 공식 정리 검토 (KEY 등급 박탈)"
          : "GROWTH → LOW_POTENTIAL 강등 검토",
      ],
    };
  }

  if (n.refType === "deal") {
    const d = MOCK_DEALS.find((x) => x.id === n.refId);
    if (!d) return { reason: "정보 없음", context: [], suggestions: [] };
    const blockers = d.blockers?.map((b) => `${b.title} (${b.severity})`).join(", ") ?? "—";
    return {
      reason: `${d.stageName} 단계에 ${d.daysInStage}일째 머물러 있습니다. 평균 체류일의 ${
        d.daysInStage >= 21 ? "3배 이상" : "2배 가까이"
      } 정체된 상태로, 클로징 확률 하락 위험이 있습니다.`,
      context: [
        { k: "고객사",          v: d.accountName },
        { k: "예상 거래액",     v: formatCurrency(d.amount) },
        { k: "예상 GP",         v: formatCurrency(d.expectedGp) },
        { k: "성공률",          v: `${d.probabilityPct}%` },
        { k: "클로징 예정",     v: d.expectedCloseDate },
        { k: "장애 요인",       v: blockers },
      ],
      suggestions: [
        "오늘 내로 담당 결정권자에게 직접 통화",
        "단계 진전 또는 명확한 종결 (Lost 처리)",
        d.daysInStage >= 21 ? "리더 동석 미팅 또는 임원 escalate" : "Follow-up 일정 잡기",
      ],
    };
  }

  if (n.refType === "task") {
    const t = MOCK_TASKS.find((x) => x.id === n.refId);
    if (!t) return { reason: "정보 없음", context: [], suggestions: [] };
    const daysLate = t.dueAt
      ? Math.floor((Date.now() - new Date(t.dueAt).getTime()) / 86400000)
      : 0;
    return {
      reason: `예정된 마감일을 ${daysLate}일 초과한 태스크입니다. ${t.priority === "HIGH" ? "우선순위 HIGH — 즉시 처리 필요." : ""}`,
      context: [
        { k: "우선순위",        v: t.priority },
        { k: "마감일",          v: t.dueAt ? new Date(t.dueAt).toLocaleString("ko-KR") : "—" },
        { k: "관련 고객사",     v: t.relatedAccountName ?? "—" },
        { k: "관련 딜",         v: t.relatedDealName ?? "—" },
      ],
      suggestions: [
        "지금 즉시 처리하거나 명확한 사유로 취소",
        "마감일 재조정 필요 시 1on1에서 LEAD와 협의",
      ],
    };
  }

  return { reason: "", context: [], suggestions: [] };
}
