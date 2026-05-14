import type { Activity, Task } from "./types";

// ============================================================
// 활동 기록 — 45건 (지난 30일)
// ============================================================
export const MOCK_ACTIVITIES: Activity[] = [
  // === 오늘·어제 (10) ===
  a("act-1",  "MEETING",        "user-mock-1","김민수",     "acc-001","ABC Travel",         "deal-1","ABC Travel Q4 객실 공급",
    "ct-101","Nguyen Van Minh", -0, 14, 60, "분기 가격 합의 미팅", "객실 단가 $94 합의. 8/1부터 공급 시작 가능",
    "긍정 — 8/1 공급 시작 합의", "견적서 v3 발송 (내일까지)"),
  a("act-2",  "CALL",           "user-mock-1","김민수",     "acc-005","JKL Travel Korea",   "deal-2","JKL 분기 거래 가능성",
    "ct-501","이재형",          -0, 10, 22, "첫 통화", "결정권자 미팅 5/16 잡힘. Q3 패키지 관심도 높음",
    "긍정 — 미팅 일정 픽스", "분기 거래 제안서 v1 작성"),
  a("act-3",  "EMAIL_LOG",      "user-park",  "박지영",     "acc-013","Hana Tour",          "deal-32","Hana Tour 분기 패키지",
    undefined, undefined,       -0, 11, undefined, "정산자료 회신", "5월 정산 자료 첨부. 인보이스 확인 요청"),
  a("act-4",  "MESSENGER",      "user-mock-1","김민수",     "acc-001","ABC Travel",         undefined, undefined,
    "ct-102","Linh Tran",       -0, 9, undefined, "주말 일정 확인", "응웬 사장 5/12 베트남 출장 일정"),

  a("act-5",  "MEETING",        "user-mock-1","김민수",     "acc-004","Hanoi Skies",        "deal-6","Hanoi Skies API 연동",
    "ct-401","Tuan Pham",       -1, 11, 45, "API 협의", "API 단계 합의. IT팀 미팅 일정 잡기",
    "긍정", "결정권자 미팅 잡기 (이번주 내)"),
  a("act-6",  "EMAIL_LOG",      "user-nakamura","나카무라 켄지","acc-012","HIS Holdings",   "deal-27","HIS H2 패키지",
    undefined, undefined,       -1, 16, undefined, "H2 패키지 제안 v2", "단가 인하 시나리오 포함"),
  a("act-7",  "PROPOSAL_SENT",  "user-tan",   "Tan Wei Liang","acc-018","Chan Brothers",   "deal-25","Chan Brothers 동남아 묶음",
    undefined, undefined,       -1, 14, undefined, "동남아 패키지 제안서 v1", "Singapore + Bangkok + Bali 묶음"),
  a("act-8",  "CALL",           "user-park",  "박지영",     "acc-014","Mode Tour",          undefined, undefined,
    "ct-1401","정민호",         -1, 13, 18, "분기 갱신 협의", "갱신 의사 확인. 단가는 협의 필요"),
  a("act-9",  "MESSENGER",      "user-mock-1","김민수",     "acc-001","ABC Travel",         undefined, undefined,
    "ct-101","Nguyen Van Minh", -1, 19, undefined, "저녁 식사 약속", "5/12 저녁 식사 (응웬 사장 호치민 도착일)"),
  a("act-10", "MEETING",        "user-linh",  "Linh Tran",  "acc-009","Saigontourist",      "deal-33","Saigontourist 정산 보조",
    "ct-901","Bao Tran",        -1, 15, 90, "분기 리뷰", "Q1 정산 완료, Q2 진행률 75% 우수"),

  // === 2-7일 전 (15) ===
  a("act-11", "MEETING",        "user-mock-1","김민수",     "acc-001","ABC Travel",         undefined, undefined,
    undefined, undefined,        -3, 9, 60, "사무실 미팅", "호치민 사무실 / 결정 보류 / 호씨 기술검토 진행", "중립", "응웬 사장 가격 결정 대기"),
  a("act-12", "PROPOSAL_SENT",  "user-mock-1","김민수",     "acc-006","LMN DMC",            "deal-4","LMN 부산 시즌 패키지",
    undefined, undefined,        -4, 16, undefined, "부산 시즌 패키지 제안서 v3", "단가 인하 안 포함"),
  a("act-13", "MESSENGER",      "user-mock-1","김민수",     "acc-001","ABC Travel",         undefined, undefined,
    "ct-101","Nguyen Van Minh", -5, 11, undefined, "주말 인사", "주말 잘 보내세요"),
  a("act-14", "EMAIL_LOG",      "user-mock-1","김민수",     "acc-002","XYZ DMC",            "deal-3","XYZ DMC 일본 패키지",
    undefined, undefined,        -2, 17, undefined, "Q3 시즌성 패키지 제안 v2", "제안서 v2 발송"),
  a("act-15", "CALL",           "user-park",  "박지영",     "acc-013","Hana Tour",          undefined, undefined,
    "ct-1301","최영수",          -3, 14, 35, "분기 리뷰 전 통화", "최 전무 미팅 어젠다 협의"),
  a("act-16", "MEETING",        "user-park",  "박지영",     "acc-013","Hana Tour",          "deal-32","Hana Tour 분기 패키지",
    "ct-1302","김도현",          -4, 11, 75, "분기 패키지 협의", "5월 추가 발주 합의, 가격 조정 협상"),
  a("act-17", "EMAIL_LOG",      "user-nakamura","나카무라 켄지","acc-011","JTB Travel",     "deal-26","JTB 분기 호텔 공급",
    undefined, undefined,        -2, 10, undefined, "미팅 자료 사전 공유", "5/14 미팅용 호텔 리스트 전달"),
  a("act-18", "MEETING",        "user-nakamura","나카무라 켄지","acc-007","Tokyo Bridge",   undefined, undefined,
    "ct-701","Akiko Yamada",     -7, 14, 90, "재진입 시도 미팅", "결렬. Y GM 요구 조건 우리 마진 한계 초과", "부정", "분기말 재시도"),
  a("act-19", "CALL",           "user-linh",  "Linh Tran",  "acc-006","LMN DMC",            "deal-4","LMN 부산 시즌 패키지",
    "ct-601","Trang Vo",         -3, 16, 28, "계약 조건 협상", "위약금 조항 합의"),
  a("act-20", "MESSENGER",      "user-tan",   "Tan Wei Liang","acc-020","Lion Travel",     undefined, undefined,
    "ct-2001","Chen Yi-Ling",    -4, 10, undefined, "LINE 상품 사진 공유", "최신 호텔 사진 12장"),
  a("act-21", "MEETING",        "user-tan",   "Tan Wei Liang","acc-018","Chan Brothers",   "deal-25","Chan Brothers 동남아 묶음",
    "ct-1801","Lim Wei Ming",    -5, 11, 75, "패키지 컨셉 협의", "묶음 상품 컨셉 합의. 가격은 추후"),
  a("act-22", "PROPOSAL_SENT",  "user-mock-1","김민수",     "acc-010","Vietravel",          "deal-29","Vietravel 견적 v2",
    undefined, undefined,        -6, 15, undefined, "Vietravel 견적 v2 발송", "30개 호텔 묶음 제안"),
  a("act-23", "EMAIL_LOG",      "user-somchai","솜차이",    "acc-016","Asian Trails",       "deal-31","Asian Trails 인보이스 분쟁",
    undefined, undefined,        -2, 9, undefined, "6월 인보이스 재발행", "수정본 첨부"),
  a("act-24", "CALL",           "user-mock-1","김민수",     "acc-008","OPQ Wholesale",      "deal-5","OPQ Wholesale 5월 단발",
    "ct-801","Budi Santoso",     -5, 17, 15, "Follow-up 시도", "예산 검토 중. 5/20에 회신 약속"),
  a("act-25", "MEETING",        "user-tan",   "Tan Wei Liang","acc-021","Mayflower",       "deal-21","Mayflower 신규 거래",
    "ct-2101","Rajesh Kumar",    -6, 13, 65, "첫 미팅", "분기 거래 가능성 합의. 가격 비교 검토 중", "긍정", "1차 제안서 발송"),

  // === 8-30일 전 (20) ===
  a("act-26", "PROPOSAL_SENT",  "user-mock-1","김민수",     "acc-002","XYZ DMC",            "deal-3","XYZ DMC 일본 패키지",
    undefined, undefined,        -8, 16, undefined, "Q3 시즌성 패키지 제안 v1", "초안"),
  a("act-27", "MEETING",        "user-mock-1","김민수",     "acc-005","JKL Travel",         undefined, undefined,
    "ct-501","이재형",           -10, 10, 90, "첫 인사 미팅", "Q3 패키지 도입 의사 확인", "긍정"),
  a("act-28", "EMAIL_LOG",      "user-park",  "박지영",     "acc-014","Mode Tour",          undefined, undefined,
    "ct-1401","정민호",          -9, 14, undefined, "분기 갱신 의사 타진", "갱신 의사 있음. 일정 협의 요청"),
  a("act-29", "MEETING",        "user-nakamura","나카무라 켄지","acc-012","HIS Holdings",  "deal-27","HIS H2 패키지",
    "ct-1201","Daichi Suzuki",   -12, 11, 60, "H2 패키지 컨셉 미팅", "단가 협의 필요 — 시즌 가산 적용"),
  a("act-30", "CALL",           "user-mock-1","김민수",     "acc-001","ABC Travel",         undefined, undefined,
    "ct-101","Nguyen Van Minh",  -14, 10, 30, "분기 인사 콜", "Q2 마무리 + Q3 협의 시작"),
  a("act-31", "MEETING",        "user-linh",  "Linh Tran",  "acc-009","Saigontourist",     undefined, undefined,
    "ct-901","Bao Tran",         -15, 11, 60, "분기 영업 리뷰", "Q1 성과 점검, Q2 목표 합의"),
  a("act-32", "PROPOSAL_SENT",  "user-tan",   "Tan Wei Liang","acc-020","Lion Travel",     "deal-30","Lion Travel H2 갱신",
    undefined, undefined,        -11, 14, undefined, "H2 갱신 제안서", "전년 대비 +12%"),
  a("act-33", "EMAIL_LOG",      "user-mock-1","김민수",     "acc-015","여기어때",            "deal-34","여기어때 API 라이브",
    undefined, undefined,        -10, 15, undefined, "API 명세서 v2 전달", "기술팀 검토 요청"),
  a("act-34", "MEETING",        "user-mock-1","김민수",     "acc-015","여기어때",            "deal-34","여기어때 API 라이브",
    "ct-1502","한지훈",          -13, 14, 90, "API 기술 미팅", "scope 합의. 4주 통합 일정 협의"),
  a("act-35", "CALL",           "user-somchai","솜차이",     "acc-017","Panorama JTB",       "deal-24","Panorama JTB 발리 패키지",
    "ct-1701","Made Wirawan",    -9, 16, 25, "발리 패키지 협의", "여름 시즌 가격 협상 시작"),
  a("act-36", "MESSENGER",      "user-mock-1","김민수",     "acc-001","ABC Travel",         undefined, undefined,
    "ct-101","Nguyen Van Minh",  -16, 12, undefined, "Zalo 메시지", "다낭 신규 호텔 사진 공유"),
  a("act-37", "MEETING",        "user-park",  "박지영",     "acc-013","Hana Tour",         undefined, undefined,
    "ct-1301","최영수",          -18, 14, 60, "분기 정기 미팅", "Q1 마감 정산 + Q2 가이드"),
  a("act-38", "PROPOSAL_SENT",  "user-mock-1","김민수",     "acc-001","ABC Travel",        "deal-8","ABC Travel 2024 H2 객실",
    undefined, undefined,        -20, 10, undefined, "2024 H2 객실 공급 제안", "Won 처리됨"),
  a("act-39", "CONTRACT_SENT",  "user-mock-1","김민수",     "acc-001","ABC Travel",        "deal-8","ABC Travel 2024 H2 객실",
    undefined, undefined,        -12, 14, undefined, "공식 계약서 송부", "전자서명 진행"),
  a("act-40", "MEETING",        "user-nakamura","나카무라 켄지","acc-011","JTB Travel",    "deal-35","JTB 5월 단발 패키지",
    "ct-1101","Takeshi Kobayashi",-25, 11, 75, "5월 패키지 협의", "전체 합의"),
  a("act-41", "FOLLOW_UP",      "user-tan",   "Tan Wei Liang","acc-019","Rajah Travel",    "deal-22","Rajah Travel 첫 패키지",
    "ct-1901","Maria Santos",    -8, 16, undefined, "예산 확인 follow-up", "Q3 예산 책정 대기"),
  a("act-42", "INTERNAL_REQUEST","user-mock-1","김민수",    "acc-001","ABC Travel",         "deal-7","ABC Travel API 라이브",
    undefined, undefined,        -7, 14, undefined, "기술팀 일정 협조 요청", "이영준 → 김민수: 6/1 통합 가능"),
  a("act-43", "CUSTOMER_REQUEST","user-park", "박지영",     "acc-013","Hana Tour",          undefined, undefined,
    "ct-1303","이서현",          -6, 11, undefined, "정산 자료 요청", "5월분 부산권 호텔 정산 내역"),
  a("act-44", "NOTE",           "user-mock-1","김민수",     "acc-001","ABC Travel",        undefined, undefined,
    undefined, undefined,        -21, 15, undefined, "응웬 사장 가족 정보", "응웬 사장 큰딸 대학 합격 (한국 어학연수 계획)"),
  a("act-45", "MEETING",        "user-linh",  "Linh Tran",  "acc-006","LMN DMC",            undefined, undefined,
    "ct-601","Trang Vo",         -22, 10, 60, "분기 정기 미팅", "Q1 성과 합의"),
];

