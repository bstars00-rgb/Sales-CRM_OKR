// ============================================================
// 12개월 매출 추이 (YoY 비교)
// ============================================================
export const MOCK_REVENUE_TREND = [
  { month: "5월(전)",  lastYear: 1_020_000_000, thisYear: 0 },
  { month: "6월",      lastYear: 1_140_000_000, thisYear: 0 },
  { month: "7월",      lastYear: 1_440_000_000, thisYear: 0 },
  { month: "8월",      lastYear: 1_580_000_000, thisYear: 0 },
  { month: "9월",      lastYear: 1_280_000_000, thisYear: 0 },
  { month: "10월",     lastYear: 1_080_000_000, thisYear: 0 },
  { month: "11월",     lastYear: 1_080_000_000, thisYear: 1_280_000_000 },
  { month: "12월",     lastYear: 1_400_000_000, thisYear: 1_550_000_000 },
  { month: "1월",      lastYear: 1_120_000_000, thisYear: 1_420_000_000 },
  { month: "2월",      lastYear: 1_080_000_000, thisYear: 1_380_000_000 },
  { month: "3월",      lastYear: 1_240_000_000, thisYear: 1_690_000_000 },
  { month: "4월",      lastYear: 1_320_000_000, thisYear: 1_820_000_000 },
  { month: "5월",      lastYear: 0,             thisYear: 1_420_000_000 },
];

// ============================================================
// 국가별 매출 (10개국)
// ============================================================
export const MOCK_COUNTRY_REVENUE = [
  { country: "🇰🇷 한국",       revenue: 5_240_000_000, delta: 22 },
  { country: "🇯🇵 일본",       revenue: 3_160_000_000, delta: -15 },
  { country: "🇻🇳 베트남",     revenue: 2_180_000_000, delta: 42 },
  { country: "🇹🇭 태국",       revenue: 1_280_000_000, delta: 8 },
  { country: "🇸🇬 싱가포르",   revenue: 720_000_000,   delta: 18 },
  { country: "🇹🇼 대만",       revenue: 580_000_000,   delta: 12 },
  { country: "🇮🇩 인도네시아", revenue: 480_000_000,   delta: 14 },
  { country: "🇨🇳 중국",       revenue: 420_000_000,   delta: -22 },
  { country: "🇵🇭 필리핀",     revenue: 180_000_000,   delta: 38 },
  { country: "🇲🇾 말레이시아", revenue: 120_000_000,   delta: -3 },
];

// ============================================================
// TOP 핵심 고객사 (15)
// ============================================================
export const MOCK_TOP_ACCOUNTS = [
  { name: "Hana Tour",            country: "🇰🇷", revenueYtd: 1_240_000_000, gpYtd: 168_000_000, trend: "up" },
  { name: "JTB Travel",           country: "🇯🇵", revenueYtd: 824_000_000,   gpYtd: 112_000_000, trend: "up" },
  { name: "Saigontourist",        country: "🇻🇳", revenueYtd: 648_000_000,   gpYtd: 89_000_000,  trend: "up" },
  { name: "Mode Tour Network",    country: "🇰🇷", revenueYtd: 484_000_000,   gpYtd: 68_000_000,  trend: "up" },
  { name: "Asian Trails Bangkok", country: "🇹🇭", revenueYtd: 412_000_000,   gpYtd: 58_000_000,  trend: "flat" },
  { name: "ABC Travel Holdings",  country: "🇻🇳", revenueYtd: 412_000_000,   gpYtd: 58_000_000,  trend: "up" },
  { name: "LMN DMC Vietnam",      country: "🇻🇳", revenueYtd: 312_000_000,   gpYtd: 42_000_000,  trend: "up" },
  { name: "Chan Brothers",        country: "🇸🇬", revenueYtd: 286_000_000,   gpYtd: 40_000_000,  trend: "up" },
  { name: "Lion Travel",          country: "🇹🇼", revenueYtd: 248_000_000,   gpYtd: 35_000_000,  trend: "flat" },
  { name: "HIS Holdings",         country: "🇯🇵", revenueYtd: 224_000_000,   gpYtd: 32_000_000,  trend: "up" },
  { name: "Tokyo Bridge Hotel",   country: "🇯🇵", revenueYtd: 168_000_000,   gpYtd: 26_000_000,  trend: "down" },
  { name: "XYZ DMC Japan",        country: "🇯🇵", revenueYtd: 168_000_000,   gpYtd: 24_000_000,  trend: "flat" },
  { name: "여기어때 (Yeogi)",     country: "🇰🇷", revenueYtd: 168_000_000,   gpYtd: 24_000_000,  trend: "up" },
  { name: "Panorama JTB",         country: "🇮🇩", revenueYtd: 158_000_000,   gpYtd: 22_000_000,  trend: "up" },
  { name: "Vietravel",            country: "🇻🇳", revenueYtd: 142_000_000,   gpYtd: 21_000_000,  trend: "up" },
];

// ============================================================
// 위험 신호 (8건)
// ============================================================
export const MOCK_RISK_ALERTS = [
  { kind: "DORMANT", title: "Tokyo Bridge Hotel — 92일 미접촉 KEY → DORMANT 진입", severity: "HIGH" },
  { kind: "DORMANT", title: "Lvmama — 75일 미접촉, 중국 시장 침체 영향",            severity: "MID" },
  { kind: "DORMANT", title: "GoldenSun Wholesale — 61일 미접촉",                    severity: "MID" },
  { kind: "STALE",   title: "ABC API 통합 — 22일 단계 체류 (목표 60일)",            severity: "HIGH" },
  { kind: "STALE",   title: "XYZ DMC Proposal — 18일 정체 (결제 조건 이슈)",        severity: "HIGH" },
  { kind: "STALE",   title: "OPQ Wholesale Contact — 14일 정체",                    severity: "MID" },
  { kind: "STALE",   title: "Asian Trails 인보이스 분쟁 — 13일 지연",               severity: "MID" },
  { kind: "STALE",   title: "Lion Travel H2 갱신 — 11일 무회신",                    severity: "MID" },
];
