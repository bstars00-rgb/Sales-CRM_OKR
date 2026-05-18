/**
 * Win/Lost 사유 코드 카탈로그
 *
 * 영업 후일담 분류 표준화 — 데이터 기반 인사이트의 기반.
 * Win/Lost 모달과 분석 페이지에서 공통 사용.
 */

export interface ReasonCode {
  code: string;
  label: string;
  category: "PRICE" | "PRODUCT" | "RELATIONSHIP" | "TIMING" | "COMPETITOR" | "INTERNAL";
}

export const WIN_REASONS: ReasonCode[] = [
  { code: "PRICE_COMPETITIVE", label: "가격 경쟁력",          category: "PRICE" },
  { code: "FAST_RESPONSE",     label: "빠른 응답·납기",        category: "TIMING" },
  { code: "RELATIONSHIP_DEEP", label: "관계·신뢰",            category: "RELATIONSHIP" },
  { code: "FEATURE_FIT",       label: "기능·스펙 적합",        category: "PRODUCT" },
  { code: "REFERRAL_INTERNAL", label: "내부 추천·연결",        category: "RELATIONSHIP" },
  { code: "UPSELL_PROVEN",     label: "기존 성과 입증 (Upsell)", category: "RELATIONSHIP" },
  { code: "RENEWAL_AUTO",      label: "자동 갱신·만족도",      category: "RELATIONSHIP" },
  { code: "COMPETITOR_FAIL",   label: "경쟁사 이슈로 반사이익", category: "COMPETITOR" },
];

export const LOST_REASONS: ReasonCode[] = [
  { code: "PRICE_TOO_HIGH",    label: "가격 너무 높음",         category: "PRICE" },
  { code: "COMPETITOR_WON",    label: "경쟁사 수주",           category: "COMPETITOR" },
  { code: "FEATURE_GAP",       label: "기능·스펙 부족",         category: "PRODUCT" },
  { code: "BUDGET_FREEZE",     label: "고객 예산 동결·연기",    category: "TIMING" },
  { code: "DECISION_DELAY",    label: "의사결정 무한 지연",     category: "TIMING" },
  { code: "INTERNAL_CHANGE",   label: "고객사 내부 변경 (담당자 이탈 등)", category: "INTERNAL" },
  { code: "RELATIONSHIP_WEAK", label: "관계 약함·연결 부족",    category: "RELATIONSHIP" },
  { code: "NO_RESPONSE",       label: "응답 없음·연락 두절",    category: "INTERNAL" },
];

export function getWinReason(code?: string | null): ReasonCode | null {
  if (!code) return null;
  return WIN_REASONS.find((r) => r.code === code) ?? null;
}

export function getLostReason(code?: string | null): ReasonCode | null {
  if (!code) return null;
  return LOST_REASONS.find((r) => r.code === code) ?? null;
}

export const CATEGORY_META: Record<ReasonCode["category"], { label: string; tone: "destructive" | "warning" | "default" | "success" | "muted" | "secondary" }> = {
  PRICE:        { label: "가격",        tone: "warning" },
  PRODUCT:      { label: "제품·기능",   tone: "default" },
  RELATIONSHIP: { label: "관계",        tone: "success" },
  TIMING:       { label: "타이밍",      tone: "secondary" },
  COMPETITOR:   { label: "경쟁사",      tone: "destructive" },
  INTERNAL:     { label: "내부 요인",   tone: "muted" },
};
