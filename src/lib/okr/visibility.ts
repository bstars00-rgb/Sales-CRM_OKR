/**
 * 페르소나별 OKR / Critical 6 가시성 필터.
 *
 * 매트릭스:
 *
 * 페르소나 | 회사 OKR | 팀 OKR        | 다른 팀원 OKR  | 본인 OKR | 본인 C6 | 다른 사람 C6
 * --------|----------|----------------|----------------|----------|---------|--------------
 * MEMBER  | ✅       | ✅ (본인 팀)    | ❌             | ✅       | ✅      | ❌
 * MANAGER | ✅       | ✅ (본인 팀)    | ✅ (관리 팀원) | ✅       | ✅      | ✅ (관리 팀원)
 * DIRECTOR| ✅       | ✅ 전체        | ✅ 전체        | ✅       | ✅      | ✅ 전체
 * EXECUTIVE| ✅      | ✅ 전체        | ❌             | ❌       | ❌      | ❌
 *
 * KPI/매출/Brief 등 회사 전체 숫자는 별도 — 모든 페르소나 동일하게 봄.
 */

import type { SessionUser } from "@/lib/auth/types";
import type { Objective, Critical6Item } from "@/lib/mock/types";

/**
 * 페르소나가 볼 수 있는 Objective인지 판단.
 */
export function canSeeObjective(o: Objective, user: SessionUser): boolean {
  if (o.ownerKind === "COMPANY") return true;

  if (o.ownerKind === "TEAM") {
    switch (user.role) {
      case "EXECUTIVE":
      case "DIRECTOR":
        return true;
      case "MANAGER":
      case "MEMBER":
        return o.ownerId === user.teamId;
    }
  }

  // USER OKR
  switch (user.role) {
    case "EXECUTIVE":
      return false; // C레벨은 개인 OKR 안 봄
    case "DIRECTOR":
      return true;
    case "MANAGER":
      if (o.ownerId === user.id) return true;
      return (user.managedUserIds ?? []).includes(o.ownerId ?? "");
    case "MEMBER":
      return o.ownerId === user.id;
  }
}

/**
 * Critical 6 항목 가시성 — OKR과 동일한 매트릭스.
 */
export function canSeeCritical6(item: Critical6Item, user: SessionUser): boolean {
  // owner 없는 항목은 (옛 데이터) 회사 공통으로 간주 → 모두에게 표시
  if (!item.ownerUserId) {
    return user.role !== "EXECUTIVE"; // C레벨은 개인 단위 C6 안 봄
  }
  switch (user.role) {
    case "EXECUTIVE":
      return false;
    case "DIRECTOR":
      return true;
    case "MANAGER":
      if (item.ownerUserId === user.id) return true;
      return (user.managedUserIds ?? []).includes(item.ownerUserId);
    case "MEMBER":
      return item.ownerUserId === user.id;
  }
}

/** Objective 배열을 페르소나에 맞춰 필터. */
export function filterObjectivesForUser<T extends Objective>(objectives: T[], user: SessionUser): T[] {
  return objectives.filter((o) => canSeeObjective(o, user));
}

/** Critical 6 배열을 페르소나에 맞춰 필터. */
export function filterCritical6ForUser<T extends Critical6Item>(items: T[], user: SessionUser): T[] {
  return items.filter((c) => canSeeCritical6(c, user));
}

/** 페르소나가 OKR을 편집할 수 있는지 (본인 또는 관리 대상). */
export function canEditObjective(o: Objective, user: SessionUser): boolean {
  if (user.role === "DIRECTOR") return true;
  if (user.role === "EXECUTIVE") return false;
  // 회사·팀 OKR은 DIRECTOR만 편집 (이미 위에서 처리됨)
  if (o.ownerKind === "COMPANY" || o.ownerKind === "TEAM") return false;
  // USER OKR
  if (user.role === "MANAGER") {
    return o.ownerId === user.id || (user.managedUserIds ?? []).includes(o.ownerId ?? "");
  }
  return o.ownerId === user.id;
}
