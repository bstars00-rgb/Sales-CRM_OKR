export const MOCK_REVENUE_TREND = [
  { month: "11월", lastYear: 1_080_000_000, thisYear: 1_280_000_000 },
  { month: "12월", lastYear: 1_400_000_000, thisYear: 1_550_000_000 },
  { month: "1월",  lastYear: 1_120_000_000, thisYear: 1_420_000_000 },
  { month: "2월",  lastYear: 1_080_000_000, thisYear: 1_380_000_000 },
  { month: "3월",  lastYear: 1_240_000_000, thisYear: 1_690_000_000 },
  { month: "4월",  lastYear: 1_320_000_000, thisYear: 1_820_000_000 },
  { month: "5월",  lastYear: 0,             thisYear: 1_420_000_000 },
];

export const MOCK_COUNTRY_REVENUE = [
  { country: "🇰🇷 한국",    revenue: 4_200_000_000, delta: 18 },
  { country: "🇻🇳 베트남",  revenue: 1_800_000_000, delta: 42 },
  { country: "🇯🇵 일본",    revenue: 2_100_000_000, delta: -22 },
  { country: "🇹🇭 태국",    revenue: 880_000_000,   delta: 5 },
  { country: "🇨🇳 중국",    revenue: 540_000_000,   delta: -8 },
  { country: "🇮🇩 인도네시아", revenue: 380_000_000, delta: 12 },
];

export const MOCK_TOP_ACCOUNTS = [
  { name: "ABC Travel Holdings", country: "🇻🇳", revenueYtd: 412_000_000, gpYtd: 58_000_000, trend: "up" },
  { name: "Tokyo Bridge Hotel",  country: "🇯🇵", revenueYtd: 168_000_000, gpYtd: 26_000_000, trend: "down" },
  { name: "LMN DMC Vietnam",     country: "🇻🇳", revenueYtd: 312_000_000, gpYtd: 42_000_000, trend: "up" },
  { name: "XYZ DMC Japan",       country: "🇯🇵", revenueYtd: 168_000_000, gpYtd: 24_000_000, trend: "flat" },
  { name: "Hanoi Skies",         country: "🇻🇳", revenueYtd: 96_000_000,  gpYtd: 14_400_000, trend: "up" },
];

export const MOCK_RISK_ALERTS = [
  { kind: "DORMANT", title: "Tokyo Bridge Hotel — 92일 미접촉 KEY → DORMANT 진입", severity: "HIGH" },
  { kind: "DORMANT", title: "GoldenSun Wholesale — 61일 미접촉", severity: "MID" },
  { kind: "STALE",   title: "ABC API 통합 90일째 (목표 60일)", severity: "HIGH" },
  { kind: "STALE",   title: "OPQ Wholesale 14일 정체 (Contact)", severity: "MID" },
];
