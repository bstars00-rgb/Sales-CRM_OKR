import type { KpiCard, Critical6Item, Objective, TeamMember } from "./types";

// ============================================================
// 매니저용 KPI (개인 Q2)
// ============================================================
export const MOCK_KPI_MANAGER: KpiCard[] = [
  { code: "REVENUE",      label: "내 매출 (Q2)",        unit: "KRW", current: 396_000_000, target: 300_000_000, achievementPct: 132, yoyDelta: 35 },
  { code: "GP",           label: "내 GP (Q2)",          unit: "KRW", current: 60_000_000,  target: 45_000_000,  achievementPct: 133 },
  { code: "INCENTIVE",    label: "인센티브 미리보기",  unit: "KRW", current: 9_800_000,   target: 0,           achievementPct: 0 },
  { code: "NEW_ACCOUNTS", label: "신규 활성 (Q2)",     unit: "건",  current: 5,           target: 4,           achievementPct: 125 },
  { code: "MEETINGS",     label: "미팅 (Q2)",           unit: "건",  current: 38,          target: 30,          achievementPct: 127 },
  { code: "WIN_RATE",     label: "Win율 (Q2)",          unit: "%",   current: 45,          target: 40,          achievementPct: 113 },
];

// ============================================================
// 팀리더용 KPI
// ============================================================
export const MOCK_KPI_LEAD: KpiCard[] = [
  { code: "TEAM_REVENUE", label: "팀 매출 (Q2)",        unit: "KRW", current: 1_960_000_000, target: 2_400_000_000, achievementPct: 82 },
  { code: "TEAM_GP",      label: "팀 GP (Q2)",          unit: "KRW", current: 290_000_000,   target: 360_000_000,   achievementPct: 81 },
  { code: "TEAM_NEW",     label: "팀 신규 활성",        unit: "건",  current: 11,            target: 14,            achievementPct: 79 },
  { code: "TEAM_WIN",     label: "Win율",               unit: "%",   current: 36,            target: 40,            achievementPct: 90 },
  { code: "BRIEF_RATE",   label: "BRIEF 제출률",        unit: "%",   current: 82,            target: 90,            achievementPct: 91 },
];

// ============================================================
// CEO 대시보드용 KPI
// ============================================================
export const MOCK_KPI_CEO: KpiCard[] = [
  { code: "REVENUE",   label: "회사 매출 (Q2)",      unit: "KRW", current: 12_400_000_000, target: 15_800_000_000, achievementPct: 78, yoyDelta: 32 },
  { code: "GP",        label: "회사 GP (Q2)",        unit: "KRW", current: 1_780_000_000,  target: 2_500_000_000,  achievementPct: 71 },
  { code: "GP_RATE",   label: "GP율",                unit: "%",   current: 14.3,           target: 16,             achievementPct: 89 },
  { code: "NEW",       label: "신규 활성 (Q2)",      unit: "건",  current: 28,             target: 36,             achievementPct: 78 },
  { code: "API_LIVE",  label: "API 라이브 (누적)",  unit: "건",  current: 21,             target: 24,             achievementPct: 88 },
];

// ============================================================
// Critical 6 (이번 주)
// ============================================================
export const MOCK_CRITICAL_6: Critical6Item[] = [
  { title: "ABC Travel 견적서 v3 발송",  linkedDealId: "deal-1",  linkedDealName: "ABC Travel Q4 객실 공급", by: "5/9 EOD", done: true },
  { title: "JKL Travel 첫 미팅 잡기",    linkedDealId: "deal-2",  linkedDealName: "JKL 분기 거래 가능성",     by: "5/8",     done: true },
  { title: "Q3 시즌 패키지 워킹세션",                                                                          by: "5/10",    done: true },
  { title: "여기어때 API 일정 협의",     linkedDealId: "deal-34", linkedDealName: "여기어때 API 라이브",       by: "5/12",    done: true },
  { title: "API 통합팀 정례 동기화",                                                                            by: "5/7",     done: true },
  { title: "주간보고 + 1on1",                                                                                    by: "5/10 EOD",done: false },
];