// ============================================================
// Tasks — 28건 (지연·오늘·이번주·다음주)
// ============================================================
export const MOCK_TASKS: Task[] = [
  // === 지연 (5) ===
  t("task-1",  "✉ 견적서 v3 발송 — ABC Travel",            "user-mock-1","acc-001","ABC Travel",        "deal-1","ABC Travel Q4 객실 공급", -1, "HIGH", "TODO", "EMAIL"),
  t("task-2",  "✍ 계약서 검토 회신 — LMN DMC",             "user-linh", "acc-006","LMN DMC",            "deal-4","LMN 부산 시즌 패키지",   -2, "MED",  "TODO", "EMAIL"),
  t("task-3",  "📞 API 일정 재공유 — ABC Travel",            "user-mock-1","acc-001","ABC Travel",        "deal-7","ABC Travel API 라이브", -3, "HIGH", "TODO", "CALL"),
  t("task-4",  "✉ 6월 인보이스 분쟁 회신 — Asian Trails",   "user-somchai","acc-016","Asian Trails",     "deal-31","Asian Trails 인보이스 분쟁", -2, "HIGH", "TODO", "EMAIL"),
  t("task-5",  "📝 Tokyo Bridge 분기말 재시도 검토",         "user-nakamura","acc-007","Tokyo Bridge",   undefined, undefined,                -5, "MED",  "TODO"),

  // === 오늘 (8) ===
  t("task-6",  "📞 견적 합의 통화 — ABC / 응웬",             "user-mock-1","acc-001","ABC Travel",        "deal-1","ABC Travel Q4 객실 공급",  0, "HIGH", "TODO", "CALL", 14),
  t("task-7",  "📅 사내 미팅 — Q3 패키지 검토",              "user-mock-1",undefined,undefined,           undefined,undefined,                  0, "MED",  "TODO", "MEETING", 16),
  t("task-8",  "✉ Q2 인보이스 회신 — JKL",                  "user-mock-1","acc-005","JKL Travel",       undefined, undefined,                  0, "MED",  "TODO", "EMAIL"),
  t("task-9",  "💬 카톡 응답 — Linh (ABC)",                  "user-mock-1","acc-001","ABC Travel",        undefined, undefined,                  0, "LOW",  "TODO", "MESSENGER"),
  t("task-10", "✍ 견적서 v3 검토 마무리",                    "user-mock-1","acc-001","ABC Travel",        "deal-1","ABC Travel Q4 객실 공급",  0, "HIGH", "TODO"),
  t("task-11", "📞 Hana Tour 정산 콜 — 박지영",              "user-park", "acc-013","Hana Tour",          undefined, undefined,                  0, "MED",  "TODO", "CALL", 11),
  t("task-12", "📅 HIS H2 패키지 후속 미팅 잡기",            "user-nakamura","acc-012","HIS Holdings",   "deal-27","HIS H2 패키지",             0, "HIGH", "TODO"),
  t("task-13", "📝 Mayflower 1차 제안서 작성",               "user-tan",  "acc-021","Mayflower",         "deal-21","Mayflower 신규 거래",       0, "HIGH", "TODO"),

  // === 이번 주 (10) ===
  t("task-14", "✉ 견적서 v3 발송 — ABC Travel",              "user-mock-1","acc-001","ABC Travel",        "deal-1","ABC Travel Q4 객실 공급",  1, "HIGH", "TODO", "EMAIL"),
  t("task-15", "📅 미팅 — Hanoi Skies (출장)",               "user-mock-1","acc-004","Hanoi Skies",      "deal-6","Hanoi Skies API 연동",      2, "HIGH", "TODO", "MEETING"),
  t("task-16", "📝 분기 거래 제안서 v1 — JKL",                "user-mock-1","acc-005","JKL Travel",       "deal-2","JKL 분기 거래 가능성",      3, "HIGH", "TODO"),
  t("task-17", "📞 OPQ Wholesale 미팅 잡기",                  "user-mock-1","acc-008","OPQ Wholesale",   undefined, undefined,                  2, "MED",  "TODO", "CALL"),
  t("task-18", "📅 JTB 분기 호텔 공급 미팅",                  "user-nakamura","acc-011","JTB Travel",    "deal-26","JTB 분기 호텔 공급",        3, "HIGH", "TODO", "MEETING"),
  t("task-19", "✍ Mode Tour 갱신 협상 어젠다",                "user-park", "acc-014","Mode Tour",         "deal-28","Mode Tour 분기 갱신",       4, "MED",  "TODO"),
  t("task-20", "✉ Vietravel 견적 보강 발송",                  "user-mock-1","acc-010","Vietravel",        "deal-29","Vietravel 견적 v2",        2, "MED",  "TODO", "EMAIL"),
  t("task-21", "📞 여기어때 API 일정 협의",                   "user-mock-1","acc-015","여기어때",         "deal-34","여기어때 API 라이브",       1, "HIGH", "TODO", "CALL"),
  t("task-22", "📅 Chan Brothers 후속 미팅",                  "user-tan",  "acc-018","Chan Brothers",    "deal-25","Chan Brothers 동남아 묶음", 5, "MED",  "TODO", "MEETING"),
  t("task-23", "✉ Lion Travel 가격 회신 — Tan",               "user-tan",  "acc-020","Lion Travel",      "deal-30","Lion Travel H2 갱신",       3, "MED",  "TODO", "EMAIL"),

  // === 다음주+ (5) ===
  t("task-24", "📅 부산 출장 — LMN + JKL 사후 미팅",          "user-mock-1","acc-005","JKL Travel",       undefined, undefined,                  9, "HIGH", "TODO", "MEETING"),
  t("task-25", "📝 Q3 OKR 초안 작성",                         "user-mock-1",undefined,undefined,           undefined, undefined,                 10, "MED",  "TODO"),
  t("task-26", "📞 Panorama JTB 발리 결정 협의 — 솜차이",     "user-somchai","acc-017","Panorama JTB",   "deal-24","Panorama JTB 발리 패키지", 8, "MED",  "TODO", "CALL"),
  t("task-27", "💬 Lvmama WeChat — Zhang Wei",                "user-zhang","acc-022","Lvmama",            "deal-23","Lvmama 재활성 시도",       7, "LOW",  "TODO", "MESSENGER"),
  t("task-28", "✍ 분기 회고 자료 준비",                       "user-mock-1",undefined,undefined,           undefined, undefined,                 12, "MED",  "TODO"),
];

