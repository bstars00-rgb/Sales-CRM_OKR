/**
 * 계약 정보 (mock) — Account별 현재 계약 만료일 + 자동 갱신 여부
 *
 * ELLIS에 정식 entity가 없으므로 별도 mock으로 관리.
 * 만료일은 today(2026-05-18) 기준으로 30/60/90/180일 이내 분포되도록 결정론적 설정.
 */

export interface Contract {
  accountId: string;
  contractStartDate: string; // YYYY-MM-DD
  contractEndDate: string;   // YYYY-MM-DD
  autoRenew: boolean;
  annualValue: number;       // KRW
  notes?: string;
}

// 결정론적 mock — Account ID 기준 만료일 분배
// today (2026-05-18) 기준으로 D+15, D+45, D+75, D+150, D+250 등 분포
export const MOCK_CONTRACTS: Contract[] = [
  { accountId: "acc-001", contractStartDate: "2025-06-01", contractEndDate: "2026-05-31", autoRenew: true,  annualValue: 240_000_000 },
  { accountId: "acc-002", contractStartDate: "2025-07-01", contractEndDate: "2026-06-30", autoRenew: false, annualValue: 180_000_000, notes: "결제 조건 재협상 필요" },
  { accountId: "acc-003", contractStartDate: "2024-08-01", contractEndDate: "2026-07-31", autoRenew: true,  annualValue: 540_000_000 },
  { accountId: "acc-004", contractStartDate: "2025-09-01", contractEndDate: "2026-08-31", autoRenew: false, annualValue: 320_000_000 },
  { accountId: "acc-005", contractStartDate: "2024-11-01", contractEndDate: "2026-10-31", autoRenew: true,  annualValue: 460_000_000 },
  { accountId: "acc-006", contractStartDate: "2025-12-01", contractEndDate: "2026-11-30", autoRenew: true,  annualValue: 380_000_000 },
  { accountId: "acc-007", contractStartDate: "2024-05-01", contractEndDate: "2026-12-31", autoRenew: false, annualValue: 720_000_000, notes: "KEY: 본사 임원 직접 컨택" },
  { accountId: "acc-008", contractStartDate: "2025-08-01", contractEndDate: "2026-07-31", autoRenew: false, annualValue: 140_000_000 },
  { accountId: "acc-009", contractStartDate: "2025-10-01", contractEndDate: "2026-09-30", autoRenew: true,  annualValue: 220_000_000 },
  { accountId: "acc-010", contractStartDate: "2024-12-01", contractEndDate: "2026-06-15", autoRenew: false, annualValue: 380_000_000, notes: "베트남 법인 변경 확인" },
  { accountId: "acc-011", contractStartDate: "2024-04-01", contractEndDate: "2026-05-25", autoRenew: false, annualValue: 850_000_000, notes: "KEY: 일본 본사 의사결정 필요 🔴" },
  { accountId: "acc-012", contractStartDate: "2025-03-01", contractEndDate: "2027-02-28", autoRenew: true,  annualValue: 620_000_000 },
  { accountId: "acc-013", contractStartDate: "2025-05-01", contractEndDate: "2027-04-30", autoRenew: true,  annualValue: 480_000_000 },
  { accountId: "acc-014", contractStartDate: "2024-09-01", contractEndDate: "2026-08-31", autoRenew: false, annualValue: 290_000_000 },
  { accountId: "acc-015", contractStartDate: "2025-01-01", contractEndDate: "2026-12-31", autoRenew: true,  annualValue: 340_000_000 },
  { accountId: "acc-016", contractStartDate: "2024-06-01", contractEndDate: "2026-05-31", autoRenew: false, annualValue: 580_000_000, notes: "KEY: 6월 인보이스 분쟁 영향" },
  { accountId: "acc-017", contractStartDate: "2025-04-01", contractEndDate: "2027-03-31", autoRenew: true,  annualValue: 410_000_000 },
  { accountId: "acc-018", contractStartDate: "2025-02-01", contractEndDate: "2027-01-31", autoRenew: true,  annualValue: 260_000_000 },
];

export type RenewalUrgency = "CRITICAL" | "HIGH" | "MID" | "LOW";

export function getDaysUntilExpiry(contractEndDate: string, today = new Date()): number {
  const end = new Date(contractEndDate);
  const diff = end.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getRenewalUrgency(daysLeft: number): RenewalUrgency {
  if (daysLeft <= 30) return "CRITICAL";
  if (daysLeft <= 60) return "HIGH";
  if (daysLeft <= 90) return "MID";
  return "LOW";
}

export const URGENCY_BADGE: Record<RenewalUrgency, { label: string; tone: "destructive" | "warning" | "default" | "muted"; emoji: string }> = {
  CRITICAL: { label: "긴급 (≤30일)", tone: "destructive", emoji: "🔴" },
  HIGH:     { label: "임박 (≤60일)", tone: "warning",     emoji: "🟠" },
  MID:      { label: "주의 (≤90일)", tone: "default",     emoji: "🟡" },
  LOW:      { label: "여유 (>90일)", tone: "muted",       emoji: "🟢" },
};
