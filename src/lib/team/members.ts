/**
 * 팀원별 KPI/활동 집계 — Mock 데이터에서 자동 계산.
 * 실 ELLIS 연동 시 같은 인터페이스로 교체.
 */

import { MOCK_DEALS } from "../mock/deals";
import { MOCK_ACTIVITIES, MOCK_TASKS } from "../mock/activities";
import { MOCK_ACCOUNTS } from "../mock/accounts";
import { MOCK_TEAM_MEMBERS } from "../mock/kpi";
import type { TeamMember } from "../mock/types";
import { computeIncentive } from "../kpi/incentive";

const QUARTER_TARGETS = {
  REVENUE: 300_000_000,
  GP: 45_000_000,
  WIN_RATE: 40,
  BRIEF: 90,
};

export interface TeamMemberComputed extends TeamMember {
  ownerUserId: string;
  totalIncentive: number;
}

export function getTeamMembersComputed(ownerIds: string[]): TeamMemberComputed[] {
  return ownerIds.map((userId) => {
    // 시드 (alerts·BRIEF·Critical 6 같은 정성 데이터는 mock에서 가져옴)
    const seed = MOCK_TEAM_MEMBERS.find((m) => m.userId === userId);

    // === 실 데이터 집계
    const wonDeals = MOCK_DEALS.filter((d) => d.outcome === "WON" && d.ownerUserId === userId);
    const lostDeals = MOCK_DEALS.filter((d) => d.outcome === "LOST" && d.ownerUserId === userId);
    const closedTotal = wonDeals.length + lostDeals.length;
    const winRate = closedTotal > 0 ? Math.round((wonDeals.length / closedTotal) * 100) : 0;

    const revenue = wonDeals.reduce((s, d) => s + d.amount, 0) * 4; // mock 분기 추정
    const gp = wonDeals.reduce((s, d) => s + d.expectedGp, 0) * 4;

    const userActivities = MOCK_ACTIVITIES.filter((a) => a.userId === userId);
    const meetings = userActivities.filter((a) => a.activityType === "MEETING").length * 4;
    const proposals = userActivities.filter((a) => a.activityType === "PROPOSAL_SENT").length * 4;

    const revenuePct = Math.round((revenue / QUARTER_TARGETS.REVENUE) * 100);
    const gpPct = Math.round((gp / QUARTER_TARGETS.GP) * 100);

    // alerts: 자동 감지 추가 (정체 딜·미접촉 KEY)
    const ownerOpenDeals = MOCK_DEALS.filter((d) => d.outcome === "OPEN" && d.ownerUserId === userId);
    const stalled = ownerOpenDeals.filter((d) => d.daysInStage >= 14).length;
    const dormantKey = MOCK_ACCOUNTS.filter((a) => {
      if (a.ownerUserId !== userId) return false;
      if (a.grade !== "KEY_ACCOUNT" && a.grade !== "GROWTH") return false;
      const days = (Date.now() - new Date(a.lastActivityAt).getTime()) / 86400000;
      return days >= 60;
    }).length;
    const overdueTasks = MOCK_TASKS.filter((t) => {
      if (t.ownerUserId !== userId || t.status !== "TODO" || !t.dueAt) return false;
      return new Date(t.dueAt).getTime() < Date.now();
    }).length;

    const autoAlerts: string[] = [];
    if (stalled >= 2) autoAlerts.push(`정체 딜 ${stalled}건`);
    else if (stalled === 1) autoAlerts.push("정체 딜 1건");
    if (dormantKey > 0) autoAlerts.push(`미접촉 KEY ${dormantKey}건`);
    if (overdueTasks >= 3) autoAlerts.push(`지연 태스크 ${overdueTasks}건`);

    // 시드의 정성적 alerts(1on1 누락 등)와 자동 감지 합치기
    const seedAlerts = (seed?.alerts ?? []).filter(
      (a) => !a.includes("막힌 딜") && !a.includes("미접촉") && !a.includes("정체")
    );
    const alerts = [...autoAlerts, ...seedAlerts].slice(0, 3);

    // pacing
    const avgPct = (revenuePct + gpPct) / 2;
    const pacing: "ok" | "warn" | "bad" =
      avgPct >= 100 ? "ok" : avgPct >= 70 ? "warn" : "bad";

    // 인센티브 (계산값)
    const sim = computeIncentive(userId, seed?.name ?? userId);

    return {
      ownerUserId: userId,
      userId: userId,
      name: seed?.name ?? userId,
      role: seed?.role ?? "Manager",
      revenueAchievementPct: revenuePct,
      gpAchievementPct: gpPct,
      meetings,
      proposals,
      winRate,
      briefRate: seed?.briefRate ?? 80,         // BRIEF 제출률은 mock에서 (Brief 화면 미연동)
      critical6Done: seed?.critical6Done ?? 4,  // Critical 6도 mock
      critical6Total: 6,
      pacing,
      alerts,
      totalIncentive: sim.totalIncentive,
    };
  });
}
