/**
 * 환율 변환 유틸 — 다국가 매출을 KRW 기준으로 표시하기 위함.
 *
 * 실서비스는 ELLIS API가 일별 환율을 제공할 예정. 그 전까지 mock 고정 환율 사용.
 * 환율은 1 단위 외화 = KRW 환산값.
 */

export type Currency = "KRW" | "USD" | "EUR" | "JPY" | "CNY" | "VND" | "THB" | "SGD" | "MYR" | "IDR" | "PHP" | "TWD" | "HKD";

/** Mock 환율 (2026-05 기준 가정) */
export const FX_RATES: Record<Currency, number> = {
  KRW: 1,
  USD: 1_380,
  EUR: 1_490,
  JPY: 9,        // 1 JPY = 9 KRW
  CNY: 190,
  VND: 0.055,    // 1 VND = 0.055 KRW
  THB: 38,
  SGD: 1_020,
  MYR: 295,
  IDR: 0.085,
  PHP: 24.5,
  TWD: 42,
  HKD: 176,
};

export const CURRENCY_FLAG: Record<Currency, string> = {
  KRW: "🇰🇷", USD: "🇺🇸", EUR: "🇪🇺", JPY: "🇯🇵", CNY: "🇨🇳",
  VND: "🇻🇳", THB: "🇹🇭", SGD: "🇸🇬", MYR: "🇲🇾", IDR: "🇮🇩",
  PHP: "🇵🇭", TWD: "🇹🇼", HKD: "🇭🇰",
};

/** 국가 코드 → 기본 통화 매핑 */
export const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  KR: "KRW", US: "USD", JP: "JPY", CN: "CNY",
  VN: "VND", TH: "THB", SG: "SGD", MY: "MYR",
  ID: "IDR", PH: "PHP", TW: "TWD", HK: "HKD",
};

/** 외화 → KRW */
export function toKrw(amount: number, currency: Currency): number {
  return Math.round(amount * (FX_RATES[currency] ?? 1));
}

/** KRW → 외화 */
export function fromKrw(krwAmount: number, currency: Currency): number {
  const rate = FX_RATES[currency] ?? 1;
  return rate === 0 ? 0 : krwAmount / rate;
}

/** 외화 → 외화 (KRW 경유) */
export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  return fromKrw(toKrw(amount, from), to);
}

/** 표시용 포맷 (외화 + KRW 환산 동시 표기) */
export function formatDualCurrency(amount: number, currency: Currency): string {
  if (currency === "KRW") {
    if (amount >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(1)}억`;
    if (amount >= 10_000) return `₩${(amount / 10_000).toFixed(0)}만`;
    return `₩${amount.toLocaleString()}`;
  }
  const krw = toKrw(amount, currency);
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "JPY" ? "¥" : currency + " ";
  const krwStr = krw >= 100_000_000 ? `₩${(krw / 100_000_000).toFixed(1)}억`
                : krw >= 10_000 ? `₩${(krw / 10_000).toFixed(0)}만`
                : `₩${krw.toLocaleString()}`;
  return `${symbol}${amount.toLocaleString()} (${krwStr})`;
}
