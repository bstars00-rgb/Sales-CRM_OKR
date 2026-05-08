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
  d("deal-1", "ABC Travel Q4 객실 공급",     "acc-001", "ABC Travel Holdings",  "HOTEL_SUPPLY",     "OPEN",
    120_000_000, 18_000_000, 75, dayOffset(45), "stg-6", "Negotiation", 6, 8, "VN", "KEY_ACCOUNT",
    [{ title: "응웬 사장 가격 망설임", severity: "MID" }]),
  d("deal-2", "JKL 분기 거래 가능성",        "acc-005", "JKL Travel Korea",     "NEW",              "OPEN",
    80_000_000, 12_000_000, 45, dayOffset(60), "stg-4", "Meeting Done", 4, 1, "KR", "NEW_PROSPECT"),
  d("deal-3", "XYZ DMC 일본 패키지",         "acc-002", "XYZ DMC Japan",        "HOTEL_SUPPLY",     "OPEN",
    60_000_000, 9_000_000, 60, dayOffset(40), "stg-5", "Proposal Sent", 5, 18, "JP", "GROWTH",
    [{ title: "결제 조건 이슈", severity: "HIGH" }]),
  d("deal-4", "LMN 부산 시즌 패키지",        "acc-006", "LMN DMC Vietnam",      "HOTEL_SUPPLY",     "OPEN",
    45_000_000, 6_750_000, 85, dayOffset(20), "stg-7", "Contracting", 7, 5, "VN", "KEY_ACCOUNT"),
  d("deal-5", "OPQ Wholesale 5월 단발",      "acc-008", "OPQ Wholesale Indonesia","NEW",            "OPEN",
    35_000_000, 5_250_000, 20, dayOffset(35), "stg-2", "Contacted", 2, 14, "ID", "GROWTH",
    [{ title: "단계 평균 초과 — 14일 정체", severity: "MID" }]),
  d("deal-6", "Hanoi Skies API 연동",        "acc-004", "Hanoi Skies",          "API_INTEGRATION",  "OPEN",
    150_000_000, 22_500_000, 30, dayOffset(70), "stg-3", "Meeting Scheduled", 3, 2, "VN", "GROWTH"),
  d("deal-7", "ABC Travel API 라이브",       "acc-001", "ABC Travel Holdings",  "API_INTEGRATION",  "OPEN",
    150_000_000, 22_500_000, 95, dayOffset(15), "stg-8", "API / Integration", 8, 22, "VN", "KEY_ACCOUNT",
    [{ title: "ABC측 IT 답신 지연", severity: "MID" }]),
  d("deal-8", "ABC Travel 2024 H2 객실",     "acc-001", "ABC Travel Holdings",  "HOTEL_SUPPLY",     "WON",
    98_000_000, 14_700_000, 100, dayOffset(-10), "stg-9", "Won", 9, 0, "VN", "KEY_ACCOUNT"),
  d("deal-9", "LMN 부산 패키지 v1",          "acc-006", "LMN DMC Vietnam",      "HOTEL_SUPPLY",     "WON",
    44_000_000, 6_600_000, 100, dayOffset(-7), "stg-9", "Won", 9, 0, "VN", "KEY_ACCOUNT"),
  d("deal-10", "XYZ 5월 단발",               "acc-002", "XYZ DMC Japan",        "NEW",              "LOST",
    28_000_000, 4_200_000, 0, dayOffset(-3), "stg-10", "Lost", 10, 0, "JP", "GROWTH"),
];

function d(
  id: string, name: string, accountId: string, accountName: string,
  dealType: Deal["dealType"], outcome: Deal["outcome"],
  amount: number, expectedGp: number, probabilityPct: number, expectedCloseDate: string,
  stageId: string, stageName: string, stageOrder: number, daysInStage: number,
  countryCode: string, grade: Deal["grade"],
  blockers?: Deal["blockers"]
): Deal {
  return {
    id, name, accountId, accountName, ownerUserId: "user-mock-1", ownerName: "김민수",
    dealType, outcome, amount, expectedGp, currency: "KRW", probabilityPct, expectedCloseDate,
    stageId, stageName, stageOrder, daysInStage, countryCode, grade, blockers,
  };
}

function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
