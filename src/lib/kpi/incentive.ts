/**
 * 매니저별 KPI 실적·인센티브 계산 — Mock 데이터 기반.
 * 실 ELLIS 연동 시 deal/activity 데이터를 같은 인터페이스로 교체.
 */

import { MOCK_DEALS } from "../mock/deals";
import { MOCK_ACTIVITIES } from "../mock/activities";
import { MOCK_ACCOUNTS } from "../mock/accounts";

const QUARTER_MS = 90 * 24 * 60 * 60 * 1000;

function isInQuarter(iso: string): boolean {
  const t = new Date(iso).getTime();
  return t >= Date.now() - QUARTER_MS && t <= Date.now() + QUARTER_MS;
}

export interface KpiBreakdownRow {
  code: string;
  label: string;
  unit: "KRW" | "건";
  weight: number;
  target: number;
  actual: number;
  achievement: number;          // %
  threshold: number;            // %
  ratePer1Pct: number;          // KRW per 1%p over threshold
  cap?: number;
  incentive: number;            // KRW
}

export interface IncentiveSimulation {
  ownerUserId: string;
  ownerName: string;
  rows: KpiBreakdownRow[];
  totalIncentive: number;
  weightedAvg: number;
  status: "ok" | "warn" | "bad";
}

const TARGETS: Record<string, { target: number; weight: number; threshold: number; ratePer1Pct: number; cap?: number }> = {
  REVENUE:      { target: 300_000_000, weight: 35, threshold: 80, ratePer1Pct: 30_000,  cap: 15_000_000 },
  GP:           { target: 45_000_000,  weight: 25, threshold: 80, ratePer1Pct: 30_000,  cap: 15_000_000 },
  NEW_ACCOUNTS: { target: 4,           weight: 10, threshold: 80, ratePer1Pct: 30_000 },
  MEETINGS:     { target: 30,          weight: 10, threshold: 80, ratePer1Pct: 30_000 },
  PROPOSALS:    { target: 12,          weight: 10, threshold: 80, ratePer1Pct: 30_000 },
  CONTRACTS:    { target: 6,           weight: 10, threshold: 80, ratePer1Pct: 30_000 },
};

export function computeIncentive(ownerUserId: string, ownerName: string): IncentiveSimulation {
  // === 실적 집계 (이번 분기 = 최근 90일)
  const wonDeals = MOCK_DEALS.filter(
    (d) => d.outcome === "WON" && d.ownerUserId === ownerUserId
  );

  const revenue = wonDeals.reduce((s, d) => s + d.amount, 0) * 4; // 최근 30일×3 추정
  const gp = wonDeals.reduce((s, d) => s + d.expectedGp, 0) * 4;

  const newAccountsCount = MOCK_ACCOUNTS.filter((a) => {
    if (a.ownerUserId !== ownerUserId) return false;
    const days = (Date.now() - new Date(a.firstContactDate).getTime()) / 86400000;
    return days < 90 && a.grade !== "DORMANT";
  }).length;

  const userActivities = MOCK_ACTIVITIES.filter(
    (a) => a.userId === ownerUserId && isInQuarter(a.occurredAt)
  );
  const meetingsCount = userActivities.filter((a) => a.activityType === "MEETING").length * 4;
  const proposalsCount = userActivities.filter((a) => a.activityType === "PROPOSAL_SENT").length * 4;
  const contractsCount = wonDeals.length;

  const actuals: Record<string, number> = {
    REVENUE: revenue,
    GP: gp,
    NEW_ACCOUNTS: newAccountsCount,
    MEETINGS: meetingsCount,
    PROPOSALS: proposalsCount,
    CONTRACTS: contractsCount,
  };

  const labels: Record<string, { label: string; unit: "KRW" | "건" }> = {
    REVENUE:      { label: "REVENUE",      unit: "KRW" },
    GP:           { label: "GP",           unit: "KRW" },
    NEW_ACCOUNTS: { label: "NEW_ACCOUNTS", unit: "건" },
    MEETINGS:     { label: "MEETINGS",     unit: "건" },
    PROPOSALS:    { label: "PROPOSALS",    unit: "건" },
    CONTRACTS:    { label: "CONTRACTS",    unit: "건" },
  };

  // === 룰별 계산
  const rows: KpiBreakdownRow[] = Object.entries(TARGETS).map(([code, rule]) => {
    const actual = actuals[code] ?? 0;
    const achievement = rule.target > 0 ? Math.round((actual / rule.target) * 100) : 0;
    const overshoot = Math.max(0, achievement - rule.threshold);
    let incentive = overshoot * rule.ratePer1Pct;
    if (rule.cap !== undefined && incentive > rule.cap) incentive = rule.cap;
    return {
      code,
      label: labels[code].label,
      unit: labels[code].unit,
      weight: rule.weight,
      target: rule.target,
      actual,
      achievement,
      threshold: rule.threshold,
      ratePer1Pct: rule.ratePer1Pct,
      cap: rule.cap,
      incentive,
    };
  });

  const totalIncentive = rows.reduce((s, r) => s + r.incentive, 0);
  const weightedAvg = rows.reduce((s, r) => s + (r.achievement * r.weight) / 100, 0);
  const status: "ok" | "warn" | "bad" =
    weightedAvg >= 100 ? "ok" : weightedAvg >= 70 ? "warn" : "bad";

  return {
    ownerUserId,
    ownerName,
    rows,
    totalIncentive,
    weightedAvg,
    status,
  };
}
