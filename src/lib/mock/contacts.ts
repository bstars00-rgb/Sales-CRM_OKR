import type { Contact } from "./types";

// 22개 고객사 × 평균 2-3명 = 약 55명
export const MOCK_CONTACTS: Contact[] = [
  // ABC Travel Holdings (베트남)
  { id: "ct-101", accountId: "acc-001", firstName: "Nguyen", lastName: "Van Minh",
    title: "CEO", email: "minh@abctravel.vn", phone: "+84 90 123 4567",
    messengerKind: "ZALO", messengerId: "84090abc",
    decisionPower: 5, influence: 5, relationshipTemp: "WARM", isPrimary: true },
  { id: "ct-102", accountId: "acc-001", firstName: "Linh", lastName: "Tran",
    title: "Head of Sales", email: "linh@abctravel.vn", phone: "+84 90 234 5678",
    decisionPower: 3, influence: 4, relationshipTemp: "HOT", isPrimary: false },
  { id: "ct-103", accountId: "acc-001", firstName: "Ho", lastName: "Quang",
    title: "Head of IT (API)", email: "ho@abctravel.vn",
    decisionPower: 2, influence: 3, relationshipTemp: "WARM", isPrimary: false },

  // XYZ DMC Japan
  { id: "ct-201", accountId: "acc-002", firstName: "Yuki", lastName: "Sato",
    title: "Director", email: "sato@xyz-dmc.jp",
    decisionPower: 4, influence: 4, relationshipTemp: "COOL", isPrimary: true },
  { id: "ct-202", accountId: "acc-002", firstName: "Hiroshi", lastName: "Tanaka",
    title: "Operations Manager", email: "tanaka@xyz-dmc.jp",
    decisionPower: 2, influence: 3, relationshipTemp: "WARM", isPrimary: false },

  // GoldenSun
  { id: "ct-301", accountId: "acc-003", firstName: "Somchai",
    title: "Sales Director", email: "somchai@goldensun.th",
    decisionPower: 4, influence: 3, relationshipTemp: "COLD", isPrimary: true },

  // Hanoi Skies
  { id: "ct-401", accountId: "acc-004", firstName: "Tuan", lastName: "Pham",
    title: "Founder & CEO", email: "tuan@hanoiskies.vn",
    messengerKind: "ZALO", messengerId: "84091xyz",
    decisionPower: 5, influence: 5, relationshipTemp: "WARM", isPrimary: true },
  { id: "ct-402", accountId: "acc-004", firstName: "Mai", lastName: "Nguyen",
    title: "Business Development", email: "mai@hanoiskies.vn",
    decisionPower: 2, influence: 4, relationshipTemp: "HOT", isPrimary: false },

  // JKL Travel Korea
  { id: "ct-501", accountId: "acc-005", firstName: "이재형", title: "이사",
    email: "lee@jkltravel.kr", phone: "+82 10 1234 5678",
    messengerKind: "KAKAO", messengerId: "lee.jkl",
    decisionPower: 4, influence: 4, relationshipTemp: "WARM", isPrimary: true },
  { id: "ct-502", accountId: "acc-005", firstName: "박서연", title: "팀장",
    email: "park@jkltravel.kr", messengerKind: "KAKAO", messengerId: "park.jkl",
    decisionPower: 2, influence: 3, relationshipTemp: "WARM", isPrimary: false },

  // LMN DMC Vietnam
  { id: "ct-601", accountId: "acc-006", firstName: "Trang", lastName: "Vo",
    title: "Managing Director", email: "trang@lmndmc.vn",
    decisionPower: 5, influence: 5, relationshipTemp: "HOT", isPrimary: true },
  { id: "ct-602", accountId: "acc-006", firstName: "Khoa", lastName: "Le",
    title: "Sales Lead — Korea Market", email: "khoa@lmndmc.vn",
    decisionPower: 3, influence: 4, relationshipTemp: "WARM", isPrimary: false },

  // Tokyo Bridge Hotel
  { id: "ct-701", accountId: "acc-007", firstName: "Akiko", lastName: "Yamada",
    title: "GM", email: "yamada@tokyobridge.jp",
    decisionPower: 5, influence: 4, relationshipTemp: "COLD", isPrimary: true },
  { id: "ct-702", accountId: "acc-007", firstName: "Kenta", lastName: "Ishii",
    title: "Revenue Manager", email: "ishii@tokyobridge.jp",
    decisionPower: 2, influence: 3, relationshipTemp: "COOL", isPrimary: false },

  // OPQ Wholesale
  { id: "ct-801", accountId: "acc-008", firstName: "Budi", lastName: "Santoso",
    title: "Director", email: "budi@opq.id", phone: "+62 812 345 6789",
    messengerKind: "WHATSAPP", messengerId: "628123456789",
    decisionPower: 4, influence: 3, relationshipTemp: "COOL", isPrimary: true },

  // Saigontourist
  { id: "ct-901", accountId: "acc-009", firstName: "Bao", lastName: "Tran",
    title: "VP of Partnerships", email: "bao@saigontourist.vn",
    decisionPower: 5, influence: 5, relationshipTemp: "HOT", isPrimary: true },
  { id: "ct-902", accountId: "acc-009", firstName: "Phuong", lastName: "Le",
    title: "Account Manager", email: "phuong@saigontourist.vn",
    decisionPower: 2, influence: 3, relationshipTemp: "WARM", isPrimary: false },

  // Vietravel
  { id: "ct-1001", accountId: "acc-010", firstName: "Anh", lastName: "Nguyen",
    title: "Sales Director", email: "anh@vietravel.vn",
    decisionPower: 4, influence: 4, relationshipTemp: "WARM", isPrimary: true },

  // JTB Travel
  { id: "ct-1101", accountId: "acc-011", firstName: "Takeshi", lastName: "Kobayashi",
    title: "General Manager — Inbound", email: "kobayashi@jtb.co.jp",
    decisionPower: 5, influence: 5, relationshipTemp: "WARM", isPrimary: true },
  { id: "ct-1102", accountId: "acc-011", firstName: "Mari", lastName: "Ito",
    title: "Korea Desk Manager", email: "ito@jtb.co.jp",
    decisionPower: 2, influence: 4, relationshipTemp: "HOT", isPrimary: false },

  // HIS
  { id: "ct-1201", accountId: "acc-012", firstName: "Daichi", lastName: "Suzuki",
    title: "Procurement Director", email: "suzuki@his-japan.co.jp",
    decisionPower: 5, influence: 4, relationshipTemp: "WARM", isPrimary: true },
  { id: "ct-1202", accountId: "acc-012", firstName: "Rika", lastName: "Takahashi",
    title: "Senior Buyer", email: "takahashi@his-japan.co.jp",
    decisionPower: 3, influence: 4, relationshipTemp: "WARM", isPrimary: false },

  // Hana Tour
  { id: "ct-1301", accountId: "acc-013", firstName: "최영수", title: "전무",
    email: "choi@hanatour.com", messengerKind: "KAKAO", messengerId: "choi.hanatour",
    decisionPower: 5, influence: 5, relationshipTemp: "WARM", isPrimary: true },
  { id: "ct-1302", accountId: "acc-013", firstName: "김도현", title: "상품기획팀장",
    email: "kim.dh@hanatour.com",
    decisionPower: 3, influence: 4, relationshipTemp: "HOT", isPrimary: false },
  { id: "ct-1303", accountId: "acc-013", firstName: "이서현", title: "정산팀 매니저",
    email: "lee.sh@hanatour.com",
    decisionPower: 1, influence: 2, relationshipTemp: "WARM", isPrimary: false },

  // Mode Tour
  { id: "ct-1401", accountId: "acc-014", firstName: "정민호", title: "이사",
    email: "jung@modetour.com", messengerKind: "KAKAO", messengerId: "jung.modetour",
    decisionPower: 4, influence: 4, relationshipTemp: "WARM", isPrimary: true },

  // 여기어때
  { id: "ct-1501", accountId: "acc-015", firstName: "강지원", title: "전략기획실장",
    email: "kang@yeogi.com", messengerKind: "KAKAO", messengerId: "kang.yeogi",
    decisionPower: 5, influence: 5, relationshipTemp: "HOT", isPrimary: true },
  { id: "ct-1502", accountId: "acc-015", firstName: "한지훈", title: "API 파트너십 리드",
    email: "han@yeogi.com",
    decisionPower: 3, influence: 4, relationshipTemp: "WARM", isPrimary: false },

  // Asian Trails Bangkok
  { id: "ct-1601", accountId: "acc-016", firstName: "Niran", lastName: "Suwannakit",
    title: "Country Manager", email: "niran@asiantrails.th",
    decisionPower: 5, influence: 5, relationshipTemp: "HOT", isPrimary: true },
  { id: "ct-1602", accountId: "acc-016", firstName: "Pim", lastName: "Wattana",
    title: "Sales Lead", email: "pim@asiantrails.th",
    decisionPower: 2, influence: 3, relationshipTemp: "WARM", isPrimary: false },

  // Panorama JTB
  { id: "ct-1701", accountId: "acc-017", firstName: "Made", lastName: "Wirawan",
    title: "Director", email: "made@panorama.id",
    decisionPower: 4, influence: 4, relationshipTemp: "WARM", isPrimary: true },

  // Chan Brothers (싱가포르)
  { id: "ct-1801", accountId: "acc-018", firstName: "Lim", lastName: "Wei Ming",
    title: "Director of Operations", email: "lim@chanbrothers.sg",
    decisionPower: 5, influence: 4, relationshipTemp: "WARM", isPrimary: true },
  { id: "ct-1802", accountId: "acc-018", firstName: "Sarah", lastName: "Tan",
    title: "Procurement Manager", email: "sarah.tan@chanbrothers.sg",
    decisionPower: 3, influence: 4, relationshipTemp: "WARM", isPrimary: false },

  // Rajah Travel (필리핀)
  { id: "ct-1901", accountId: "acc-019", firstName: "Maria", lastName: "Santos",
    title: "Sales Director", email: "maria@rajahtravel.ph",
    messengerKind: "WHATSAPP", messengerId: "63917123456",
    decisionPower: 4, influence: 3, relationshipTemp: "COOL", isPrimary: true },

  // Lion Travel (대만)
  { id: "ct-2001", accountId: "acc-020", firstName: "Chen", lastName: "Yi-Ling",
    title: "VP of Sourcing", email: "chen.yl@liontravel.com",
    messengerKind: "LINE", messengerId: "chen_yl",
    decisionPower: 5, influence: 5, relationshipTemp: "WARM", isPrimary: true },
  { id: "ct-2002", accountId: "acc-020", firstName: "Wang", lastName: "Hao",
    title: "Korea Market Lead", email: "wang.h@liontravel.com",
    decisionPower: 3, influence: 4, relationshipTemp: "WARM", isPrimary: false },

  // Mayflower (말레이시아)
  { id: "ct-2101", accountId: "acc-021", firstName: "Rajesh", lastName: "Kumar",
    title: "Managing Director", email: "rajesh@mayflower.com.my",
    decisionPower: 5, influence: 5, relationshipTemp: "WARM", isPrimary: true },

  // Lvmama (중국)
  { id: "ct-2201", accountId: "acc-022", firstName: "Zhang", lastName: "Wei",
    title: "Procurement Manager", email: "zhang.w@lvmama.cn",
    messengerKind: "WECHAT", messengerId: "zhangwei_lvmama",
    decisionPower: 3, influence: 3, relationshipTemp: "COLD", isPrimary: true },
];
