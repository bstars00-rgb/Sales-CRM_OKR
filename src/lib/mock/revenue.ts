import { MOCK_ACCOUNTS } from "./accounts";
import type { Account } from "./types";

export interface MonthlyRevenue {
  yearMonth: string;     // "2025-06"
  monthLabel: string;    // "25-06"
  revenue: number;       // KRW
  gp: number;
  roomNights: number;
  transactions: number;
}

// 결정론적 의사난수 (string seed)
function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function pseudoRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * 호텔 B2B 시즌성 — 7,8월 + 12,1,2월 피크
 */
function seasonalFactor(monthIdx0: number): number {
  // 0=Jan, 6=Jul, ...
  const m = monthIdx0;
  if (m === 6 || m === 7) return 1.45;   // 7-8월 여름 성수기
  if (m === 11 || m === 0 || m === 1) return 1.30; // 12-2월 겨울 성수기
  if (m === 4 || m === 5) return 0.78;   // 5-6월 비수기
  if (m === 3) return 0.85;              // 4월
  return 1.0;
}

/**
 * 24개월치 계정 매출 시계열 — 결정론적(계정 id 시드).
 * - DORMANT 계정은 후반 6개월 감소
 * - 최근 YTD가 0인 계정은 빈 시리즈
 */
export function getAccountMonthlyRevenue(account: Account): MonthlyRevenue[] {
  if (account.totalRevenueYtd === 0) return [];

  const rand = pseudoRandom(hashSeed(account.id));
  const baseMonthly = (account.totalRevenueYtd / 4) * 0.8; // 분기 → 월 추정 (대략)
  const gpRate = account.totalRevenueYtd > 0
    ? account.totalGpYtd / account.totalRevenueYtd
    : 0.15;

  // ADR by segment (Room Night 역산용)
  const adrByCountry: Record<string, number> = {
    KR: 150_000, JP: 180_000, VN: 110_000, TH: 120_000,
    SG: 220_000, TW: 130_000, ID: 130_000, CN: 140_000,
    PH: 100_000, MY: 110_000, HK: 280_000,
  };
  const adr = adrByCountry[account.countryCode] ?? 130_000;

  const result: MonthlyRevenue[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIdx = d.getMonth();
    const monthsAgo = i;

    // 성장 트렌드: 24개월 전 = 70%, 현재 = 110%
    const growth = 0.70 + ((24 - monthsAgo) / 24) * 0.40;

    // DORMANT/LOST 계정은 최근 6개월 감소
    const dormantFactor =
      (account.status === "DORMANT" || account.grade === "DORMANT") && monthsAgo < 6
        ? 0.2
        : 1.0;

    // 시즌성 + 성장 + 노이즈 + dormant
    const noise = 0.78 + rand() * 0.44;
    const revenue = Math.round(
      baseMonthly * seasonalFactor(monthIdx) * growth * noise * dormantFactor
    );

    const roomNights = Math.max(0, Math.round(revenue / adr));
    const transactions = Math.max(0, Math.round(revenue / 350_000));

    result.push({
      yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      monthLabel: `${String(d.getFullYear()).slice(2)}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      revenue,
      gp: Math.round(revenue * gpRate),
      roomNights,
      transactions,
    });
  }

  return result;
}

/**
 * Account YoY 성장률 — 마지막 12개월 vs 직전 12개월 매출 비교.
 */
export function getAccountYoY(account: Account): number {
  const data = getAccountMonthlyRevenue(account);
  if (data.length < 24) return 0;
  const recent12 = data.slice(-12).reduce((s, m) => s + m.revenue, 0);
  const prev12 = data.slice(0, 12).reduce((s, m) => s + m.revenue, 0);
  if (prev12 === 0) return 0;
  return ((recent12 - prev12) / prev12) * 100;
}

/**
 * Account 24개월 합산 통계.
 */
export function getAccountTotals(account: Account) {
  const data = getAccountMonthlyRevenue(account);
  const revenue = data.reduce((s, m) => s + m.revenue, 0);
  const gp = data.reduce((s, m) => s + m.gp, 0);
  const roomNights = data.reduce((s, m) => s + m.roomNights, 0);
  const transactions = data.reduce((s, m) => s + m.transactions, 0);
  return {
    revenue,
    gp,
    roomNights,
    transactions,
    adr: roomNights > 0 ? Math.round(revenue / roomNights) : 0,
  };
}

/**
 * 분기별 매출 — 시즌 패턴 차트용.
 */
export function getAccountQuarterly(account: Account): Array<{ quarter: string; revenue: number; index: number }> {
  const data = getAccountMonthlyRevenue(account);
  if (data.length === 0) return [];
  const quarters: Record<string, number> = {};
  data.forEach((m) => {
    const [y, mo] = m.yearMonth.split("-").map(Number);
    const q = Math.floor((mo - 1) / 3) + 1;
    const key = `${String(y).slice(2)}Q${q}`;
    quarters[key] = (quarters[key] ?? 0) + m.revenue;
  });
  const entries = Object.entries(quarters);
  const avg = entries.reduce((s, [_, v]) => s + v, 0) / entries.length || 1;
  return entries.map(([quarter, revenue]) => ({
    quarter,
    revenue,
    index: Math.round((revenue / avg) * 100),
  }));
}

/**
 * 회사 전체 12개월 매출 합산 — MOCK_ACCOUNTS 전체에서 집계.
 * 대시보드/Brief에서 사용.
 */
export function getCompanyMonthlyTotals(): Array<{ month: string; revenue: number; gp: number }> {
  // 모든 활성 계정의 매출 합산
  const aggregated: Record<string, { revenue: number; gp: number }> = {};

  for (const account of MOCK_ACCOUNTS) {
    const series = getAccountMonthlyRevenue(account);
    for (const m of series) {
      const cur = aggregated[m.yearMonth] ?? { revenue: 0, gp: 0 };
      aggregated[m.yearMonth] = {
        revenue: cur.revenue + m.revenue,
        gp: cur.gp + m.gp,
      };
    }
  }

  return Object.entries(aggregated)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-12)
    .map(([key, v]) => {
      const [, mo] = key.split("-");
      return { month: `${Number(mo)}월`, revenue: v.revenue, gp: v.gp };
    });
}