// ============================================================
// OKR — 회사 / 팀 / 개인 (9개)
// ============================================================
export const MOCK_OBJECTIVES: Objective[] = [
  // 회사 (2)
  {
    id: "obj-co-1", title: "핵심 5개국에서 거래액 +35%, GP율 16%",
    ownerKind: "COMPANY", ownerName: "Demo Hotel B2B Co.",
    periodLabel: "2026 / YEAR", progressPct: 56,
    keyResults: [
      { id: "kr-1", title: "연간 거래액 ₩42B → ₩57B",            metricKind: "CURRENCY", targetValue: 57_000_000_000, currentValue: 31_000_000_000, unit: "KRW", progressPct: 54 },
      { id: "kr-2", title: "연간 GP ₩6.2B → ₩9.1B",              metricKind: "CURRENCY", targetValue: 9_100_000_000,  currentValue: 4_300_000_000,  unit: "KRW", progressPct: 47 },
      { id: "kr-3", title: "핵심 5개국 매출 비중 70%+",            metricKind: "PERCENT",  targetValue: 70,             currentValue: 68,             unit: "%",   progressPct: 97 },
      { id: "kr-4", title: "연간 GP율 16%+",                       metricKind: "PERCENT",  targetValue: 16,             currentValue: 14.5,           unit: "%",   progressPct: 91 },
    ],
  },
  {
    id: "obj-co-2", title: "API 연동 고객사 확장으로 디지털 매출 비중 50% 달성",
    ownerKind: "COMPANY", ownerName: "Demo Hotel B2B Co.",
    periodLabel: "2026 / YEAR", progressPct: 62,
    keyResults: [
      { id: "kr-5", title: "API 연동 라이브 24개 (현재 19)",       metricKind: "NUMBER",  targetValue: 24, currentValue: 21,  progressPct: 88 },
      { id: "kr-6", title: "API 매출 비중 40%+ (현재 28%)",        metricKind: "PERCENT", targetValue: 40, currentValue: 34,  unit: "%", progressPct: 85 },
      { id: "kr-7", title: "신규 API 파트너 8개 발굴",              metricKind: "NUMBER",  targetValue: 8,  currentValue: 3,   progressPct: 38 },
    ],
  },

  // 팀 (3)
  {
    id: "obj-team-kr", title: "Korea OTA 4사 거래액 두 자릿수 성장",
    ownerKind: "TEAM", ownerName: "Korea Sales Team",
    periodLabel: "2026 / Q2", progressPct: 72,
    keyResults: [
      { id: "kr-8",  title: "한국 분기 거래액 ₩3.1B → ₩3.8B",      metricKind: "CURRENCY", targetValue: 3_800_000_000, currentValue: 2_900_000_000, unit: "KRW", progressPct: 76 },
      { id: "kr-9",  title: "KEY 4사 거래액 ₩2.6B+",                metricKind: "CURRENCY", targetValue: 2_600_000_000, currentValue: 1_900_000_000, unit: "KRW", progressPct: 73 },
      { id: "kr-10", title: "Proposal → Won 35%+",                  metricKind: "PERCENT",  targetValue: 35,            currentValue: 32,            unit: "%",   progressPct: 91 },
    ],
  },
  {
    id: "obj-team-vn", title: "베트남 시장 KEY 고객사 풀 두 배",
    ownerKind: "TEAM", ownerName: "Vietnam Sales Team",
    periodLabel: "2026 / Q2", progressPct: 68,
    keyResults: [
      { id: "kr-11", title: "신규 KEY/GROWTH 고객사 8개 (현재 4)",  metricKind: "NUMBER",   targetValue: 8,             currentValue: 6,             progressPct: 75 },
      { id: "kr-12", title: "VN 분기 거래액 ₩1.6B → ₩2.2B",        metricKind: "CURRENCY", targetValue: 2_200_000_000, currentValue: 1_480_000_000, unit: "KRW", progressPct: 67 },
      { id: "kr-13", title: "결정권자 미팅 18회+",                  metricKind: "NUMBER",   targetValue: 18,            currentValue: 11,            progressPct: 61 },
    ],
  },
  {
    id: "obj-team-jp", title: "일본 시장 회복 + JTB·HIS 거래 확대",
    ownerKind: "TEAM", ownerName: "Japan Sales Team",
    periodLabel: "2026 / Q2", progressPct: 55,
    keyResults: [
      { id: "kr-14", title: "일본 분기 매출 ₩2.4B → ₩2.8B",        metricKind: "CURRENCY", targetValue: 2_800_000_000, currentValue: 1_540_000_000, unit: "KRW", progressPct: 55 },
      { id: "kr-15", title: "Tokyo Bridge 재활성 또는 정리",       metricKind: "BOOLEAN",  targetValue: 1,             currentValue: 0,             progressPct: 0 },
      { id: "kr-16", title: "JTB·HIS 분기 GP 합산 ₩90M+",          metricKind: "CURRENCY", targetValue: 90_000_000,    currentValue: 64_000_000,    unit: "KRW", progressPct: 71 },
    ],
  },

  // 개인 (4)
  {
    id: "obj-user-km", title: "4대 핵심 고객사 분기 거래액 +30%",
    ownerKind: "USER", ownerName: "김민수",
    periodLabel: "2026 / Q2", progressPct: 88,
    keyResults: [
      { id: "kr-17", title: "4대 고객사 거래액 ₩1.2B → ₩1.56B",    metricKind: "CURRENCY", targetValue: 1_560_000_000, currentValue: 1_400_000_000, unit: "KRW", progressPct: 90 },
      { id: "kr-18", title: "신규 KEY 후보 1곳 Contracting 진입",  metricKind: "BOOLEAN",  targetValue: 1,             currentValue: 0,             progressPct: 0 },
      { id: "kr-19", title: "결정권자 미팅 8회+",                  metricKind: "NUMBER",   targetValue: 8,             currentValue: 6,             progressPct: 75 },
      { id: "kr-20", title: "Proposal → Won 40%+",                 metricKind: "PERCENT",  targetValue: 40,            currentValue: 45,            unit: "%",   progressPct: 113 },
    ],
  },
  {
    id: "obj-user-park", title: "Hana Tour·Mode Tour 갱신 + 단가 인상",
    ownerKind: "USER", ownerName: "박지영",
    periodLabel: "2026 / Q2", progressPct: 62,
    keyResults: [
      { id: "kr-21", title: "두 고객사 갱신 계약 완료",            metricKind: "NUMBER",   targetValue: 2,             currentValue: 1,             progressPct: 50 },
      { id: "kr-22", title: "평균 단가 +8%",                       metricKind: "PERCENT",  targetValue: 8,             currentValue: 5,             unit: "%",   progressPct: 63 },
      { id: "kr-23", title: "Q2 GP ₩90M+",                         metricKind: "CURRENCY", targetValue: 90_000_000,    currentValue: 73_000_000,    unit: "KRW", progressPct: 81 },
    ],
  },
  {
    id: "obj-user-linh", title: "베트남 KEY 4사 분기 안정화",
    ownerKind: "USER", ownerName: "Linh Tran",
    periodLabel: "2026 / Q2", progressPct: 74,
    keyResults: [
      { id: "kr-24", title: "ABC·LMN·Saigontourist 분기 매출 ₩1.5B+", metricKind: "CURRENCY", targetValue: 1_500_000_000, currentValue: 1_120_000_000, unit: "KRW", progressPct: 75 },
      { id: "kr-25", title: "위약금·정산 분쟁 0건",                metricKind: "NUMBER",   targetValue: 0,             currentValue: 1,             progressPct: 50 },
    ],
  },
  {
    id: "obj-user-naka", title: "JTB·HIS 가격 협상 + Tokyo Bridge 재진입",
    ownerKind: "USER", ownerName: "나카무라 켄지",
    periodLabel: "2026 / Q2", progressPct: 48,
    keyResults: [
      { id: "kr-26", title: "JTB Q2 GP ₩50M+",                     metricKind: "CURRENCY", targetValue: 50_000_000,    currentValue: 40_500_000,    unit: "KRW", progressPct: 81 },
      { id: "kr-27", title: "HIS H2 패키지 계약",                  metricKind: "BOOLEAN",  targetValue: 1,             currentValue: 0,             progressPct: 0 },
      { id: "kr-28", title: "Tokyo Bridge 재활성 시도 3회",        metricKind: "NUMBER",   targetValue: 3,             currentValue: 2,             progressPct: 67 },
    ],
  },
];

