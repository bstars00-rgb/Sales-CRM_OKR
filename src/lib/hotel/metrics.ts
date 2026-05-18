/**
 * 호텔 도메인 핵심 지표 — Room Night / ADR / RevPAR / OCC
 *
 * 정의:
 * - Room Night (RN): 객실수 × 박수 (판매된 총 객실-야)
 * - ADR (Average Daily Rate): 평균 객실 단가 = Revenue / RN
 * - OCC (Occupancy): 점유율 = RN / 가용 객실-야
 * - RevPAR (Revenue per Available Room): ADR × OCC = Revenue / 가용 객실-야
 *
 * Account 단위로 매월 Room Night/ADR/Revenue를 결정론적으로 생성.
 */

import { MOCK_HOTELS } from "../mock/hotels";

/** 결정론적 해시 — Account ID에서 고정 시드 추출 */
function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pseudoRandom(seed: number, idx: number): number {
  const x = Math.sin(seed * 17 + idx * 31) * 10_000;
  return x - Math.floor(x);
}

export interface HotelMetrics {
  month: string;        // YYYY-MM
  roomNights: number;
  adr: number;          // KRW per night
  revPar: number;       // KRW per available room-night
  occupancyPct: number; // 0-100
  revenue: number;      // KRW
}

/**
 * Account에 매핑된 호텔들의 합산 호텔 지표를 결정론적으로 생성.
 * - Account가 호텔에 매핑되지 않으면 빈 배열.
 */
export function getAccountHotelMetrics(accountId: string, months = 12): HotelMetrics[] {
  const seed = hashSeed(accountId);
  // 시드로부터 base 객실수 (50-300실)
  const baseRooms = 50 + (seed % 250);
  const baseAdr = 80_000 + (seed % 200_000); // 8만~28만원
  const baseOcc = 55 + (seed % 30);          // 55~85%

  if (baseRooms === 0) return [];

  const result: HotelMetrics[] = [];
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const availableRoomNights = baseRooms * daysInMonth;

    // 시즌별 변동
    const month = d.getMonth() + 1;
    const seasonMult = month === 7 || month === 8 || month === 12 || month === 1 ? 1.25
                     : month === 5 || month === 6 || month === 11 ? 0.78
                     : 1.0;

    const noise = 0.85 + pseudoRandom(seed, i) * 0.3;
    const occ = Math.min(98, baseOcc * seasonMult * noise);
    const adr = Math.round(baseAdr * (0.9 + pseudoRandom(seed, i + 100) * 0.25) * seasonMult);
    const roomNights = Math.round(availableRoomNights * (occ / 100));
    const revenue = roomNights * adr;
    const revPar = Math.round(revenue / availableRoomNights);

    result.push({
      month: monthKey,
      roomNights,
      adr,
      revPar,
      occupancyPct: Math.round(occ),
      revenue,
    });
  }
  return result;
}

/** 회사 전체 — 모든 매핑된 Account의 합산 */
export function getCompanyHotelMetrics(accountIds: string[], months = 12): HotelMetrics[] {
  const sumByMonth = new Map<string, HotelMetrics>();
  let totalRooms = 0;

  accountIds.forEach((id) => {
    const seed = hashSeed(id);
    totalRooms += 50 + (seed % 250);
  });

  accountIds.forEach((accId) => {
    const series = getAccountHotelMetrics(accId, months);
    series.forEach((m) => {
      const cur = sumByMonth.get(m.month);
      if (cur) {
        cur.roomNights += m.roomNights;
        cur.revenue += m.revenue;
      } else {
        sumByMonth.set(m.month, { ...m });
      }
    });
  });

  const arr = Array.from(sumByMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
  // ADR/RevPAR/OCC 재계산 (합산 기준)
  return arr.map((m) => {
    const days = new Date(Number(m.month.slice(0, 4)), Number(m.month.slice(5, 7)), 0).getDate();
    const available = totalRooms * days;
    return {
      ...m,
      adr: m.roomNights > 0 ? Math.round(m.revenue / m.roomNights) : 0,
      revPar: available > 0 ? Math.round(m.revenue / available) : 0,
      occupancyPct: available > 0 ? Math.round((m.roomNights / available) * 100) : 0,
    };
  });
}

/** Commission Rate 관리 — Segment별 기본 수수료율 */
export const DEFAULT_COMMISSION_BY_SEGMENT: Record<string, number> = {
  HOTEL: 0.10,           // 직거래 호텔
  OTA: 0.18,             // OTA (Expedia/Booking 등)
  TRAVEL_AGENCY: 0.15,   // 여행사
  WHOLESALER: 0.22,      // 홀세일러
  DMC: 0.12,             // DMC
  API_PARTNER: 0.05,     // API 파트너
  OFFLINE_AGENT: 0.20,   // 오프라인 에이전트
};

export function getDefaultCommission(segment: string): number {
  return DEFAULT_COMMISSION_BY_SEGMENT[segment] ?? 0.15;
}

// MOCK_HOTELS 미사용 경고 회피 (이 파일에서 외부 import 시 활용)
void MOCK_HOTELS;
