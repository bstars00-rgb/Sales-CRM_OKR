/**
 * 사용자 페르소나 4종 — 호텔 B2B 영업 조직 구조 기반.
 *
 * - MEMBER    팀원: 실제 영업 활동 담당. 회사+팀 OKR, 본인 OKR/C6 관리.
 * - MANAGER   매니저: 본인 + 관리 팀원의 OKR/C6 관리. 코칭/1on1.
 * - DIRECTOR  디렉터(HEAD): 전체 OKR/C6 + 모든 운영 권한.
 * - EXECUTIVE C레벨: 회사·팀 OKR만 봄 (개인 OKR/C6는 보지 않음).
 *
 * 모든 페르소나는 KPI/매출/Brief 등 회사 전체 숫자는 동일하게 봄.
 */

export type UserRole = "MEMBER" | "MANAGER" | "DIRECTOR" | "EXECUTIVE";

export interface SessionUser {
  id: string;
  orgId: string;
  teamId: string | null;
  role: UserRole;
  name: string;
  email: string;
  jobTitle?: string;
  locale: string;
  timezone: string;
  countries?: string[];
  /** 이 사용자가 직접 관리하는 팀원의 userId 목록. MANAGER일 때 의미. */
  managedUserIds?: string[];
}

export const ROLE_LABEL: Record<UserRole, string> = {
  MEMBER:    "팀원",
  MANAGER:   "매니저",
  DIRECTOR:  "디렉터",
  EXECUTIVE: "C레벨",
};

export const ROLE_DESCRIPTION: Record<UserRole, string> = {
  MEMBER:    "회사·팀 OKR 보기 / 본인 OKR·Critical 6 관리",
  MANAGER:   "본인 + 관리 팀원의 OKR·Critical 6 관리 / 코칭·1on1",
  DIRECTOR:  "전체 OKR·Critical 6 + 모든 운영 권한",
  EXECUTIVE: "회사·팀 OKR 열람 (개인 OKR·C6 비공개)",
};
