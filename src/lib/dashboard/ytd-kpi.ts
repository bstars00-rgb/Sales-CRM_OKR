/**
 * 호텔 B2B 표준 KPI 5종 — 체크아웃(매출 인식) 기준 YTD.
 *
 * - TTV (Total Transaction Value): 고객이 호텔에 지불한 총 거래액
 * - Revenue: 회사 인식 매출 (커미션·마진 수입)
 * - Margin: Revenue 중 비용 차감 후 순이익 (GP)
 * - Bookings: 예약 건수 (체크인 기준)
 * - Room Night: 객실-야 (Bookings × 평균 stay)
 *
 * 각 지표에:
 * - YTD 현재값
 * - YoY (전년 동기 대비 % delta)
 * - 연간 KPI 목표 + YTD pro-rated 진척률
 */

import { MOCK_ACCOUNTS } from "../mock/accounts";
import { getCompanyHotelMetrics } from "../hotel/metrics";

export type KpiCode = "TTV" | "REVENUE" | "MARGIN" | "BOOKINGS" | "ROOM_NIGHT";

export interface KpiSnapshot {
  code: KpiCode;
  label: string;
  unit: "KRW" | "건" | "RN";
  current: number;          // 이번 해 YTD
  lastYear: number;         // 작년 동기간
  yoyPct: number;           // (current - lastYear) / lastYear * 100
  annualTarget: number;     // 연간 KPI 목표
  ytdTargetPct: number;     // YTD 시점에 도달해야 할 목표 (pro-rated)
  achievementPct: number;   // current / ytdTarget * 100
}

/** 평균 stay 박수 — Booking → Room Night 환산 */
const AVG_STAY_NIGHTS = 2.6;

/** OTA/B2B 모델 기본 비율 (사용자별/계약별 commission rate은 hotel/metrics.ts에서 별도 관리) */
const REVENUE_RATE = 0.22;  // TTV의 22%를 회사가 commission으로 인식
const MARGIN_RATE  = 0.14;  // TTV의 14%가 순이익 (GP)

/** 페르소나별 본인 담당 accounts 필터 */
function getMyAccountIds(userId: string, role?: string): string[] {
  if (role === "DIRECTOR" || role === "EXECUTIVE") {
    return MOCK_ACCOUNTS.map((a) => a.id);
  }
  // MEMBER/MANAGER: 본인 담당
  return MOCK_ACCOUNTS.filter((a) => a.ownerUserId === userId).map((a) => a.id);
}

/** YTD 개월 수 (오늘이 5월 19일이면 5 — Jan, Feb, Mar, Apr, May 5개월) */
function monthsYtd(today = new Date()): number {
  return today.getMonth() + 1;
}

/** 연간 → YTD pro-rated 목표 */
function prorate(annualTarget: number, ytdMonths: number): number {
  return annualTarget * (ytdMonths / 12);
}

/** 페르소나·역할 컨텍스트 */
export interface KpiContext {
  userId: string;
  role?: string;
}

/**
 * 5종 KPI YTD 스냅샷 계산.
 *
 * 연간 목표는 페르소나에 따라 다르게 적용:
 * - DIRECTOR/EXECUTIVE: 회사 전체 연간 목표
 * - MANAGER/MEMBER: 본인 담당 accounts × 페르소나별 비율
 */
export function computeYtdKpi(ctx: KpiContext, today = new Date()): KpiSnapshot[] {
  const ids = getMyAccountIds(ctx.userId, ctx.role);
  const ytdM = monthsYtd(today);

  // hotel/metrics — 24개월 시계열 (과거 12개월 + 올해 ~12개월)
  const series = getCompanyHotelMetrics(ids, 24);

  // 올해 YTD = 마지막 ytdM 개월
  const thisYtd = series.slice(-ytdM);
  // 작년 동기 = 마지막 ytdM 개월의 12개월 전
  const lastYtd = series.slice(-(ytdM + 12), -12);

  const ttvThis = thisYtd.reduce((s, m) => s + m.revenue, 0);
  const ttvLast = lastYtd.reduce((s, m) => s + m.revenue, 0);
  const rnThis  = thisYtd.reduce((s, m) => s + m.roomNights, 0);
  const rnLast  = lastYtd.reduce((s, m) => s + m.roomNights, 0);

  const revThis = ttvThis * REVENUE_RATE;
  const revLast = ttvLast * REVENUE_RATE;
  const marThis = ttvThis * MARGIN_RATE;
  const marLast = ttvLast * MARGIN_RATE;
  const bkThis  = Math.round(rnThis / AVG_STAY_NIGHTS);
  const bkLast  = Math.round(rnLast / AVG_STAY_NIGHTS);

  // 연간 목표 — 페르소나별로 다르게
  // (mock으로 합리적 stretch goal: 작년 × 1.25)
  const stretch = 1.25;
  const annualTtv = ttvLast / (ytdM / 12) * stretch;
  const annualRev = revLast / (ytdM / 12) * stretch;
  const annualMar = marLast / (ytdM / 12) * stretch;
  const annualBk  = bkLast  / (ytdM / 12) * stretch;
  const annualRn  = rnLast  / (ytdM / 12) * stretch;

  const yoy = (cur: number, last: number) =>
    last > 0 ? ((cur - last) / last) * 100 : 0;

  const ytdTarget = (annual: number) => prorate(annual, ytdM);
  const achievement = (cur: number, annual: number) => {
    const tgt = ytdTarget(annual);
    return tgt > 0 ? (cur / tgt) * 100 : 0;
  };

  return [
    {
      code: "TTV",         label: "TTV",        unit: "KRW",
      current: Math.round(ttvThis), lastYear: Math.round(ttvLast),
      yoyPct: yoy(ttvThis, ttvLast),
      annualTarget: Math.round(annualTtv),
      ytdTargetPct: Math.round(ytdTarget(annualTtv)),
      achievementPct: achievement(ttvThis, annualTtv),
    },
    {
      code: "REVENUE",     label: "Revenue",    unit: "KRW",
      current: Math.round(revThis), lastYear: Math.round(revLast),
      yoyPct: yoy(revThis, revLast),
      annualTarget: Math.round(annualRev),
      ytdTargetPct: Math.round(ytdTarget(annualRev)),
      achievementPct: achievement(revThis, annualRev),
    },
    {
      code: "MARGIN",      label: "Margin",     unit: "KRW",
      current: Math.round(marThis), lastYear: Math.round(marLast),
      yoyPct: yoy(marThis, marLast),
      annualTarget: Math.round(annualMar),
      ytdTargetPct: Math.round(ytdTarget(annualMar)),
      achievementPct: achievement(marThis, annualMar),
    },
    {
      code: "BOOKINGS",    label: "Bookings",   unit: "건",
      current: bkThis, lastYear: bkLast,
      yoyPct: yoy(bkThis, bkLast),
      annualTarget: Math.round(annualBk),
      ytdTargetPct: Math.round(ytdTarget(annualBk)),
      achievementPct: achievement(bkThis, annualBk),
    },
    {
      code: "ROOM_NIGHT",  label: "Room Night", unit: "RN",
      current: rnThis, lastYear: rnLast,
      yoyPct: yoy(rnThis, rnLast),
      annualTarget: Math.round(annualRn),
      ytdTargetPct: Math.round(ytdTarget(annualRn)),
      achievementPct: achievement(rnThis, annualRn),
    },
  ];
}
