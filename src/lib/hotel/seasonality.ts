/**
 * 호텔/여행 도메인 — 시즌성 정보
 *
 * 동남아 + 동북아 + 한국 출발 기준의 일반적 호텔 B2B 시즌 분류.
 * - PEAK: 최성수기 (가격 최고, 객실 부족)
 * - HIGH: 성수기 (수요 강함)
 * - SHOULDER: 어깨철 (전환기)
 * - LOW: 비수기 (프로모션 적기)
 */

export type Season = "PEAK" | "HIGH" | "SHOULDER" | "LOW";

export interface SeasonMonth {
  month: number;     // 1-12
  season: Season;
  reason: string;    // 한 줄 설명
}

/** 동남아/동북아 호텔 시즌 (한국 출발 기준) */
export const SEASON_CALENDAR: SeasonMonth[] = [
  { month:  1, season: "PEAK",     reason: "신정·구정 연휴 + 동남아 건기" },
  { month:  2, season: "HIGH",     reason: "구정 연휴 + 발렌타인" },
  { month:  3, season: "SHOULDER", reason: "졸업·신학기 전환" },
  { month:  4, season: "LOW",      reason: "비수기 (4-5월 동남아 우기 시작)" },
  { month:  5, season: "LOW",      reason: "어린이날·근로자의날 외 비수기" },
  { month:  6, season: "LOW",      reason: "비수기 (장마/우기)" },
  { month:  7, season: "PEAK",     reason: "여름휴가 시즌" },
  { month:  8, season: "PEAK",     reason: "여름휴가 절정" },
  { month:  9, season: "SHOULDER", reason: "추석 (연도별 변동)" },
  { month: 10, season: "SHOULDER", reason: "단풍·가을 여행" },
  { month: 11, season: "LOW",      reason: "겨울 직전 비수기" },
  { month: 12, season: "PEAK",     reason: "연말 + 크리스마스 + 동남아 건기" },
];

export const SEASON_META: Record<Season, { label: string; emoji: string; bgClass: string; textClass: string; chartColor: string }> = {
  PEAK:     { label: "최성수기", emoji: "🔥", bgClass: "bg-destructive/15", textClass: "text-destructive", chartColor: "#ef4444" },
  HIGH:     { label: "성수기",   emoji: "📈", bgClass: "bg-warning/15",     textClass: "text-warning",     chartColor: "#f59e0b" },
  SHOULDER: { label: "어깨철",   emoji: "🌿", bgClass: "bg-primary/15",     textClass: "text-primary",     chartColor: "#3b82f6" },
  LOW:      { label: "비수기",   emoji: "💤", bgClass: "bg-muted",          textClass: "text-muted-foreground", chartColor: "#94a3b8" },
};

export function getSeason(month: number): SeasonMonth {
  return SEASON_CALENDAR[Math.max(0, Math.min(11, month - 1))];
}

/** 다음 N개월 시즌 미리보기 */
export function nextSeasons(fromDate: Date = new Date(), count = 6): SeasonMonth[] {
  const out: SeasonMonth[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(fromDate.getFullYear(), fromDate.getMonth() + i, 1);
    out.push(getSeason(d.getMonth() + 1));
  }
  return out;
}

/** 특정 날짜가 속한 시즌 */
export function getSeasonForDate(date: Date | string): Season {
  const d = typeof date === "string" ? new Date(date) : date;
  return getSeason(d.getMonth() + 1).season;
}
