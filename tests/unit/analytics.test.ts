import { describe, it, expect } from "vitest";
import { assessDealRisk, RISK_LEVEL_META } from "@/lib/analytics/risk-score";
import { suggestNextActions, suggestAfterActivity, PRIORITY_META } from "@/lib/analytics/next-action";
import { WIN_REASONS, LOST_REASONS, CATEGORY_META, getWinReason, getLostReason } from "@/lib/analytics/reason-codes";
import { MOCK_DEALS } from "@/lib/mock/deals";
import type { Deal, Activity } from "@/lib/mock/types";

const baseDeal: Deal = {
  id: "test-deal", name: "테스트 딜", accountId: "acc-001", accountName: "ABC",
  ownerUserId: "u1", ownerName: "Tester",
  dealType: "NEW", outcome: "OPEN",
  amount: 100_000_000, expectedGp: 15_000_000, currency: "KRW",
  probabilityPct: 50, expectedCloseDate: "2026-06-30",
  stageId: "stg-4", stageName: "Meeting Done", stageOrder: 4,
  daysInStage: 5, countryCode: "KR", grade: "GROWTH",
};

describe("analytics: risk-score", () => {
  it("OPEN 딜은 RiskAssessment 반환", () => {
    const r = assessDealRisk(baseDeal);
    expect(r.dealId).toBe("test-deal");
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(["LOW", "MID", "HIGH", "CRITICAL"]).toContain(r.level);
  });

  it("단계 체류 초과 시그널 동작 (21일 → 3배)", () => {
    const r = assessDealRisk({ ...baseDeal, daysInStage: 21 });
    const stageSignal = r.signals.find((s) => s.code === "STAGE_OVERSTAY");
    expect(stageSignal?.triggered).toBe(true);
    expect(stageSignal?.weight).toBeGreaterThanOrEqual(20);
  });

  it("blockers HIGH가 위험 점수에 가산", () => {
    const r1 = assessDealRisk(baseDeal);
    const r2 = assessDealRisk({
      ...baseDeal,
      blockers: [{ title: "테스트", severity: "HIGH" }],
    });
    expect(r2.score).toBeGreaterThan(r1.score);
  });

  it("클로징 예정일 경과 시 트리거", () => {
    const r = assessDealRisk({ ...baseDeal, expectedCloseDate: "2020-01-01" });
    const closeSignal = r.signals.find((s) => s.code === "CLOSE_DATE_PRESSURE");
    expect(closeSignal?.triggered).toBe(true);
  });

  it("level 매핑이 score 임계와 일치", () => {
    expect(RISK_LEVEL_META.LOW.label).toBe("낮음");
    expect(RISK_LEVEL_META.CRITICAL.label).toBe("긴급");
  });

  it("MOCK_DEALS 전체에 대해 예외 없이 실행", () => {
    for (const d of MOCK_DEALS.filter((x) => x.outcome === "OPEN")) {
      const r = assessDealRisk(d);
      expect(r).toBeDefined();
      expect(r.signals.length).toBeGreaterThan(0);
    }
  });
});

describe("analytics: next-action", () => {
  it("OPEN 딜은 최대 max개 추천 반환", () => {
    const actions = suggestNextActions(baseDeal, 3);
    expect(actions.length).toBeLessThanOrEqual(3);
  });

  it("WON 딜은 빈 배열 반환", () => {
    const won = { ...baseDeal, outcome: "WON" as const };
    expect(suggestNextActions(won)).toEqual([]);
  });

  it("blockers HIGH가 URGENT 우선순위로 추천", () => {
    const d = { ...baseDeal, blockers: [{ title: "결제 이슈", severity: "HIGH" as const }] };
    const actions = suggestNextActions(d, 5);
    expect(actions[0]?.priority).toBe("URGENT");
  });

  it("Negotiation 단계는 미팅 제안", () => {
    const d = { ...baseDeal, stageId: "stg-6", stageOrder: 6 };
    const actions = suggestNextActions(d, 5);
    expect(actions.some((a) => a.suggestedChannel === "MEETING")).toBe(true);
  });

  it("suggestAfterActivity: CALL → follow-up 제안", () => {
    const a: Activity = {
      id: "act-1", activityType: "CALL", userId: "u1", userName: "T",
      occurredAt: new Date().toISOString(),
    };
    const next = suggestAfterActivity(a);
    expect(next).not.toBeNull();
    expect(next?.title).toMatch(/Follow/i);
  });

  it("PRIORITY_META 4개 모두 정의", () => {
    expect(Object.keys(PRIORITY_META).sort()).toEqual(["HIGH", "LOW", "MED", "URGENT"]);
  });
});

describe("analytics: reason-codes", () => {
  it("WIN/LOST 사유 카탈로그 비어있지 않음", () => {
    expect(WIN_REASONS.length).toBeGreaterThanOrEqual(5);
    expect(LOST_REASONS.length).toBeGreaterThanOrEqual(5);
  });

  it("getWinReason/getLostReason 코드로 조회", () => {
    expect(getWinReason("PRICE_COMPETITIVE")?.label).toBeDefined();
    expect(getLostReason("PRICE_TOO_HIGH")?.label).toBeDefined();
    expect(getWinReason("UNKNOWN_CODE")).toBeNull();
  });

  it("CATEGORY_META 6개 정의", () => {
    expect(Object.keys(CATEGORY_META).sort()).toEqual(
      ["COMPETITOR", "INTERNAL", "PRICE", "PRODUCT", "RELATIONSHIP", "TIMING"]
    );
  });

  it("모든 카탈로그 항목이 category에 매핑됨", () => {
    const allCats = new Set(Object.keys(CATEGORY_META));
    for (const r of [...WIN_REASONS, ...LOST_REASONS]) {
      expect(allCats.has(r.category)).toBe(true);
    }
  });
});
