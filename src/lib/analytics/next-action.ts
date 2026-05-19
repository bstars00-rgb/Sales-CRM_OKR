/**
 * 다음 액션 추천 — 룰 기반 (LLM 없이도 합리적인 제안 생성).
 *
 * 시그널:
 * - 딜 단계 + 마지막 활동 타입 → 자연스러운 다음 액션
 * - 위험도 → 긴급 액션
 * - blockers → 해결 제안
 */

import { MOCK_ACTIVITIES } from "../mock/activities";
import type { Deal, Activity } from "../mock/types";

export interface NextAction {
  priority: "URGENT" | "HIGH" | "MED" | "LOW";
  emoji: string;
  title: string;
  reason: string;
  suggestedChannel?: "CALL" | "MEETING" | "EMAIL" | "MESSENGER";
}

export function suggestNextActions(deal: Deal, max = 3): NextAction[] {
  if (deal.outcome !== "OPEN") return [];

  const actions: NextAction[] = [];
  const activities = MOCK_ACTIVITIES
    .filter((a) => a.dealId === deal.id || a.accountId === deal.accountId)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const latest = activities[0];
  const daysSinceLatest = latest
    ? Math.floor((Date.now() - new Date(latest.occurredAt).getTime()) / 86400000)
    : 999;

  // 1) Blockers 해결 우선
  for (const b of deal.blockers ?? []) {
    actions.push({
      priority: b.severity === "HIGH" ? "URGENT" : "HIGH",
      emoji: b.severity === "HIGH" ? "🔥" : "⚠",
      title: `장애 해결: ${b.title}`,
      reason: `${b.severity} 단계 blocker — 단계 진전 막힘`,
      suggestedChannel: b.severity === "HIGH" ? "MEETING" : "CALL",
    });
  }

  // 2) 단계별 표준 액션 (방금 발생한 활동 기반)
  const lastType = latest?.activityType;

  if (deal.stageId === "stg-1" || deal.stageId === "stg-2") {
    // New Lead / Contacted → 첫 미팅 잡기
    actions.push({
      priority: "HIGH",
      emoji: "📅",
      title: "첫 미팅 일정 잡기",
      reason: "초기 단계 — 의사결정권자와 직접 만남으로 신뢰 형성",
      suggestedChannel: "EMAIL",
    });
  } else if (deal.stageId === "stg-3" || deal.stageId === "stg-4") {
    // Meeting Scheduled / Done → 견적 발송
    if (lastType !== "PROPOSAL_SENT") {
      actions.push({
        priority: "HIGH",
        emoji: "📝",
        title: "맞춤 견적서 발송",
        reason: "미팅 결과 반영한 견적이 다음 자연스러운 단계",
        suggestedChannel: "EMAIL",
      });
    }
  } else if (deal.stageId === "stg-5") {
    // Proposal Sent → 가격 협상 / 응답 push
    actions.push({
      priority: "HIGH",
      emoji: "📞",
      title: "견적 응답 확인 통화",
      reason: "견적 발송 후 3-5일 내 응답 push가 표준",
      suggestedChannel: "CALL",
    });
  } else if (deal.stageId === "stg-6") {
    // Negotiation → 가격/조건 좁히기
    actions.push({
      priority: "URGENT",
      emoji: "🤝",
      title: "최종 조건 합의 미팅",
      reason: "협상 단계 — 결정권자 동석 필요",
      suggestedChannel: "MEETING",
    });
  } else if (deal.stageId === "stg-7") {
    // Contracting → 계약서 보내고 서명 받기
    actions.push({
      priority: "HIGH",
      emoji: "✍",
      title: "계약서 발송 + 서명 일정",
      reason: "Contracting 단계 — 법무 리뷰 병행",
      suggestedChannel: "EMAIL",
    });
  } else if (deal.stageId === "stg-8") {
    // API / Integration → 기술 컨택
    actions.push({
      priority: "MED",
      emoji: "🛠",
      title: "기술팀 킥오프 미팅",
      reason: "API 연동 단계 — 양사 개발자 채널 오픈",
      suggestedChannel: "MEETING",
    });
  }

  // 3) 활동 부재 — 재컨택
  if (daysSinceLatest >= 14) {
    actions.push({
      priority: daysSinceLatest >= 30 ? "URGENT" : "HIGH",
      emoji: "💬",
      title: `재컨택 (${daysSinceLatest}일 미접촉)`,
      reason: "장기 미접촉 시 관계 식음 — 가벼운 안부로 재진입",
      suggestedChannel: "MESSENGER",
    });
  }

  // 4) 클로징 임박
  const daysToClose = Math.floor(
    (new Date(deal.expectedCloseDate).getTime() - Date.now()) / 86400000
  );
  if (daysToClose >= 0 && daysToClose <= 7) {
    actions.push({
      priority: "URGENT",
      emoji: "⏰",
      title: `클로징 ${daysToClose}일 전 — 최종 확정`,
      reason: "예정일 임박 — Win/Lost 명확히 종결",
      suggestedChannel: "CALL",
    });
  } else if (daysToClose < 0) {
    actions.push({
      priority: "URGENT",
      emoji: "⏰",
      title: `클로징 예정일 ${Math.abs(daysToClose)}일 경과 — 재조정`,
      reason: "예정일 초과 — 새로운 클로징일 약속하거나 종결",
      suggestedChannel: "CALL",
    });
  }

  // 우선순위 정렬 + 중복 제거 (title 기준)
  const seen = new Set<string>();
  const sorted = actions
    .filter((a) => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    })
    .sort((a, b) => {
      const order = { URGENT: 0, HIGH: 1, MED: 2, LOW: 3 };
      return order[a.priority] - order[b.priority];
    });

  return sorted.slice(0, max);
}

/** Activity 기록 후 추천되는 다음 액션 (위저드 종료 후 표시용) */
export function suggestAfterActivity(activity: Activity): NextAction | null {
  switch (activity.activityType) {
    case "CALL":
    case "MEETING":
      if (activity.outcome?.toLowerCase().includes("긍정")) {
        return {
          priority: "HIGH", emoji: "📝",
          title: "다음 단계 제안 이메일 발송",
          reason: "긍정 응답 — 모멘텀 잃기 전 다음 자료 전달",
          suggestedChannel: "EMAIL",
        };
      }
      return {
        priority: "MED", emoji: "🔁",
        title: "1주일 후 Follow-up 일정",
        reason: "통화/미팅 후 표준 follow-up",
        suggestedChannel: "EMAIL",
      };
    case "PROPOSAL_SENT":
      return {
        priority: "HIGH", emoji: "📞",
        title: "3-5일 내 견적 응답 push",
        reason: "견적 발송 후 잊혀지지 않게 가벼운 확인",
        suggestedChannel: "CALL",
      };
    case "EMAIL_LOG":
      return {
        priority: "LOW", emoji: "👀",
        title: "응답 확인 + 미응답 시 push",
        reason: "이메일은 응답률 낮음 — 24h 후 메신저로 push",
      };
    default:
      return null;
  }
}

export const PRIORITY_META: Record<NextAction["priority"], { label: string; tone: "destructive" | "warning" | "default" | "muted" }> = {
  URGENT: { label: "긴급", tone: "destructive" },
  HIGH:   { label: "높음", tone: "warning" },
  MED:    { label: "보통", tone: "default" },
  LOW:    { label: "낮음", tone: "muted" },
};
