/**
 * Mock 데이터로부터 팀/회사 단위 주간 보고서 집계.
 * 실제 ELLIS 연동 시 ellisFetch + 같은 인터페이스로 교체 가능.
 */

import { MOCK_ACCOUNTS } from "../mock/accounts";
import { MOCK_DEALS } from "../mock/deals";
import { MOCK_ACTIVITIES, MOCK_TASKS } from "../mock/activities";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isInLastWeek(iso: string): boolean {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return t >= now - WEEK_MS && t <= now;
}

function isInWeek(iso: string, daysFromTodayStart: number, daysFromTodayEnd: number): boolean {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return t >= now + daysFromTodayStart * 86400000
      && t <  now + daysFromTodayEnd   * 86400000;
}

export interface BriefAggregate {
  scope: "TEAM" | "COMPANY";
  scopeName: string;
  members: string[];                             // 포함된 owner_user_id 목록
  revenue: number;                               // 이번주 WON 합계
  gp: number;
  wonCount: number;
  lostCount: number;
  lostAmount: number;
  newAccounts: number;
  meetings: number;
  calls: number;
  proposals: number;
  messengers: number;
  emails: number;
  pipelineOpen: number;                          // 진행중 OPEN deal 합계
  pipelineDelta: number;                         // 전주 대비 변화 (mock: +ratio)
  briefSubmissionPct: number;                    // 제출률 (mock: 멤버 수 기준)
  topWonDeals: { name: string; accountName: string; amount: number }[];
  topLostDeals: { name: string; accountName: string; amount: number; reason?: string }[];
  staleDealCount: number;                        // 단계 체류 14일+
  dormantKeyAccounts: number;                    // KEY/GROWTH 미접촉 60일+
  ownerSummaries: Array<{
    ownerUserId: string;
    ownerName: string;
    wonAmount: number;
    wonCount: number;
    meetings: number;
    pacing: "ok" | "warn" | "bad";
  }>;
}

