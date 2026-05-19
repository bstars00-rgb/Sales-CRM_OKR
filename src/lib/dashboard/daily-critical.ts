/**
 * 데일리 크리티컬 — 오늘 반드시 처리해야 할 5-6개 우선순위.
 *
 * Critical 6 (주간)과 별개로, 매일 새로 계산되는 일별 액션.
 * 시그널:
 * - 마감 임박 task (오늘/내일)
 * - 지연 task
 * - 정체 딜 (10일+ 단계 체류)
 * - 60일 이내 만료 + 자동갱신 아닌 계약
 * - 30일+ 미접촉 KEY 고객사 (가장 오래된)
 */

import { MOCK_TASKS } from "../mock/activities";
import { MOCK_DEALS } from "../mock/deals";
import { MOCK_ACCOUNTS } from "../mock/accounts";
import { MOCK_CONTRACTS, getDaysUntilExpiry } from "../mock/contracts";

export type DailyCriticalKind =
  | "TASK_OVERDUE"
  | "TASK_TODAY"
  | "DEAL_STALLED"
  | "DEAL_CLOSE_SOON"
  | "ACCOUNT_DORMANT"
  | "CONTRACT_RENEWAL";

export interface DailyCriticalItem {
  id: string;
  kind: DailyCriticalKind;
  emoji: string;
  title: string;
  reason: string;       // 왜 이게 오늘 우선인가
  href: string;
  priority: "URGENT" | "HIGH" | "MED";
}

const KIND_WEIGHT: Record<DailyCriticalKind, number> = {
  TASK_OVERDUE:     100, // 가장 긴급
  CONTRACT_RENEWAL:  90, // 큰 금액 위험
  DEAL_CLOSE_SOON:   80, // 클로징일 임박
  DEAL_STALLED:      70, // 단계 정체
  TASK_TODAY:        60, // 오늘 마감
  ACCOUNT_DORMANT:   50, // 미접촉
};

