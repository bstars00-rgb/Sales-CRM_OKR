export interface Hotel {
  id: string;
  name: string;
  countryCode: string;
  countryFlag: string;
  city: string;
  category: "LUXURY" | "UPSCALE" | "MIDSCALE" | "BUDGET";
  segment: "RESORT" | "URBAN" | "BUSINESS" | "BOUTIQUE";
  starRating: number; // 3 ~ 5
}

export const MOCK_HOTELS: Hotel[] = [
  // ── 베트남 (8)
  { id: "h-vn-1",  name: "푸라마 리조트 다낭",           countryCode: "VN", countryFlag: "🇻🇳", city: "다낭",   category: "LUXURY",   segment: "RESORT",   starRating: 5 },
  { id: "h-vn-2",  name: "InterContinental 다낭",        countryCode: "VN", countryFlag: "🇻🇳", city: "다낭",   category: "LUXURY",   segment: "RESORT",   starRating: 5 },
  { id: "h-vn-3",  name: "호치민 르네상스",              countryCode: "VN", countryFlag: "🇻🇳", city: "호치민", category: "UPSCALE",  segment: "URBAN",    starRating: 5 },
  { id: "h-vn-4",  name: "Park Hyatt Saigon",            countryCode: "VN", countryFlag: "🇻🇳", city: "호치민", category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-vn-5",  name: "Sofitel Legend Metropole 하노이", countryCode: "VN", countryFlag: "🇻🇳", city: "하노이", category: "LUXURY", segment: "BOUTIQUE", starRating: 5 },
  { id: "h-vn-6",  name: "JW Marriott 푸꾸옥",           countryCode: "VN", countryFlag: "🇻🇳", city: "푸꾸옥", category: "LUXURY",   segment: "RESORT",   starRating: 5 },
  { id: "h-vn-7",  name: "Vinpearl 나트랑",              countryCode: "VN", countryFlag: "🇻🇳", city: "나트랑", category: "UPSCALE",  segment: "RESORT",   starRating: 4 },
  { id: "h-vn-8",  name: "호이안 안방 부띠크",           countryCode: "VN", countryFlag: "🇻🇳", city: "호이안", category: "UPSCALE",  segment: "BOUTIQUE", starRating: 4 },

  // ── 일본 (6)
  { id: "h-jp-1",  name: "임페리얼 호텔 도쿄",           countryCode: "JP", countryFlag: "🇯🇵", city: "도쿄",   category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-jp-2",  name: "리츠칼튼 도쿄",                countryCode: "JP", countryFlag: "🇯🇵", city: "도쿄",   category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-jp-3",  name: "오쿠라 도쿄",                  countryCode: "JP", countryFlag: "🇯🇵", city: "도쿄",   category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-jp-4",  name: "콘래드 오사카",                countryCode: "JP", countryFlag: "🇯🇵", city: "오사카", category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-jp-5",  name: "하코네 료칸 — 강가",           countryCode: "JP", countryFlag: "🇯🇵", city: "하코네", category: "UPSCALE",  segment: "BOUTIQUE", starRating: 4 },
  { id: "h-jp-6",  name: "오키나와 부세나 테라스",       countryCode: "JP", countryFlag: "🇯🇵", city: "오키나와", category: "LUXURY", segment: "RESORT",   starRating: 5 },

  // ── 한국 (4)
  { id: "h-kr-1",  name: "그랜드 하얏트 서울",           countryCode: "KR", countryFlag: "🇰🇷", city: "서울",   category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-kr-2",  name: "신라호텔 서울",                countryCode: "KR", countryFlag: "🇰🇷", city: "서울",   category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-kr-3",  name: "파라다이스 호텔 부산",         countryCode: "KR", countryFlag: "🇰🇷", city: "부산",   category: "UPSCALE",  segment: "RESORT",   starRating: 5 },
  { id: "h-kr-4",  name: "롯데 호텔 제주",               countryCode: "KR", countryFlag: "🇰🇷", city: "제주",   category: "UPSCALE",  segment: "RESORT",   starRating: 5 },

  // ── 태국 (4)
  { id: "h-th-1",  name: "방콕 그랜드 하얏트 에라완",    countryCode: "TH", countryFlag: "🇹🇭", city: "방콕",   category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-th-2",  name: "샹그릴라 방콕",                countryCode: "TH", countryFlag: "🇹🇭", city: "방콕",   category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-th-3",  name: "푸켓 라구나 비치",             countryCode: "TH", countryFlag: "🇹🇭", city: "푸켓",   category: "UPSCALE",  segment: "RESORT",   starRating: 5 },
  { id: "h-th-4",  name: "치앙마이 만다린 오리엔탈",     countryCode: "TH", countryFlag: "🇹🇭", city: "치앙마이", category: "LUXURY", segment: "RESORT",   starRating: 5 },

  // ── 동남아 (4)
  { id: "h-id-1",  name: "발리 더 무리아",               countryCode: "ID", countryFlag: "🇮🇩", city: "발리",   category: "LUXURY",   segment: "RESORT",   starRating: 5 },
  { id: "h-id-2",  name: "발리 알리라 우붓",             countryCode: "ID", countryFlag: "🇮🇩", city: "발리",   category: "LUXURY",   segment: "BOUTIQUE", starRating: 5 },
  { id: "h-sg-1",  name: "마리나 베이 샌즈",             countryCode: "SG", countryFlag: "🇸🇬", city: "싱가포르", category: "LUXURY", segment: "URBAN",    starRating: 5 },
  { id: "h-ph-1",  name: "보라카이 디스커버리 쇼어즈",   countryCode: "PH", countryFlag: "🇵🇭", city: "보라카이", category: "UPSCALE", segment: "RESORT",   starRating: 4 },

  // ── 기타 (4)
  { id: "h-tw-1",  name: "타이베이 W 호텔",              countryCode: "TW", countryFlag: "🇹🇼", city: "타이베이", category: "UPSCALE", segment: "URBAN",   starRating: 5 },
  { id: "h-my-1",  name: "쿠알라룸푸르 만다린 오리엔탈", countryCode: "MY", countryFlag: "🇲🇾", city: "쿠알라룸푸르", category: "LUXURY", segment: "URBAN", starRating: 5 },
  { id: "h-hk-1",  name: "페닌슐라 홍콩",                countryCode: "HK", countryFlag: "🇭🇰", city: "홍콩",   category: "LUXURY",   segment: "URBAN",    starRating: 5 },
  { id: "h-mv-1",  name: "몰디브 카니 아일랜드",         countryCode: "MV", countryFlag: "🇲🇻", city: "말레",   category: "LUXURY",   segment: "RESORT",   starRating: 5 },
];

/**
 * 고객사 → TOP 호텔 매핑 (결정론적).
 * 고객사 segment·country·총 YTD 매출에 따라 어울리는 호텔 5개 선택.
 */
const ACCOUNT_TOP_HOTELS: Record<string, string[]> = {
  // 베트남 고객사들은 베트남 호텔 위주
  "acc-001": ["h-vn-1", "h-vn-3", "h-vn-6", "h-th-1", "h-id-1"], // ABC Travel — 동남아 묶음
  "acc-004": ["h-vn-1", "h-vn-2", "h-vn-5", "h-vn-7", "h-vn-8"], // Hanoi Skies — 베트남 전문
  "acc-006": ["h-vn-1", "h-vn-2", "h-kr-3", "h-vn-3", "h-vn-6"], // LMN DMC — 베한 연계
  "acc-009": ["h-vn-1", "h-vn-3", "h-vn-4", "h-vn-5", "h-vn-6"], // Saigontourist — 베트남 전국
  "acc-010": ["h-vn-1", "h-vn-7", "h-vn-8", "h-th-3", "h-id-1"], // Vietravel — 휴양지

  // 일본 고객사
  "acc-002": ["h-jp-1", "h-jp-5", "h-jp-6", "h-jp-3", "h-vn-1"], // XYZ DMC
  "acc-007": ["h-jp-1", "h-jp-2", "h-jp-3"],                      // Tokyo Bridge
  "acc-011": ["h-jp-1", "h-jp-4", "h-jp-2", "h-jp-6", "h-kr-2"], // JTB
  "acc-012": ["h-jp-1", "h-jp-2", "h-jp-6", "h-jp-5", "h-th-1"], // HIS

  // 한국 고객사
  "acc-005": ["h-kr-3", "h-kr-4", "h-vn-1", "h-th-3", "h-jp-6"], // JKL Travel
  "acc-013": ["h-kr-1", "h-kr-2", "h-kr-3", "h-kr-4", "h-vn-1"], // Hana Tour
  "acc-014": ["h-kr-3", "h-kr-4", "h-vn-1", "h-jp-6", "h-id-1"], // Mode Tour
  "acc-015": ["h-kr-1", "h-kr-3", "h-kr-4", "h-jp-1", "h-vn-3"], // 여기어때

  // 태국·동남아
  "acc-003": ["h-th-1", "h-th-3"],
  "acc-016": ["h-th-1", "h-th-2", "h-th-3", "h-th-4", "h-vn-1"], // Asian Trails
  "acc-008": ["h-id-1", "h-id-2", "h-vn-6"],                      // OPQ
  "acc-017": ["h-id-1", "h-id-2", "h-th-3", "h-mv-1", "h-th-1"], // Panorama JTB

  // 기타
  "acc-018": ["h-sg-1", "h-th-1", "h-vn-1", "h-mv-1", "h-id-1"], // Chan Brothers
  "acc-019": ["h-ph-1", "h-th-3", "h-vn-7"],                      // Rajah
  "acc-020": ["h-tw-1", "h-jp-1", "h-kr-1", "h-vn-1", "h-th-1"], // Lion Travel
  "acc-021": ["h-my-1", "h-sg-1", "h-th-3", "h-id-1"],            // Mayflower
  "acc-022": ["h-tw-1", "h-th-1"],                                // Lvmama
};

export function getAccountTopHotels(accountId: string, ytdRevenue: number): Array<{ hotel: Hotel; revenue: number }> {
  const hotelIds = ACCOUNT_TOP_HOTELS[accountId] ?? [];
  if (hotelIds.length === 0 || ytdRevenue === 0) return [];

  // 상위 호텔에 가중치를 더 줘서 매출 분배 (1순위 30%, 2순위 22%, ...)
  const weights = [0.30, 0.22, 0.18, 0.16, 0.14];
  return hotelIds.slice(0, 5).map((hId, i) => {
    const hotel = MOCK_HOTELS.find((h) => h.id === hId)!;
    const w = weights[i] ?? 0.10;
    const revenue = Math.round((ytdRevenue * 2) * w); // 24개월치 표기용 ×2
    return { hotel, revenue };
  });
}