export function aggregateBrief(scope: "TEAM" | "COMPANY", scopeName: string, ownerIds?: string[]): BriefAggregate {
  // 팀 단위: ownerIds로 필터링, 회사 단위: 전체
  const matchesOwner = (owner: string) =>
    scope === "COMPANY" || (ownerIds?.includes(owner) ?? true);

  const ownersInScope = scope === "COMPANY"
    ? Array.from(new Set(MOCK_ACCOUNTS.map((a) => a.ownerUserId)))
    : (ownerIds ?? []);

  // === 이번 주 WON 딜 (최근 7일 내 close)
  const recentWon = MOCK_DEALS.filter((d) => d.outcome === "WON" && matchesOwner(d.ownerUserId));
  const recentLost = MOCK_DEALS.filter((d) => d.outcome === "LOST" && matchesOwner(d.ownerUserId));

  // === 이번 주 활동
  const weekActivities = MOCK_ACTIVITIES.filter(
    (a) => isInLastWeek(a.occurredAt) && matchesOwner(a.userId)
  );

  // === 진행중 OPEN deal
  const openDeals = MOCK_DEALS.filter((d) => d.outcome === "OPEN" && matchesOwner(d.ownerUserId));
  const pipelineOpen = openDeals.reduce((s, d) => s + d.amount, 0);

  // === 단계 체류 14일+ (정체)
  const staleDealCount = openDeals.filter((d) => d.daysInStage >= 14).length;

  // === 미접촉 KEY/GROWTH 60일+
  const dormantKeyAccounts = MOCK_ACCOUNTS.filter((a) => {
    if (!matchesOwner(a.ownerUserId)) return false;
    if (a.grade !== "KEY_ACCOUNT" && a.grade !== "GROWTH") return false;
    const days = Math.floor((Date.now() - new Date(a.lastActivityAt).getTime()) / 86400000);
    return days >= 60;
  }).length;

  // === 신규 활성 (NEW_PROSPECT 상태가 ACTIVE/MEETING/...로 진입한 것 — mock에서는 first_contact가 90일 이내인 GROWTH+)
  const newAccounts = MOCK_ACCOUNTS.filter((a) => {
    if (!matchesOwner(a.ownerUserId)) return false;
    const days = (Date.now() - new Date(a.firstContactDate).getTime()) / 86400000;
    return days < 60 && a.grade !== "DORMANT" && a.grade !== "LOW_POTENTIAL";
  }).length;

  // === Owner 단위 요약
  const ownerSummaries = ownersInScope.map((ownerId) => {
    const ownerWon = recentWon.filter((d) => d.ownerUserId === ownerId);
    const ownerMeetings = weekActivities.filter((a) => a.userId === ownerId && a.activityType === "MEETING").length;
    const wonAmount = ownerWon.reduce((s, d) => s + d.amount, 0);
    const ownerName = MOCK_ACCOUNTS.find((a) => a.ownerUserId === ownerId)?.ownerName
      ?? MOCK_DEALS.find((d) => d.ownerUserId === ownerId)?.ownerName
      ?? ownerId;
    const pacing: "ok" | "warn" | "bad" =
      wonAmount >= 80_000_000 ? "ok" :
      wonAmount >= 30_000_000 ? "warn" : "bad";
    return { ownerUserId: ownerId, ownerName, wonAmount, wonCount: ownerWon.length, meetings: ownerMeetings, pacing };
  }).sort((a, b) => b.wonAmount - a.wonAmount);

  return {
    scope,
    scopeName,
    members: ownersInScope,
    revenue: recentWon.reduce((s, d) => s + d.amount, 0),
    gp: recentWon.reduce((s, d) => s + d.expectedGp, 0),
    wonCount: recentWon.length,
    lostCount: recentLost.length,
    lostAmount: recentLost.reduce((s, d) => s + d.amount, 0),
    newAccounts,
    meetings: weekActivities.filter((a) => a.activityType === "MEETING").length,
    calls: weekActivities.filter((a) => a.activityType === "CALL").length,
    proposals: weekActivities.filter((a) => a.activityType === "PROPOSAL_SENT").length,
    messengers: weekActivities.filter((a) => a.activityType === "MESSENGER").length,
    emails: weekActivities.filter((a) => a.activityType === "EMAIL_LOG").length,
    pipelineOpen,
    pipelineDelta: 12, // mock: +12% 전주 대비
    briefSubmissionPct: scope === "TEAM" ? 80 : 88,
    topWonDeals: recentWon
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((d) => ({ name: d.name, accountName: d.accountName, amount: d.amount })),
    topLostDeals: recentLost
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
      .map((d) => ({ name: d.name, accountName: d.accountName, amount: d.amount })),
    staleDealCount,
    dormantKeyAccounts,
    ownerSummaries,
  };
}

export const KOREA_TEAM_OWNERS = ["user-mock-1", "user-park", "user-lee", "user-choi", "user-hana"];
export const VIETNAM_TEAM_OWNERS = ["user-linh", "user-hung", "user-mai"];
export const JAPAN_TEAM_OWNERS = ["user-nakamura", "user-sato"];
export const SEA_TEAM_OWNERS = ["user-somchai", "user-tan"];

export function getTeamBrief(teamName: string): BriefAggregate {
  const ownersByTeam: Record<string, string[]> = {
    "Korea Sales Team":   KOREA_TEAM_OWNERS,
    "Vietnam Sales Team": VIETNAM_TEAM_OWNERS,
    "Japan Sales Team":   JAPAN_TEAM_OWNERS,
    "SEA Sales Team":     SEA_TEAM_OWNERS,
  };
  return aggregateBrief("TEAM", teamName, ownersByTeam[teamName] ?? KOREA_TEAM_OWNERS);
}

export function getCompanyBrief(): BriefAggregate {
  return aggregateBrief("COMPANY", "Demo Hotel B2B Co.");
}
