import type { Deal, PipelineStage } from "./types";

export const MOCK_STAGES: PipelineStage[] = [
  { id: "stg-1",  name: "New Lead",          orderNo: 1,  stageKind: "OPEN", probabilityDefault: 10 },
  { id: "stg-2",  name: "Contacted",         orderNo: 2,  stageKind: "OPEN", probabilityDefault: 20 },
  { id: "stg-3",  name: "Meeting Scheduled", orderNo: 3,  stageKind: "OPEN", probabilityDefault: 30 },
  { id: "stg-4",  name: "Meeting Done",      orderNo: 4,  stageKind: "OPEN", probabilityDefault: 45 },
  { id: "stg-5",  name: "Proposal Sent",     orderNo: 5,  stageKind: "OPEN", probabilityDefault: 60 },
  { id: "stg-6",  name: "Negotiation",       orderNo: 6,  stageKind: "OPEN", probabilityDefault: 75 },
  { id: "stg-7",  name: "Contracting",       orderNo: 7,  stageKind: "OPEN", probabilityDefault: 85 },
  { id: "stg-8",  name: "API / Integration", orderNo: 8,  stageKind: "OPEN", probabilityDefault: 95 },
  { id: "stg-9",  name: "Won",               orderNo: 9,  stageKind: "WON",  probabilityDefault: 100 },
  { id: "stg-10", name: "Lost",              orderNo: 10, stageKind: "LOST", probabilityDefault: 0 },
];

