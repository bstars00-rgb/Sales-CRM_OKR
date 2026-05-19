/**
 * 딜 위험도 자동 점수화 — 룰 기반 0-100 점수.
 *
 * 각 위험 시그널은 가중치를 가짐. 합산 후 100점 만점으로 정규화.
 * - 단계 체류일 (14일 초과)
 * - blockers 존재 (HIGH/MID/LOW)
 * - 활동 없음 (담당 고객사에)
 * - 클로징 예정일 도래/초과
 * - 단계 대비 확률 부조화 (Negotiation인데 확률 30% 등)
 */

import { MOCK_ACTIVITIES } from "../mock/activities";
import type { Deal } from "../mock/types";

const STAGE_AVG_DAYS = 7;

export interface RiskSignal {
  code: string;
  label: string;
  weight: number;       // 가중치 (양수 = 위험 증가)
  triggered: boolean;
  detail?: string;
}

export interface RiskAssessment {
  dealId: string;
  score: number;          // 0-100 (높을수록 위험)
  level: "LOW" | "MID" | "HIGH" | "CRITICAL";
  signals: RiskSignal[];
  recommendation: string;
}

export function assessDealRisk(deal: Deal): RiskAssessment {
  const signals: RiskSignal[] = [];

  // 1. 단계 체류 초과
  const stayMultiple = deal.daysInStage / STAGE_AVG_DAYS;
  signals.push({
    code: "STAGE_OVERSTAY",
    label: "단계 체류 초과",
    weight: stayMultiple >= 3 ? 30 : stayMultiple >= 2 ? 20 : stayMultiple >= 1.5 ? 10 : 0,
    triggered: stayMultiple >= 1.5,
    detail: `${deal.daysInStage}일 (평균 ${STAGE_AVG_DAYS}일의 ${stayMultiple.toFixed(1)}배)`,
  });

  // 2. Blockers
  const blockerWeight = (deal.blockers ?? []).reduce((s, b) =>
    s + (b.severity === "HIGH" ? 25 : b.severity === "MID" ? 15 : 5), 0);
  signals.push({
    code: "BLOCKERS",
    label: "장애 요인 존재",
    weight: blockerWeight,
    triggered: blockerWeight > 0,
    detail: deal.blockers ? deal.blockers.map((b) => `${b.title}(${b.severity})`).join(", ") : "",
  });

  // 3. 담당 고객사 활동 없음 (30일+)
  const activities = MOCK_ACTIVITIES.filter((a) => a.accountId === deal.accountId);
  const latestActivity = activities.sort((a, b) =>
    new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
  if (latestActivity) {
    const daysSince = Math.floor((Date.now() - new Date(latestActivity.occurredAt).getTime()) / 86400000);
    signals.push({
      code: "NO_RECENT_ACTIVITY",
      label: "활동 부재",
      weight: daysSince >= 60 ? 20 : daysSince >= 30 ? 12 : daysSince >= 14 ? 5 : 0,
      triggered: daysSince >= 14,
      detail: `마지막 활동 ${daysSince}일 전`,
    });
  } else {
    signals.push({
      code: "NO_RECENT_ACTIVITY",
      label: "활동 부재",
      weight: 25,
      triggered: true,
      detail: "고객사에 기록된 활동 없음",
    });
  }

  // 4. 클로징 예정일 도래/초과
  const closeDate = new Date(deal.expectedCloseDate);
  const daysToClose = Math.floor((closeDate.getTime() - Date.now()) / 86400000);
  signals.push({
    code: "CLOSE_DATE_PRESSURE",
    label: "클로징일 압박",
    weight: daysToClose < 0 ? 25 : daysToClose < 7 ? 12 : daysToClose < 14 ? 5 : 0,
    triggered: daysToClose < 14,
    detail: daysToClose < 0
      ? `클로징 예정일 ${Math.abs(daysToClose)}일 경과`
      : `클로징 ${daysToClose}일 남음`,
  });

  // 5. 단계-확률 부조화 (단계는 진행됐는데 확률이 낮음)
  // stageOrder: 6 = Negotiation 이상이면 보통 60%+, 그 이하면 부조화
  const expectedProb = Math.min(100, deal.stageOrder * 12);
  const probGap = expectedProb - deal.probabilityPct;
  signals.push({
    code: "PROBABILITY_GAP",
    label: "단계-확률 부조화",
    weight: probGap >= 30 ? 15 : probGap >= 15 ? 8 : 0,
    triggered: probGap >= 15,
    detail: probGap > 0 ? `단계 기대치 ${expectedProb}% vs 실제 ${deal.probabilityPct}%` : "",
  });

  // 점수 합산 (max 100 cap)
  const rawScore = signals.filter((s) => s.triggered).reduce((s, x) => s + x.weight, 0);
  const score = Math.min(100, rawScore);

  const level: RiskAssessment["level"] =
    score >= 70 ? "CRITICAL" :
    score >= 50 ? "HIGH" :
    score >= 25 ? "MID" :
    "LOW";

  const recommendation = makeRecommendation(level, signals);

  return { dealId: deal.id, score, level, signals, recommendation };
}

function makeRecommendation(level: RiskAssessment["level"], signals: RiskSignal[]): string {
  if (level === "LOW") return "정상 진행 중 — 단계별 표준 액션 유지";
  const active = signals.filter((s) => s.triggered).sort((a, b) => b.weight - a.weight);
  const top = active[0];
  if (!top) return "추가 액션 필요";

  switch (top.code) {
    case "STAGE_OVERSTAY":
      return "오늘 내 담당 결정권자에게 직접 통화로 단계 진전 시도";
    case "BLOCKERS":
      return "장애 요인 해결을 위한 LEAD 동석 미팅 또는 임원 escalate";
    case "NO_RECENT_ACTIVITY":
      return "이번 주 내 컨택 (통화/방문/카톡) 재개 — 관계 식기 전 회복";
    case "CLOSE_DATE_PRESSURE":
      return "클로징 예정일 재조정 또는 명확한 Win/Lost 종결";
    case "PROBABILITY_GAP":
      return "현재 단계 진척과 확률을 정렬 (필요시 단계 되돌리기 검토)";
    default:
      return "추가 진단 후 액션";
  }
}

export const RISK_LEVEL_META: Record<RiskAssessment["level"], { label: string; tone: "destructive" | "warning" | "default" | "success"; emoji: string }> = {
  CRITICAL: { label: "긴급",   tone: "destructive", emoji: "🔴" },
  HIGH:     { label: "높음",   tone: "destructive", emoji: "🟠" },
  MID:      { label: "보통",   tone: "warning",     emoji: "🟡" },
  LOW:      { label: "낮음",   tone: "success",     emoji: "🟢" },
};
