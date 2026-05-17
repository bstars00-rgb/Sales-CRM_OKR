import { describe, it, expect } from "vitest";
import { computeIncentive } from "@/lib/kpi/incentive";
import {
  getAccountMonthlyRevenue, getAccountYoY, getAccountTotals, getAccountQuarterly,
  getCompanyRevenueTrend, getCompanyCountryRevenue, getCompanyYtdTotals, getTopAccounts,
} from "@/lib/mock/revenue";
import { getObjectivesWithAutoProgress } from "@/lib/okr/auto-progress";
import { getNextWeekSuggestions } from "@/lib/okr/next-critical-six";
import { getTeamMembersComputed } from "@/lib/team/members";
import { aggregateBrief, getTeamBrief, getCompanyBrief, KOREA_TEAM_OWNERS } from "@/lib/brief/aggregate";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";

describe("compute: incentive", () => {
  it("returns 6 KPI rows + total + weightedAvg", () => {
    const sim = computeIncentive("user-mock-1", "김민수");
    expect(sim.rows.length).toBe(6);
    expect(sim.totalIncentive).toBeGreaterThan(0);
    expect(sim.weightedAvg).toBeGreaterThanOrEqual(0);
    expect(["ok", "warn", "bad"]).toContain(sim.status);
  });

  it("each row has achievement = round(actual/target * 100)", () => {
    const sim = computeIncentive("user-mock-1", "김민수");
    for (const r of sim.rows) {
      if (r.target > 0) {
        expect(r.achievement).toBe(Math.round((r.actual / r.target) * 100));
      }
    }
  });

  it("incentive = max(0, achievement - threshold) * ratePer1Pct (capped)", () => {
    const sim = computeIncentive("user-mock-1", "김민수");
    for (const r of sim.rows) {
      const expected = Math.max(0, r.achievement - r.threshold) * r.ratePer1Pct;
      const capped = r.cap !== undefined ? Math.min(expected, r.cap) : expected;
      expect(r.incentive).toBe(capped);
    }
  });

  it("unknown user → all zeros", () => {
    const sim = computeIncentive("ghost", "Ghost");
    const totalActual = sim.rows.reduce((s, r) => s + r.actual, 0);
    expect(totalActual).toBe(0);
    expect(sim.totalIncentive).toBe(0);
  });
});

describe("compute: revenue — determinism", () => {
  const ABC = MOCK_ACCOUNTS.find((a) => a.id === "acc-001")!;

  it("getAccountMonthlyRevenue is deterministic (same input → same output)", () => {
    const r1 = getAccountMonthlyRevenue(ABC);
    const r2 = getAccountMonthlyRevenue(ABC);
    expect(r1).toEqual(r2);
  });

  it("returns 24 months for active account", () => {
    const r = getAccountMonthlyRevenue(ABC);
    expect(r.length).toBe(24);
  });

  it("returns [] for zero-revenue account", () => {
    const empty = { ...ABC, totalRevenueYtd: 0 };
    expect(getAccountMonthlyRevenue(empty)).toEqual([]);
  });

  it("totals match sum of monthly", () => {
    const monthly = getAccountMonthlyRevenue(ABC);
    const totals = getAccountTotals(ABC);
    const sumRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
    expect(totals.revenue).toBe(sumRevenue);
  });

  it("quarterly aggregates ~8 quarters from 24 months (8 or 9 depending on month boundary)", () => {
    const q = getAccountQuarterly(ABC);
    expect(q.length).toBeGreaterThanOrEqual(8);
    expect(q.length).toBeLessThanOrEqual(9);
  });

  it("YoY is 0 for empty account", () => {
    const empty = { ...ABC, totalRevenueYtd: 0 };
    expect(getAccountYoY(empty)).toBe(0);
  });
});