export const MOCK_DEALS: Deal[] = [
  // ── OPEN: 단계별 고른 분포 ─────────────────
  // New Lead (3)
  d("deal-21", "Mayflower 신규 거래 발굴",       "acc-021", "Mayflower Acme Tours", "user-tan",   "Tan Wei Liang",     "NEW",            "OPEN",
    60_000_000, 9_000_000, 10, +75, "stg-1", "New Lead", 1, 3, "MY", "NEW_PROSPECT"),
  d("deal-22", "Rajah Travel 첫 패키지",          "acc-019", "Rajah Travel",         "user-tan",   "Tan Wei Liang",     "NEW",            "OPEN",
    28_000_000, 4_200_000, 10, +90, "stg-1", "New Lead", 1, 5, "PH", "NEW_PROSPECT"),
  d("deal-23", "Lvmama 재활성 시도",              "acc-022", "Lvmama",               "user-zhang", "Zhang Wei",         "RENEWAL",        "OPEN",
    18_000_000, 2_700_000, 10, +60, "stg-1", "New Lead", 1, 12, "CN", "LOW_POTENTIAL"),

  // Contacted (3)
  d("deal-5",  "OPQ Wholesale 5월 단발",          "acc-008", "OPQ Wholesale",        "user-mock-1","김민수",            "NEW",            "OPEN",
    35_000_000, 5_250_000, 20, +35, "stg-2", "Contacted", 2, 14, "ID", "GROWTH",
    [{ title: "단계 평균 초과 — 14일 정체", severity: "MID" }]),
  d("deal-24", "Panorama JTB 발리 패키지",        "acc-017", "Panorama JTB",         "user-somchai","솜차이",           "HOTEL_SUPPLY",   "OPEN",
    48_000_000, 7_200_000, 20, +45, "stg-2", "Contacted", 2, 4, "ID", "GROWTH"),
  d("deal-25", "Chan Brothers 동남아 묶음",       "acc-018", "Chan Brothers",        "user-tan",   "Tan Wei Liang",     "HOTEL_SUPPLY",   "OPEN",
    72_000_000, 10_800_000, 20, +50, "stg-2", "Contacted", 2, 6, "SG", "GROWTH"),

  // Meeting Scheduled (2)
  d("deal-6",  "Hanoi Skies API 연동",            "acc-004", "Hanoi Skies",          "user-mock-1","김민수",            "API_INTEGRATION","OPEN",
    150_000_000, 22_500_000, 30, +70, "stg-3", "Meeting Scheduled", 3, 2, "VN", "GROWTH"),
  d("deal-26", "JTB 분기 호텔 공급",              "acc-011", "JTB Travel",           "user-nakamura","나카무라 켄지",     "HOTEL_SUPPLY",   "OPEN",
    240_000_000, 33_600_000, 30, +55, "stg-3", "Meeting Scheduled", 3, 1, "JP", "KEY_ACCOUNT"),

  // Meeting Done (3)
  d("deal-2",  "JKL 분기 거래 가능성",            "acc-005", "JKL Travel Korea",     "user-mock-1","김민수",            "NEW",            "OPEN",
    80_000_000, 12_000_000, 45, +60, "stg-4", "Meeting Done", 4, 1, "KR", "NEW_PROSPECT"),
  d("deal-27", "HIS H2 패키지",                   "acc-012", "HIS Holdings",         "user-nakamura","나카무라 켄지",     "HOTEL_SUPPLY",   "OPEN",
    180_000_000, 27_000_000, 45, +75, "stg-4", "Meeting Done", 4, 5, "JP", "GROWTH"),
  d("deal-28", "Mode Tour 분기 갱신",             "acc-014", "Mode Tour Network",    "user-park",  "박지영",            "RENEWAL",        "OPEN",
    145_000_000, 21_700_000, 50, +30, "stg-4", "Meeting Done", 4, 8, "KR", "GROWTH"),

  // Proposal Sent (4)
  d("deal-3",  "XYZ DMC 일본 패키지",             "acc-002", "XYZ DMC Japan",        "user-mock-1","김민수",            "HOTEL_SUPPLY",   "OPEN",
    60_000_000, 9_000_000, 60, +40, "stg-5", "Proposal Sent", 5, 18, "JP", "GROWTH",
    [{ title: "결제 조건 이슈", severity: "HIGH" }]),
  d("deal-29", "Vietravel 견적 v2",               "acc-010", "Vietravel",            "user-mock-1","김민수",            "NEW",            "OPEN",
    95_000_000, 14_250_000, 60, +35, "stg-5", "Proposal Sent", 5, 9, "VN", "GROWTH"),
  d("deal-30", "Lion Travel H2 갱신",             "acc-020", "Lion Travel",          "user-tan",   "Tan Wei Liang",     "RENEWAL",        "OPEN",
    95_000_000, 14_250_000, 60, +50, "stg-5", "Proposal Sent", 5, 11, "TW", "GROWTH"),
  d("deal-31", "Asian Trails 인보이스 분쟁",      "acc-016", "Asian Trails",         "user-somchai","솜차이",           "RENEWAL",        "OPEN",
    180_000_000, 25_200_000, 65, +20, "stg-5", "Proposal Sent", 5, 13, "TH", "KEY_ACCOUNT",
    [{ title: "6월 인보이스 검토 지연", severity: "MID" }]),

  // Negotiation (3)
  d("deal-1",  "ABC Travel Q4 객실 공급",         "acc-001", "ABC Travel",           "user-mock-1","김민수",            "HOTEL_SUPPLY",   "OPEN",
    120_000_000, 18_000_000, 75, +45, "stg-6", "Negotiation", 6, 8, "VN", "KEY_ACCOUNT",
    [{ title: "응웬 사장 가격 망설임", severity: "MID" }]),
  d("deal-32", "Hana Tour 분기 패키지",           "acc-013", "Hana Tour",            "user-park",  "박지영",            "RENEWAL",        "OPEN",
    240_000_000, 33_600_000, 80, +25, "stg-6", "Negotiation", 6, 6, "KR", "KEY_ACCOUNT"),
  d("deal-33", "Saigontourist 정산 보조",         "acc-009", "Saigontourist",        "user-linh",  "Linh Tran",         "UPSELL",         "OPEN",
    140_000_000, 19_600_000, 75, +35, "stg-6", "Negotiation", 6, 10, "VN", "KEY_ACCOUNT"),

  // Contracting (2)
  d("deal-4",  "LMN 부산 시즌 패키지",            "acc-006", "LMN DMC Vietnam",      "user-linh",  "Linh Tran",         "HOTEL_SUPPLY",   "OPEN",
    45_000_000, 6_750_000, 85, +20, "stg-7", "Contracting", 7, 5, "VN", "KEY_ACCOUNT"),
  d("deal-34", "여기어때 API 라이브",             "acc-015", "Yeogi Eottae",         "user-mock-1","김민수",            "API_INTEGRATION","OPEN",
    200_000_000, 30_000_000, 90, +15, "stg-7", "Contracting", 7, 4, "KR", "GROWTH"),

  // API / Integration (1)
  d("deal-7",  "ABC Travel API 라이브",           "acc-001", "ABC Travel",           "user-mock-1","김민수",            "API_INTEGRATION","OPEN",
    150_000_000, 22_500_000, 95, +15, "stg-8", "API / Integration", 8, 22, "VN", "KEY_ACCOUNT",
    [{ title: "ABC측 IT 답신 지연", severity: "MID" }]),

  // ── WON (5) — 최근 30일
  d("deal-8",  "ABC Travel 2024 H2 객실",         "acc-001", "ABC Travel",           "user-mock-1","김민수",            "HOTEL_SUPPLY",   "WON",
    98_000_000, 14_700_000, 100, -10, "stg-9", "Won", 9, 0, "VN", "KEY_ACCOUNT"),
  d("deal-9",  "LMN 부산 패키지 v1",              "acc-006", "LMN DMC Vietnam",      "user-linh",  "Linh Tran",         "HOTEL_SUPPLY",   "WON",
    44_000_000, 6_600_000, 100, -7, "stg-9", "Won", 9, 0, "VN", "KEY_ACCOUNT"),
  d("deal-35", "JTB 5월 단발 패키지",             "acc-011", "JTB Travel",           "user-nakamura","나카무라 켄지",     "HOTEL_SUPPLY",   "WON",
    168_000_000, 23_500_000, 100, -3, "stg-9", "Won", 9, 0, "JP", "KEY_ACCOUNT"),
  d("deal-36", "Hana Tour 5월 추가 발주",         "acc-013", "Hana Tour",            "user-park",  "박지영",            "UPSELL",         "WON",
    62_000_000, 8_700_000, 100, -15, "stg-9", "Won", 9, 0, "KR", "KEY_ACCOUNT"),
  d("deal-37", "Asian Trails 분기 정기",          "acc-016", "Asian Trails",         "user-somchai","솜차이",           "RENEWAL",        "WON",
    156_000_000, 22_400_000, 100, -22, "stg-9", "Won", 9, 0, "TH", "KEY_ACCOUNT"),

  // ── LOST (3)
  d("deal-10", "XYZ 5월 단발",                    "acc-002", "XYZ DMC Japan",        "user-mock-1","김민수",            "NEW",            "LOST",
    28_000_000, 4_200_000, 0, -3, "stg-10", "Lost", 10, 0, "JP", "GROWTH"),
  d("deal-38", "LMN 패키지 v1 (실패)",            "acc-006", "LMN DMC Vietnam",      "user-linh",  "Linh Tran",         "HOTEL_SUPPLY",   "LOST",
    20_000_000, 3_000_000, 0, -12, "stg-10", "Lost", 10, 0, "VN", "KEY_ACCOUNT"),
  d("deal-39", "Tokyo Bridge 재진입 시도",        "acc-007", "Tokyo Bridge Hotel",   "user-nakamura","나카무라 켄지",     "RENEWAL",        "LOST",
    72_000_000, 10_800_000, 0, -25, "stg-10", "Lost", 10, 0, "JP", "KEY_ACCOUNT"),
];

function d(
  id: string, name: string, accountId: string, accountName: string,
  ownerUserId: string, ownerName: string,
  dealType: Deal["dealType"], outcome: Deal["outcome"],
  amount: number, expectedGp: number, probabilityPct: number, daysOffsetClose: number,
  stageId: string, stageName: string, stageOrder: number, daysInStage: number,
  countryCode: string, grade: Deal["grade"],
  blockers?: Deal["blockers"]
): Deal {
  const closeDate = new Date();
  closeDate.setDate(closeDate.getDate() + daysOffsetClose);
  return {
    id, name, accountId, accountName, ownerUserId, ownerName,
    dealType, outcome, amount, expectedGp, currency: "KRW", probabilityPct,
    expectedCloseDate: closeDate.toISOString().split("T")[0],
    stageId, stageName, stageOrder, daysInStage, countryCode, grade, blockers,
  };
}
