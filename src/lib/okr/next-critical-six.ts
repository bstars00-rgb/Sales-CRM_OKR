/**
 * 다음주 Critical 6 자동 추천 — 정체 딜·미접촉 KEY·이월 작업에서 도출.
 */

import { MOCK_DEALS } from "../mock/deals";
import { MOCK_ACCOUNTS } from "../mock/accounts";
import { MOCK_TASKS } from "../mock/activities";
import { MOCK_CRITICAL_6 } from "../mock/kpi";

export interface CriticalSixSuggestion {
  title: string;
  reason: string;
  source: "STALE_DEAL" | "DORMANT_KEY" | "OVERDUE_TASK" | "CARRY_OVER" | "OPEN_DEAL_HIGH_VALUE" | "BRIEF";
  priority: "HIGH" | "MED" | "LOW";
  linkedRefId?: string;
  linkedRefName?: string;
  by?: string;
}

export function getNextWeekSuggestions(userId: string, limit = 8): CriticalSixSuggestion[] {
  const out: CriticalSixSuggestion[] = [];

  // 1. 이번주 이월 (Critical 6 미완료) — 본인 항목만
  for (const item of MOCK_CRITICAL_6) {
    if (item.ownerUserId && item.ownerUserId !== userId) continue;
    if (!item.done) {
      out.push({
        title: item.title,
        reason: "이번주 미완료 — 다음주로 이월",
        source: "CARRY_OVER",
        priority: "HIGH",
        linkedRefId: item.linkedDealId,
        linkedRefName: item.linkedDealName,
        by: "다음주 EOD",
      });
    }
  }

  // 2. 정체 딜 (14일+) — 본인 딜
  const stalled = MOCK_DEALS
    .filter((d) => d.outcome === "OPEN" && d.ownerUserId === userId && d.daysInStage >= 14)
    .sort((a, b) => b.amount - a.amount);
  for (const d of stalled.slice(0, 2)) {
    out.push({
      title: `${d.accountName} ${d.stageName} 단계 해소`,
      reason: `${d.daysInStage}일 정체 (${d.daysInStage >= 21 ? "긴급" : "경고"}) · 예상 ${formatCurrency(d.amount)}`,
      source: "STALE_DEAL",
      priority: d.daysInStage >= 21 ? "HIGH" : "MED",
      linkedRefId: d.id,
      linkedRefName: d.name,
      by: "다음주 화요일",
    });
  }

  // 3. 미접촉 KEY/GROWTH 고객사 (본인 담당)
  const dormant = MOCK_ACCOUNTS
    .filter((a) => {
      if (a.ownerUserId !== userId) return false;
      if (a.grade !== "KEY_ACCOUNT" && a.grade !== "GROWTH") return false;
      const days = (Date.now() - new Date(a.lastActivityAt).getTime()) / 86400000;
      return days >= 60;
    })
    .sort((a, b) => b.totalRevenueYtd - a.totalRevenueYtd);
  for (const a of dormant.slice(0, 1)) {
    const days = Math.floor((Date.now() - new Date(a.lastActivityAt).getTime()) / 86400000);
    out.push({
      title: `${a.name} 재진입 시도 (${days}일 미접촉)`,
      reason: `${a.grade === "KEY_ACCOUNT" ? "KEY" : "GROWTH"} 등급 · YTD ${formatCurrency(a.totalRevenueYtd)} · DORMANT 진입 위험`,
      source: "DORMANT_KEY",
      priority: "HIGH",
      linkedRefId: a.id,
      linkedRefName: a.name,
      by: "다음주 월요일",
    });
  }

  // 4. 큰 OPEN 딜 (본인, 진척 가능한 단계)
  const bigOpen = MOCK_DEALS
    .filter((d) =>
      d.outcome === "OPEN"
      && d.ownerUserId === userId
      && d.daysInStage < 14
      && d.amount >= 80_000_000
      && (d.stageName === "Proposal Sent" || d.stageName === "Negotiation" || d.stageName === "Contracting")
    )
    .sort((a, b) => b.amount - a.amount);
  for (const d of bigOpen.slice(0, 1)) {
    out.push({
      title: `${d.accountName} ${d.stageName === "Contracting" ? "계약 클로징" : "다음 단계 진전"}`,
      reason: `예상 ${formatCurrency(d.amount)} · 성공률 ${d.probabilityPct}% · 분기말 매출 기여`,
      source: "OPEN_DEAL_HIGH_VALUE",
      priority: "HIGH",
      linkedRefId: d.id,
      linkedRefName: d.name,
      by: "다음주 EOD",
    });
  }

  // 5. 지연 태스크 정리
  const overdueCount = MOCK_TASKS.filter((t) => {
    if (t.ownerUserId !== userId || t.status !== "TODO" || !t.dueAt) return false;
    return new Date(t.dueAt).getTime() < Date.now();
  }).length;
  if (overdueCount > 0) {
    out.push({
      title: `지연 태스크 ${overdueCount}건 정리`,
      reason: `이번주 마감 못 한 태스크들 처리 또는 명확한 사유로 취소`,
      source: "OVERDUE_TASK",
      priority: overdueCount >= 3 ? "HIGH" : "MED",
      by: "다음주 월요일",
    });
  }

  // 6. 항상 들어가는 운영 항목
  out.push({
    title: "주간보고 + 1on1",
    reason: "고정 일정",
    source: "BRIEF",
    priority: "MED",
    by: "다음주 일 EOD",
  });

  // 우선순위 정렬 + limit (BRIEF는 항상 포함)
  const priorityOrder = { HIGH: 0, MED: 1, LOW: 2 };
  const sorted = out.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  const briefIdx = sorted.findIndex((x) => x.source === "BRIEF");
  const top = sorted.slice(0, limit);
  if (briefIdx >= 0 && !top.find((x) => x.source === "BRIEF")) {
    // BRIEF가 잘려 나갔으면 마지막에 강제 삽입
    top[top.length - 1] = sorted[briefIdx];
  }
  return top;
}

function formatCurrency(n: number): string {
  if (n >= 100_000_000) return `₩${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `₩${(n / 10_000).toFixed(0)}만`;
  return `₩${n.toLocaleString()}`;
}
