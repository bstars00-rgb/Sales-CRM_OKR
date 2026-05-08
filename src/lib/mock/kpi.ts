import type { KpiCard, Critical6Item, Objective, TeamMember } from "./types";

export const MOCK_KPI_MANAGER: KpiCard[] = [
  { code: "REVENUE",      label: "내 매출 (Q2)",       unit: "KRW", current: 396_000_000, target: 300_000_000, achievementPct: 132, yoyDelta: 35 },
  { code: "GP",           label: "내 GP (Q2)",         unit: "KRW", current: 60_000_000,  target: 45_000_000,  achievementPct: 133 },
  { code: "INCENTIVE",    label: "인센티브 미리보기", unit: "KRW", current: 9_800_000,   target: 0,           achievementPct: 0 },
  { code: "NEW_ACCOUNTS", label: "신규 활성 (Q2)",    unit: "건",  current: 5,           target: 4,           achievementPct: 125 },
  { code: "MEETINGS",     label: "미팅 (Q2)",          unit: "건",  current: 38,          target: 30,          achievementPct: 127 },
  { code: "WIN_RATE",     label: "Win율 (Q2)",         unit: "%",   current: 45,          target: 40,          achievementPct: 113 },
];

export const MOCK_KPI_LEAD: KpiCard[] = [
  { code: "TEAM_REVENUE", label: "팀 매출 (Q2)",       unit: "KRW", current: 1_600_000_000, target: 1_900_000_000, achievementPct: 84 },
  { code: "TEAM_GP",      label: "팀 GP (Q2)",         unit: "KRW", current: 240_000_000,   target: 300_000_000,   achievementPct: 80 },
  { code: "TEAM_NEW",     label: "팀 신규 활성",       unit: "건",  current: 6,             target: 8,             achievementPct: 75 },
  { code: "TEAM_WIN",     label: "Win율",              unit: "%",   current: 32,            target: 35,            achievementPct: 91 },
  { code: "BRIEF_RATE",   label: "BRIEF 제출률",       unit: "%",   current: 80,            target: 90,            achievementPct: 89 },
];

export const MOCK_KPI_CEO: KpiCard[] = [
  { code: "REVENUE",   label: "회사 매출 (Q2)",     unit: "KRW", current: 9_800_000_000, target: 12_600_000_000, achievementPct: 78, yoyDelta: 32 },
  { code: "GP",        label: "회사 GP (Q2)",       unit: "KRW", current: 1_420_000_000, target: 2_000_000_000,  achievementPct: 71 },
  { code: "GP_RATE",   label: "GP율",               unit: "%",   current: 14.5,          target: 16,             achievementPct: 91 },
  { code: "NEW",       label: "신규 활성 (Q2)",     unit: "건",  current: 23,            target: 30,             achievementPct: 76 },
  { code: "API_LIVE",  label: "API 라이브 (누적)", unit: "건",  current: 19,            target: 22,             achievementPct: 86 },
];

export const MOCK_CRITICAL_6: Critical6Item[] = [
  { title: "ABC Travel 견적서 v3 발송", linkedDealId: "deal-1", linkedDealName: "ABC Travel Q4 객실 공급", by: "5/9 EOD", done: true },
  { title: "JKL Travel 첫 미팅 잡기",   linkedDealId: "deal-2", linkedDealName: "JKL 분기 거래 가능성", by: "5/8", done: true },
  { title: "Q3 시즌 패키지 워킹세션",   by: "5/10", done: true },
  { title: "DMC Vietnam Renewal 협의", linkedDealId: "deal-4", linkedDealName: "LMN 부산 시즌 패키지", by: "5/9", done: true },
  { title: "API 통합팀 정례 동기화",    by: "5/7", done: true },
  { title: "주간보고 + 1on1",            by: "5/10 EOD", done: false },
];

