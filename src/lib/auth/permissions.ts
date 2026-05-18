/**
 * 역할 기반 권한 매트릭스 — 코드 안에서만 사용되던 권한을 명세화.
 *
 * 4개 역할 × 핵심 영역의 권한 정의:
 * - read  : 보기
 * - write : 본인 데이터 편집
 * - admin : 타인 데이터·시스템 편집
 *
 * UI에서 변경 가능하지만 실제 적용은 ELLIS 통합 시. 현재는 표시·검증용.
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
}

export const DEFAULT_PERMISSIONS: Record<UserRole, PermissionMatrix> = {
  SUPER_ADMIN: {
    accounts: "admin", deals: "admin", activities: "admin", okr: "admin",
    brief: "admin", team_brief: "admin", company_brief: "admin",
    incentive_rules: "admin", audit_log: "admin", org_settings: "admin",
  },
  SALES_LEAD: {
    accounts: "admin", deals: "admin", activities: "admin", okr: "write",
    brief: "write", team_brief: "admin", company_brief: "read",
    incentive_rules: "write", audit_log: "read", org_settings: "none",
  },
  SALES_MANAGER: {
    accounts: "write", deals: "write", activities: "write", okr: "write",
    brief: "write", team_brief: "read", company_brief: "none",
    incentive_rules: "read", audit_log: "none", org_settings: "none",
  },
  COLLABORATOR: {
    accounts: "read", deals: "read", activities: "write", okr: "read",
    brief: "read", team_brief: "none", company_brief: "none",
    incentive_rules: "none", audit_log: "none", org_settings: "none",
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
};
