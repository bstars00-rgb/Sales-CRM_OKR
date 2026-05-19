/**
 * 역할 기반 권한 매트릭스 — 4 페르소나.
 *
 * - read  : 보기
 * - write : 본인 데이터 편집
 * - admin : 타인 데이터·시스템 편집
 *
 * UI에서 표시·검증용. 실제 적용은 ELLIS 통합 시.
 */

import type { UserRole } from "./types";

export type Permission = "read" | "write" | "admin" | "none";

export interface PermissionMatrix {
  accounts: Permission;
  deals: Permission;
  activities: Permission;
  okr: Permission;
  brief: Permission;
  team_brief: Permission;
  company_brief: Permission;
  incentive_rules: Permission;
  audit_log: Permission;
  org_settings: Permission;
  one_on_one: Permission;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, PermissionMatrix> = {
  // 팀원 — 본인 영역만 편집, 회사·팀 데이터는 보기
  MEMBER: {
    accounts: "write", deals: "write", activities: "write", okr: "write",
    brief: "write", team_brief: "read", company_brief: "read",
    incentive_rules: "read", audit_log: "none", org_settings: "none",
    one_on_one: "none",
  },
  // 매니저 — 본인 + 관리 팀원 데이터 편집, 팀 보고서 관리
  MANAGER: {
    accounts: "write", deals: "write", activities: "write", okr: "write",
    brief: "write", team_brief: "admin", company_brief: "read",
    incentive_rules: "read", audit_log: "read", org_settings: "none",
    one_on_one: "admin",
  },
  // 디렉터 — 전체 admin
  DIRECTOR: {
    accounts: "admin", deals: "admin", activities: "admin", okr: "admin",
    brief: "admin", team_brief: "admin", company_brief: "admin",
    incentive_rules: "admin", audit_log: "admin", org_settings: "admin",
    one_on_one: "admin",
  },
  // C레벨 — 보고서·회사/팀 OKR 열람 (실행 책임 없음)
  EXECUTIVE: {
    accounts: "read", deals: "read", activities: "read", okr: "read",
    brief: "read", team_brief: "read", company_brief: "read",
    incentive_rules: "read", audit_log: "read", org_settings: "none",
    one_on_one: "none",
  },
};

export const PERMISSION_LABEL: Record<Permission, { label: string; tone: "success" | "warning" | "muted" | "destructive" }> = {
  admin: { label: "관리",   tone: "success" },
  write: { label: "편집",   tone: "warning" },
  read:  { label: "보기",   tone: "muted" },
  none:  { label: "없음",   tone: "destructive" },
};

export const RESOURCE_LABEL: Record<keyof PermissionMatrix, string> = {
  accounts:        "고객사",
  deals:           "딜",
  activities:      "활동",
  okr:             "OKR",
  brief:           "내 주간보고",
  team_brief:      "팀 주간보고",
  company_brief:   "회사 주간보고",
  incentive_rules: "인센티브 룰",
  audit_log:       "감사 로그",
  org_settings:    "조직 설정",
  one_on_one:      "1on1 노트",
};

/** 페르소나가 특정 리소스에 가진 권한 조회 */
export function hasPermission(role: UserRole, resource: keyof PermissionMatrix, level: Permission): boolean {
  const order: Record<Permission, number> = { none: 0, read: 1, write: 2, admin: 3 };
  const got = DEFAULT_PERMISSIONS[role][resource];
  return order[got] >= order[level];
}
