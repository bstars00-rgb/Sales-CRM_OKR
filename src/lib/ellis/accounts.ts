"use client";

/**
 * ELLIS 고객사(account) API 어댑터.
 *
 * 실 endpoint는 ELLIS API 스펙 확정 후 mapper 작성.
 * 지금은 인터페이스만 — 실 통합 시점에 ellisFetch 호출로 교체.
 */

import { ellisFetch } from "./client";
import type { Account } from "@/lib/mock/types";

export interface EllisAccountQuery {
  ownerUserId?: string;
  countryCode?: string;
  grade?: string;
  status?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export async function fetchAccounts(query: EllisAccountQuery = {}): Promise<Account[]> {
  // TODO: ELLIS API 스펙 확정 후 endpoint·필드 매핑 구현
  // 예시:
  // const raw = await ellisFetch<EllisAccountRow[]>("/api/accounts", { query });
  // return raw.map(mapEllisAccount);
  throw new Error("ELLIS accounts adapter not implemented yet");
}

export async function fetchAccountById(id: string): Promise<Account | null> {
  // TODO
  throw new Error("ELLIS accounts.fetchAccountById not implemented yet");
}

// === 매핑 ===
// ELLIS 응답 형식 ↔ 우리 Account 타입 변환은 ELLIS 스펙 확보 후 채움.