// ============================================================
// 팀원 — 13명 (Korea 5 + Vietnam 3 + Japan 2 + Asia 3)
// ============================================================
export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { userId: "user-mock-1", name: "김민수",   role: "Korea Manager",
    revenueAchievementPct: 132, gpAchievementPct: 133, meetings: 38, proposals: 14,
    winRate: 45, briefRate: 100, critical6Done: 5, critical6Total: 6, pacing: "ok", alerts: [] },
  { userId: "user-park",   name: "박지영",   role: "Korea Manager",
    revenueAchievementPct: 62,  gpAchievementPct: 58,  meetings: 22, proposals: 9,
    winRate: 28, briefRate: 50, critical6Done: 2, critical6Total: 6, pacing: "bad",
    alerts: ["막힌 딜 2건", "1on1 4주 누락"] },
  { userId: "user-lee",    name: "이영준",   role: "API Specialist",
    revenueAchievementPct: 88,  gpAchievementPct: 91,  meetings: 30, proposals: 12,
    winRate: 40, briefRate: 90, critical6Done: 4, critical6Total: 6, pacing: "ok", alerts: [] },
  { userId: "user-choi",   name: "최지훈",   role: "Korea Manager",
    revenueAchievementPct: 95,  gpAchievementPct: 88,  meetings: 28, proposals: 11,
    winRate: 38, briefRate: 80, critical6Done: 4, critical6Total: 6, pacing: "ok", alerts: [] },
  { userId: "user-hana",   name: "하나",     role: "Korea Manager",
    revenueAchievementPct: 78,  gpAchievementPct: 80,  meetings: 26, proposals: 10,
    winRate: 33, briefRate: 70, critical6Done: 3, critical6Total: 6, pacing: "warn",
    alerts: ["1건 정체 딜"] },

  { userId: "user-linh",   name: "Linh Tran","role": "Vietnam Lead",
    revenueAchievementPct: 112, gpAchievementPct: 108, meetings: 32, proposals: 12,
    winRate: 48, briefRate: 95, critical6Done: 5, critical6Total: 6, pacing: "ok", alerts: [] },
  { userId: "user-hung",   name: "Hung Vu",  role: "Vietnam Manager",
    revenueAchievementPct: 84,  gpAchievementPct: 82,  meetings: 20, proposals: 8,
    winRate: 36, briefRate: 85, critical6Done: 4, critical6Total: 6, pacing: "ok", alerts: [] },
  { userId: "user-mai",    name: "Mai Le",   role: "Vietnam Manager",
    revenueAchievementPct: 58,  gpAchievementPct: 54,  meetings: 14, proposals: 5,
    winRate: 24, briefRate: 60, critical6Done: 2, critical6Total: 6, pacing: "bad",
    alerts: ["분기 발굴 미달", "출장 일정 누락"] },

  { userId: "user-nakamura","name":"나카무라 켄지","role":"Japan Lead",
    revenueAchievementPct: 71, gpAchievementPct: 68, meetings: 24, proposals: 9,
    winRate: 30, briefRate: 88, critical6Done: 4, critical6Total: 6, pacing: "warn",
    alerts: ["Tokyo Bridge 결렬 — 분기말 재시도"] },
  { userId: "user-sato",   name: "사토 유키", role: "Japan Manager",
    revenueAchievementPct: 92,  gpAchievementPct: 90,  meetings: 22, proposals: 8,
    winRate: 41, briefRate: 90, critical6Done: 4, critical6Total: 6, pacing: "ok", alerts: [] },

  { userId: "user-somchai","name":"솜차이",   role: "SEA Manager",
    revenueAchievementPct: 105, gpAchievementPct: 102, meetings: 28, proposals: 11,
    winRate: 42, briefRate: 80, critical6Done: 4, critical6Total: 6, pacing: "ok", alerts: [] },
  { userId: "user-tan",    name: "Tan Wei Liang", role: "SEA Manager",
    revenueAchievementPct: 67,  gpAchievementPct: 64,  meetings: 18, proposals: 7,
    winRate: 28, briefRate: 75, critical6Done: 3, critical6Total: 6, pacing: "warn",
    alerts: ["신규 발굴 일정 지연"] },
  { userId: "user-zhang",  name: "Zhang Wei", role: "China Manager",
    revenueAchievementPct: 38,  gpAchievementPct: 35,  meetings: 8,  proposals: 3,
    winRate: 18, briefRate: 50, critical6Done: 1, critical6Total: 6, pacing: "bad",
    alerts: ["중국 시장 침체", "Lvmama 재활성 실패", "1on1 누락"] },
];