export function getDailyCritical(userId: string, role?: string, limit = 6): DailyCriticalItem[] {
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);

  const items: DailyCriticalItem[] = [];

  // 본인 담당 필터 (DIRECTOR/EXECUTIVE는 전체)
  const isOwnedByUser = (ownerId: string) =>
    role === "DIRECTOR" || role === "EXECUTIVE" || ownerId === userId;

  // 1) 지연 태스크
  for (const t of MOCK_TASKS) {
    if (t.status !== "TODO" || !t.dueAt) continue;
    if (!isOwnedByUser(t.ownerUserId)) continue;
    if (new Date(t.dueAt).getTime() >= today.getTime()) continue;
    const daysLate = Math.floor((now - new Date(t.dueAt).getTime()) / 86400000);
    items.push({
      id: `task-overdue-${t.id}`,
      kind: "TASK_OVERDUE",
      emoji: "🔴",
      title: t.title,
      reason: `${daysLate}일 지연 (${t.priority})${t.relatedAccountName ? ` · ${t.relatedAccountName}` : ""}`,
      href: "/tasks",
      priority: "URGENT",
    });
  }

  // 2) 오늘 마감 태스크
  for (const t of MOCK_TASKS) {
    if (t.status !== "TODO" || !t.dueAt) continue;
    if (!isOwnedByUser(t.ownerUserId)) continue;
    const due = new Date(t.dueAt);
    if (due < today || due >= tomorrow) continue;
    items.push({
      id: `task-today-${t.id}`,
      kind: "TASK_TODAY",
      emoji: "⏰",
      title: t.title,
      reason: `오늘 ${due.toTimeString().slice(0, 5)} 마감${t.relatedAccountName ? ` · ${t.relatedAccountName}` : ""}`,
      href: "/tasks",
      priority: t.priority === "HIGH" ? "HIGH" : "MED",
    });
  }

  // 3) 정체 딜 (10일+) — 본인 OPEN 딜
  for (const d of MOCK_DEALS) {
    if (d.outcome !== "OPEN") continue;
    if (!isOwnedByUser(d.ownerUserId)) continue;
    if (d.daysInStage < 10) continue;
    items.push({
      id: `deal-stall-${d.id}`,
      kind: "DEAL_STALLED",
      emoji: "⏱",
      title: `${d.name} 단계 진전`,
      reason: `${d.stageName} 단계에 ${d.daysInStage}일 정체 · ${d.accountName}`,
      href: `/crm/deals/${d.id}`,
      priority: d.daysInStage >= 21 ? "URGENT" : "HIGH",
    });
  }

  // 4) 클로징 임박 (7일 이내) — 본인 OPEN 딜
  for (const d of MOCK_DEALS) {
    if (d.outcome !== "OPEN") continue;
    if (!isOwnedByUser(d.ownerUserId)) continue;
    const daysToClose = Math.floor((new Date(d.expectedCloseDate).getTime() - now) / 86400000);
    if (daysToClose < 0 || daysToClose > 7) continue;
    items.push({
      id: `deal-close-${d.id}`,
      kind: "DEAL_CLOSE_SOON",
      emoji: "🎯",
      title: `${d.name} 클로징 ${daysToClose}일 전`,
      reason: `${d.accountName} · ${d.stageName}`,
      href: `/crm/deals/${d.id}`,
      priority: daysToClose <= 2 ? "URGENT" : "HIGH",
    });
  }

  // 5) 갱신 임박 (30일 이내, 자동갱신 아님) — 본인 담당 account
  for (const c of MOCK_CONTRACTS) {
    if (c.autoRenew) continue;
    const acc = MOCK_ACCOUNTS.find((a) => a.id === c.accountId);
    if (!acc) continue;
    if (!isOwnedByUser(acc.ownerUserId)) continue;
    const daysLeft = getDaysUntilExpiry(c.contractEndDate);
    if (daysLeft < 0 || daysLeft > 30) continue;
    items.push({
      id: `contract-${c.accountId}`,
      kind: "CONTRACT_RENEWAL",
      emoji: "🔁",
      title: `${acc.name} 계약 갱신 협의`,
      reason: `${daysLeft}일 후 만료 · 자동 갱신 아님`,
      href: "/crm/renewals",
      priority: daysLeft <= 14 ? "URGENT" : "HIGH",
    });
  }

  // 6) 미접촉 KEY (30일+) — 가장 오래된 1-2개만
  const dormant = MOCK_ACCOUNTS
    .filter((a) => isOwnedByUser(a.ownerUserId))
    .filter((a) => a.grade === "KEY_ACCOUNT" || a.grade === "GROWTH")
    .map((a) => ({
      a,
      days: Math.floor((now - new Date(a.lastActivityAt).getTime()) / 86400000),
    }))
    .filter((x) => x.days >= 30)
    .sort((b, c) => c.days - b.days)
    .slice(0, 2);
  for (const { a, days } of dormant) {
    items.push({
      id: `dormant-${a.id}`,
      kind: "ACCOUNT_DORMANT",
      emoji: "🌙",
      title: `${a.name} 재컨택`,
      reason: `${days}일 미접촉 · ${a.grade === "KEY_ACCOUNT" ? "KEY" : "GROWTH"}`,
      href: `/crm/accounts/${a.id}`,
      priority: days >= 60 ? "HIGH" : "MED",
    });
  }

  // 우선순위 점수로 정렬
  const priorityScore = (p: DailyCriticalItem["priority"]) =>
    p === "URGENT" ? 0 : p === "HIGH" ? 1 : 2;

  return items
    .sort((a, b) =>
      priorityScore(a.priority) - priorityScore(b.priority)
      || KIND_WEIGHT[b.kind] - KIND_WEIGHT[a.kind]
    )
    .slice(0, limit);
}

export const PRIORITY_BADGE: Record<DailyCriticalItem["priority"], { tone: "destructive" | "warning" | "default"; label: string }> = {
  URGENT: { tone: "destructive", label: "긴급" },
  HIGH:   { tone: "warning",     label: "높음" },
  MED:    { tone: "default",     label: "보통" },
};
