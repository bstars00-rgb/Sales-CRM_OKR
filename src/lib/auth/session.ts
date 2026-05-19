"use client";

import type { SessionUser, UserRole } from "./types";

const STORAGE_KEY = "sales-crm-session";

/**
 * 4 페르소나 mock 세션 카탈로그.
 * 패스워드는 mock 검증용 — ELLIS 통합 시 OAuth/SSO로 교체.
 */
export interface MockAccount {
  email: string;
  password: string;
  user: SessionUser;
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  // 팀원 — 김민수 (Korea, KR/VN 담당)
  {
    email: "member@demo.com",
    password: "demo1234",
    user: {
      id: "user-mock-1",
      orgId: "00000000-0000-0000-0000-000000000001",
      teamId: "team-kr",
      role: "MEMBER",
      name: "김민수",
      email: "member@demo.com",
      jobTitle: "Sales (Korea Team)",
      locale: "ko",
      timezone: "Asia/Seoul",
      countries: ["KR", "VN"],
    },
  },
  // 매니저 — 박지영 (Korea Team Manager, 4명 관리)
  {
    email: "manager@demo.com",
    password: "demo1234",
    user: {
      id: "user-park",
      orgId: "00000000-0000-0000-0000-000000000001",
      teamId: "team-kr",
      role: "MANAGER",
      name: "박지영",
      email: "manager@demo.com",
      jobTitle: "Korea Team Manager",
      locale: "ko",
      timezone: "Asia/Seoul",
      countries: ["KR"],
      managedUserIds: ["user-mock-1", "user-lee", "user-choi", "user-hana"],
    },
  },
  // 디렉터 (HEAD) — 박상무 (Sales Head, 전체)
  {
    email: "director@demo.com",
    password: "demo1234",
    user: {
      id: "user-director",
      orgId: "00000000-0000-0000-0000-000000000001",
      teamId: null,
      role: "DIRECTOR",
      name: "박상무",
      email: "director@demo.com",
      jobTitle: "Head of Sales",
      locale: "ko",
      timezone: "Asia/Seoul",
      countries: ["KR", "VN", "JP", "TH", "SG"],
    },
  },
  // C레벨 — 정대표
  {
    email: "ceo@demo.com",
    password: "demo1234",
    user: {
      id: "user-ceo",
      orgId: "00000000-0000-0000-0000-000000000001",
      teamId: null,
      role: "EXECUTIVE",
      name: "정대표",
      email: "ceo@demo.com",
      jobTitle: "CEO",
      locale: "ko",
      timezone: "Asia/Seoul",
    },
  },
];

export function getMockSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setMockSession(user: SessionUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearMockSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * 이메일 + 패스워드로 mock 인증.
 * - MOCK_ACCOUNTS 매칭 시 해당 사용자 반환
 * - 매칭 안 됨 + 패스워드 "demo1234" 시 이메일 기반 추론 사용자 반환 (자유 로그인)
 * - 그 외 실패
 */
export function authenticateMock(email: string, password: string): SessionUser | null {
  const e = email.toLowerCase().trim();
  const known = MOCK_ACCOUNTS.find((a) => a.email === e);
  if (known) {
    return known.password === password ? known.user : null;
  }
  // 자유 로그인 — 공통 패스워드만 통과
  if (password !== "demo1234") return null;
  return buildSessionFromEmail(e);
}

export function inferRoleFromEmail(email: string): UserRole {
  const e = email.toLowerCase();
  if (e.startsWith("ceo@") || e.includes("ceo")) return "EXECUTIVE";
  if (e.startsWith("director@") || e.includes("head") || e.includes("director")) return "DIRECTOR";
  if (e.startsWith("manager@") || e.includes("manager")) return "MANAGER";
  return "MEMBER";
}

export function buildSessionFromEmail(email: string, name?: string): SessionUser {
  const role = inferRoleFromEmail(email);
  return {
    id: `user-${email.split("@")[0]}`,
    orgId: "00000000-0000-0000-0000-000000000001",
    teamId: role === "EXECUTIVE" || role === "DIRECTOR" ? null : "team-kr",
    role,
    name: name ?? email.split("@")[0],
    email,
    jobTitle:
      role === "EXECUTIVE" ? "Executive"
      : role === "DIRECTOR" ? "Director"
      : role === "MANAGER" ? "Manager"
      : "Sales Member",
    locale: "ko",
    timezone: "Asia/Seoul",
  };
}