function a(
  id: string, type: Activity["activityType"], userId: string, userName: string,
  accountId: string | undefined, accountName: string | undefined,
  dealId: string | undefined, dealName: string | undefined,
  contactId: string | undefined, contactName: string | undefined,
  daysAgo: number, hour: number, durationMinutes: number | undefined,
  subject: string | undefined, content: string | undefined,
  outcome?: string, nextAction?: string
): Activity {
  const d = new Date();
  d.setDate(d.getDate() + daysAgo);
  d.setHours(hour, 0, 0, 0);
  return {
    id, activityType: type, userId, userName, accountId, accountName, dealId, dealName,
    contactId, contactName, occurredAt: d.toISOString(),
    durationMinutes, subject, content, outcome, nextAction,
  };
}

function t(
  id: string, title: string, ownerUserId: string,
  relatedAccountId: string | undefined, relatedAccountName: string | undefined,
  relatedDealId: string | undefined, relatedDealName: string | undefined,
  daysFromToday: number, priority: Task["priority"], status: Task["status"],
  channel?: Task["channel"], hour?: number
): Task {
  let dueAt: string | undefined;
  if (daysFromToday !== undefined) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    if (hour !== undefined) d.setHours(hour, 0, 0, 0);
    dueAt = d.toISOString();
  }
  return {
    id, title, ownerUserId, relatedAccountId, relatedAccountName,
    relatedDealId, relatedDealName, dueAt, priority, status, channel,
  };
}
