import type { Activity, Task } from "./types";

export const MOCK_ACTIVITIES: Activity[] = [
  a("act-1", "MEETING", "user-mock-1", "김민수", "acc-001", "ABC Travel Holdings", "deal-1", "ABC Travel Q4 객실 공급",
    "ct-101", "Nguyen Van Minh", -2, 14, 60, "분기 가격 합의", "객실 단가 $94 합의. 8/1부터 공급 시작 가능",
    "긍정 — 8/1 공급 시작 합의", "견적서 v3 발송 (5/9까지)"),
  a("act-2", "EMAIL_LOG", "user-mock-1", "김민수", "acc-002", "XYZ DMC Japan", "deal-3", "XYZ DMC 일본 패키지",
    undefined, undefined, -1, 17, undefined, "Q3 시즌성 패키지 제안 v2", "제안서 v2 발송"),
  a("act-3", "MEETING", "user-mock-1", "김민수", "acc-001", "ABC Travel Holdings", undefined, undefined,
    undefined, undefined, -3, 9, 60, "사무실 미팅", "호치민 사무실 / 결정 보류 / 호씨 기술검토 진행", "중립", "응웬 사장 가격 결정 대기"),
  a("act-4", "MESSENGER", "user-mock-1", "김민수", "acc-001", "ABC Travel Holdings", undefined, undefined,
    "ct-101", "Nguyen Van Minh", -5, 11, undefined, "주말 인사", "주말 잘 보내세요"),
  a("act-5", "CALL", "user-mock-1", "김민수", "acc-005", "JKL Travel Korea", "deal-2", "JKL 분기 거래 가능성",
    "ct-401", "이재형", 0, 10, 22, "첫 통화", "결정권자 미팅 5/16 잡힘. Q3 패키지 관심도 높음", "긍정 — 미팅 일정 픽스", "분기 거래 제안서 v1 작성"),
  a("act-6", "PROPOSAL_SENT", "user-mock-1", "김민수", "acc-006", "LMN DMC Vietnam", "deal-4", "LMN 부산 시즌 패키지",
    undefined, undefined, -4, 16, undefined, "부산 시즌 패키지 제안서 v3", "단가 인하 안 포함"),
  a("act-7", "MEETING", "user-mock-1", "김민수", "acc-004", "Hanoi Skies", "deal-6", "Hanoi Skies API 연동",
    "ct-301", "Tuan Pham", -2, 11, 45, "API 협의", "API 단계 합의. IT팀 미팅 일정 잡기", "긍정", "결정권자 미팅 잡기"),
];

export const MOCK_TASKS: Task[] = [
  // 지연
  t("task-1", "✉ 견적서 v3 발송 — ABC Travel", "user-mock-1", "acc-001", "ABC Travel Holdings", "deal-1", "ABC Travel Q4 객실 공급",
    -1, "HIGH", "TODO", "EMAIL"),
  t("task-2", "✍ 계약서 검토 회신 — LMN DMC", "user-mock-1", "acc-006", "LMN DMC Vietnam", "deal-4", "LMN 부산 시즌 패키지",
    -2, "MED", "TODO", "EMAIL"),
  t("task-3", "📞 API 일정 재공유 — ABC Travel", "user-mock-1", "acc-001", "ABC Travel Holdings", "deal-7", "ABC Travel API 라이브",
    -3, "HIGH", "TODO", "CALL"),
  // 오늘
  t("task-4", "📞 견적 합의 통화 — ABC / 응웬", "user-mock-1", "acc-001", "ABC Travel Holdings", "deal-1", "ABC Travel Q4 객실 공급",
    0, "HIGH", "TODO", "CALL", 14),
  t("task-5", "📅 사내 미팅 — Q3 패키지 검토", "user-mock-1", undefined, undefined, undefined, undefined,
    0, "MED", "TODO", "MEETING", 16),
  t("task-6", "✉ Q2 인보이스 회신 — JKL", "user-mock-1", "acc-005", "JKL Travel Korea", undefined, undefined,
    0, "MED", "TODO", "EMAIL"),
  t("task-7", "💬 카톡 응답 — Linh (ABC)", "user-mock-1", "acc-001", "ABC Travel Holdings", undefined, undefined,
    0, "LOW", "TODO", "MESSENGER"),
  t("task-8", "✍ 견적서 v3 검토 마무리", "user-mock-1", "acc-001", "ABC Travel Holdings", "deal-1", "ABC Travel Q4 객실 공급",
    0, "HIGH", "TODO"),
  // 이번 주
  t("task-9", "✉ 견적서 v3 발송 — ABC Travel", "user-mock-1", "acc-001", "ABC Travel Holdings", "deal-1", "ABC Travel Q4 객실 공급",
    1, "HIGH", "TODO", "EMAIL"),
  t("task-10", "📅 미팅 — Hanoi Skies (출장)", "user-mock-1", "acc-004", "Hanoi Skies", "deal-6", "Hanoi Skies API 연동",
    2, "HIGH", "TODO", "MEETING"),
  t("task-11", "📝 분기 거래 제안서 v1 — JKL", "user-mock-1", "acc-005", "JKL Travel Korea", "deal-2", "JKL 분기 거래 가능성",
    3, "HIGH", "TODO"),
  t("task-12", "📞 OPQ Wholesale 미팅 잡기", "user-mock-1", "acc-008", "OPQ Wholesale Indonesia", undefined, undefined,
    2, "MED", "TODO", "CALL"),
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