export const MOCK_OBJECTIVES: Objective[] = [
  {
    id: "obj-co-1",
    title: "핵심 5개국에서 거래액 +35%, GP율 16%",
    ownerKind: "COMPANY",
    ownerName: "Demo Hotel B2B Co.",
    periodLabel: "2026 / YEAR",
    progressPct: 56,
    keyResults: [
      { id: "kr-1", title: "연간 거래액 ₩42B → ₩57B", metricKind: "CURRENCY", targetValue: 57_000_000_000, currentValue: 31_000_000_000, unit: "KRW", progressPct: 54 },
      { id: "kr-2", title: "연간 GP ₩6.2B → ₩9.1B", metricKind: "CURRENCY", targetValue: 9_100_000_000, currentValue: 4_300_000_000, unit: "KRW", progressPct: 47 },
      { id: "kr-3", title: "핵심 5개국 매출 비중 70%+", metricKind: "PERCENT", targetValue: 70, currentValue: 68, unit: "%", progressPct: 97 },
      { id: "kr-4", title: "연간 GP율 16%+", metricKind: "PERCENT", targetValue: 16, currentValue: 14.5, unit: "%", progressPct: 91 },
    ],
  },
  {
    id: "obj-team-1",
    title: "Korea OTA 4사 거래액 두 자릿수 성장",
    ownerKind: "TEAM",
    ownerName: "Korea Sales Team",
    periodLabel: "2026 / Q2",
    progressPct: 72,
    keyResults: [
      { id: "kr-5", title: "한국 분기 거래액 ₩3.1B → ₩3.8B", metricKind: "CURRENCY", targetValue: 3_800_000_000, currentValue: 2_900_000_000, unit: "KRW", progressPct: 76 },
      { id: "kr-6", title: "KEY 4사 거래액 ₩2.6B+", metricKind: "CURRENCY", targetValue: 2_600_000_000, currentValue: 1_900_000_000, unit: "KRW", progressPct: 73 },
      { id: "kr-7", title: "Proposal → Won 35%+", metricKind: "PERCENT", targetValue: 35, currentValue: 32, unit: "%", progressPct: 91 },
    ],
  },
  {
    id: "obj-user-1",
    title: "4대 핵심 고객사 분기 거래액 +30%",
    ownerKind: "USER",
    ownerName: "김민수",
    periodLabel: "2026 / Q2",
    progressPct: 88,
    keyResults: [
      { id: "kr-8", title: "4대 고객사 거래액 ₩1.2B → ₩1.56B", metricKind: "CURRENCY", targetValue: 1_560_000_000, currentValue: 1_400_000_000, unit: "KRW", progressPct: 90 },
      { id: "kr-9", title: "신규 KEY 후보 1곳 Contracting 진입", metricKind: "BOOLEAN", targetValue: 1, currentValue: 0, progressPct: 0 },
      { id: "kr-10", title: "결정권자 미팅 8회+", metricKind: "NUMBER", targetValue: 8, currentValue: 6, progressPct: 75 },
      { id: "kr-11", title: "Proposal → Won 40%+", metricKind: "PERCENT", targetValue: 40, currentValue: 45, unit: "%", progressPct: 113 },
    ],
  },
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { userId: "u-1", name: "김민수", role: "Manager",
    revenueAchievementPct: 132, gpAchievementPct: 133, meetings: 38, proposals: 14,
    winRate: 45, briefRate: 100, critical6Done: 5, critical6Total: 6, pacing: "ok",
    alerts: [] },
  { userId: "u-2", name: "박지영", role: "Manager",
    revenueAchievementPct: 62, gpAchievementPct: 58, meetings: 22, proposals: 9,
    winRate: 28, briefRate: 50, critical6Done: 2, critical6Total: 6, pacing: "bad",
    alerts: ["막힌 딜 2건 (XYZ DMC, JKL Travel)", "1on1 4주 누락"] },
  { userId: "u-3", name: "이영준", role: "Manager",
    revenueAchievementPct: 88, gpAchievementPct: 91, meetings: 30, proposals: 12,
    winRate: 40, briefRate: 90, critical6Done: 4, critical6Total: 6, pacing: "ok",
    alerts: [] },
  { userId: "u-4", name: "최지훈", role: "Manager",
    revenueAchievementPct: 95, gpAchievementPct: 88, meetings: 28, proposals: 11,
    winRate: 38, briefRate: 80, critical6Done: 4, critical6Total: 6, pacing: "ok",
    alerts: [] },
  { userId: "u-5", name: "하나", role: "Manager",
    revenueAchievementPct: 78, gpAchievementPct: 80, meetings: 26, proposals: 10,
    winRate: 33, briefRate: 70, critical6Done: 3, critical6Total: 6, pacing: "warn",
    alerts: ["1건 정체 딜"] },
];
