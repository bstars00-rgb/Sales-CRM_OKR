"use client";

import type { SessionUser, UserRole } from "./types";

const STORAGE_KEY = "sales-crm-session";

const DEFAULT_USER: SessionUser = {
  id: "user-mock-1",
  orgId: "00000000-0000-0000-0000-000000000001",
  teamId: "team-korea",
  role: "SALES_MANAGER",
  name: "김민수",
  email: "kim@demo.com",
  jobTitle: "Sales Manager",
  locale: "ko",
  timezone: "Asia/Seoul",
  countries: ["KR", "VN"],
};

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

export function inferRoleFromEmail(email: string): UserRole {
  const e = email.toLowerCase();
  if (e.startsWith("ceo@") || e.startsWith("admin@")) return "SUPER_ADMIN";
  if (e.startsWith("lead@") || e.includes("lead")) return "SALES_LEAD";
  if (e.startsWith("collab@") || e.includes("ops")) return "COLLABORATOR";
  return "SALES_MANAGER";
}

export function buildSessionFromEmail(email: string, name?: string): SessionUser {
  const role = inferRoleFromEmail(email);
  return {
    ...DEFAULT_USER,
    id: `user-${email.split("@")[0]}`,
    email,
    name: name ?? email.split("@")[0],
    role,
    jobTitle:
      role === "SUPER_ADMIN"
        ? "CEO"
        : role === "SALES_LEAD"
        ? "팀장"
        : role === "COLLABORATOR"
        ? "Operations"
        : "Sales Manager",
  };
}
