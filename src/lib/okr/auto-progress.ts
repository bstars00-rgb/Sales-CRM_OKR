/**
 * KR 자동 진척률 — Mock 데이터에서 계산.
 * 실 ELLIS 연동 시 같은 매핑 함수에서 ellisFetch로 교체.
 */

import { MOCK_DEALS } from "../mock/deals";
import { MOCK_OBJECTIVES } from "../mock/kpi";
import {
  KOREA_TEAM_OWNERS, VIETNAM_TEAM_OWNERS, JAPAN_TEAM_OWNERS,
} from "../brief/aggregate";
import { getCompanyYtdTotals, getCompanyCountryRevenue } from "../mock/revenue";
import type { KeyResult, Objective } from "../mock/types";

/**
 * KR id → 자동 계산 함수.
 * 정의되지 않은 KR은 mock의 currentValue를 그대로 사용 (수동 진척).
 */
const KR_AUTO_COMPUTE: Record<string, () => number> = {
  // 회사 OKR — 연간 거래액·GP·국가 비중·GP율
  "kr-1": () => getCompanyYtdTotals().revenue * 2,    // 연간 추정 = YTD × 2
  "kr-2": () => getCompanyYtdTotals().gp * 2,
  "kr-3": () => {
    const countries = getCompanyCountryRevenue();
    const top5 = countries.slice(0, 5).reduce((s, c) => s + c.revenue, 0);
    const total = countries.reduce((s, c) => s + c.revenue, 0);
    return total > 0 ? Math.round((top5 / total) * 100) : 0;
  },
  "kr-4": () => {
    const t = getCompanyYtdTotals();
    return Number(t.gpRate.toFixed(1));
  },

  // 회사 API
  "kr-5": () => MOCK_DEALS.filter((d) => d.dealType === "API_INTEGRATION" && d.outcome === "WON").length + 18,

  // Korea 팀 KR
  "kr-8": () => sumWonForOwners(KOREA_TEAM_OWNERS) * 4,    // 분기 추정
  "kr-10": () => winRateForOwners(KOREA_TEAM_OWNERS),

  // Vietnam 팀 KR
  "kr-12": () => sumWonForOwners(VIETNAM_TEAM_OWNERS) * 4,

  // Japan 팀 KR
  "kr-14": () => sumWonForOwners(JAPAN_TEAM_OWNERS) * 4,

  // 김민수 개인 KR
  "kr-17": () => sumWonForOwners(["user-mock-1"]) * 4,
  "kr-20": () => winRateForOwners(["user-mock-1"]),
};

function sumWonForOwners(owners: string[]): number {
  return MOCK_DEALS
    .filter((d) => d.outcome === "WON" && owners.includes(d.ownerUserId))
    .reduce((s, d) => s + d.amount, 0);
}

function winRateForOwners(owners: string[]): number {
  const won = MOCK_DEALS.filter((d) => d.outcome === "WON" && owners.includes(d.ownerUserId)).length;
  const lost = MOCK_DEALS.filter((d) => d.outcome === "LOST" && owners.includes(d.ownerUserId)).length;
  return won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;
}

export interface KeyResultWithSource extends KeyResult {
  progressSource: "AUTO" | "MANUAL";
}

export interface ObjectiveWithSource extends Omit<Objective, "keyResults"> {
  keyResults: KeyResultWithSource[];
}

/**
 * 모든 KR에 자동 계산 적용 (있으면) — 진척률·current 갱신.
 */
export function getObjectivesWithAutoProgress(): ObjectiveWithSource[] {
  return MOCK_OBJECTIVES.map((obj) => {
    const keyResults: KeyResultWithSource[] = obj.keyResults.map((kr) => {
      const computer = KR_AUTO_COMPUTE[kr.id];
      if (!computer) {
        return { ...kr, progressSource: "MANUAL" };
      }
      const computed = computer();
      const progressPct = kr.targetValue > 0
        ? Math.min(Math.round((computed / kr.targetValue) * 100), 200)
        : 0;
      return {
        ...kr,
        currentValue: computed,
        progressPct,
        progressSource: "AUTO",
      };
    });

    // Objective progress = KR 평균
    const avgProgress = keyResults.length > 0
      ? Math.round(keyResults.reduce((s, kr) => s + Math.min(kr.progressPct, 100), 0) / keyResults.length)
      : 0;

    return {
      ...obj,
      progressPct: avgProgress,
      keyResults,
    };
  });
}