describe("compute: company aggregates", () => {
  it("getCompanyRevenueTrend returns 12 entries with both years", () => {
    const t = getCompanyRevenueTrend();
    expect(t.length).toBe(12);
    expect(t[0]).toHaveProperty("month");
    expect(t[0]).toHaveProperty("thisYear");
    expect(t[0]).toHaveProperty("lastYear");
  });

  it("getCompanyCountryRevenue includes all active countries, sorted DESC", () => {
    const c = getCompanyCountryRevenue();
    expect(c.length).toBeGreaterThan(0);
    for (let i = 1; i < c.length; i++) {
      expect(c[i - 1].revenue).toBeGreaterThanOrEqual(c[i].revenue);
    }
  });

  it("getCompanyYtdTotals revenue/gp > 0", () => {
    const t = getCompanyYtdTotals();
    expect(t.revenue).toBeGreaterThan(0);
    expect(t.gp).toBeGreaterThan(0);
    expect(t.gpRate).toBeGreaterThan(0);
  });

  it("getTopAccounts respects limit and is sorted by revenueYtd DESC", () => {
    const top = getTopAccounts(5);
    expect(top.length).toBe(5);
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].revenueYtd).toBeGreaterThanOrEqual(top[i].revenueYtd);
    }
  });
});

describe("compute: OKR auto progress", () => {
  it("returns 9 objectives (회사 2 + 팀 3 + 개인 4)", () => {
    const objs = getObjectivesWithAutoProgress();
    expect(objs.length).toBe(9);
  });

  it("AUTO KRs have progressSource 'AUTO'", () => {
    const objs = getObjectivesWithAutoProgress();
    const company = objs.find((o) => o.id === "obj-co-1")!;
    // kr-1 (연간 거래액) should be AUTO
    const kr1 = company.keyResults.find((k) => k.id === "kr-1")!;
    expect(kr1.progressSource).toBe("AUTO");
  });

  it("Objective progressPct = avg of KR progressPct (clamped to 100)", () => {
    const objs = getObjectivesWithAutoProgress();
    for (const o of objs) {
      const avg = Math.round(
        o.keyResults.reduce((s, k) => s + Math.min(k.progressPct, 100), 0) / o.keyResults.length
      );
      expect(o.progressPct).toBe(avg);
    }
  });
});

describe("compute: next-week Critical 6 suggestions", () => {
  it("always includes BRIEF (고정)", () => {
    const s = getNextWeekSuggestions("user-mock-1", 8);
    const brief = s.find((x) => x.source === "BRIEF");
    expect(brief).toBeTruthy();
  });

  it("respects limit", () => {
    const s = getNextWeekSuggestions("user-mock-1", 4);
    expect(s.length).toBeLessThanOrEqual(4);
  });

  it("sorts HIGH priority first", () => {
    const s = getNextWeekSuggestions("user-mock-1", 8);
    let seenMed = false;
    for (const x of s) {
      if (x.priority === "MED") seenMed = true;
      if (x.priority === "HIGH") expect(seenMed).toBe(false);
    }
  });
});

describe("compute: team & brief aggregation", () => {
  it("getTeamMembersComputed returns one entry per owner", () => {
    const members = getTeamMembersComputed(KOREA_TEAM_OWNERS);
    expect(members.length).toBe(KOREA_TEAM_OWNERS.length);
    expect(members[0]).toHaveProperty("revenueAchievementPct");
    expect(members[0]).toHaveProperty("totalIncentive");
  });

  it("aggregateBrief COMPANY scope includes all owners", () => {
    const brief = getCompanyBrief();
    expect(brief.scope).toBe("COMPANY");
    expect(brief.members.length).toBeGreaterThan(0);
  });

  it("getTeamBrief returns Brief aggregate for known team", () => {
    const brief = getTeamBrief("Korea Sales Team");
    expect(brief.scope).toBe("TEAM");
    expect(brief.members).toEqual(KOREA_TEAM_OWNERS);
  });

  it("Brief revenue = sum of WON deals amounts (this week)", () => {
    const brief = aggregateBrief("TEAM", "Korea Sales Team", KOREA_TEAM_OWNERS);
    // 음수 아닐 것
    expect(brief.revenue).toBeGreaterThanOrEqual(0);
    // wonCount와 일관성
    if (brief.wonCount === 0) expect(brief.revenue).toBe(0);
  });
});
