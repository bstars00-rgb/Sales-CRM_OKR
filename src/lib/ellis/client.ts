"use client";

/**
 * ELLIS 어드민/백엔드 시스템의 REST API 어댑터.
 *
 * 책임:
 * - 인증 헤더 자동 주입 (Supabase Auth 토큰 기반 또는 ELLIS API 키)
 * - 베이스 URL 관리
 * - 응답을 우리 도메인 타입으로 변환 (mapper에서)
 *
 * 호출자가 fetch 직접 쓰지 말고 이 모듈 통해서만 ELLIS와 통신.
 */

const BASE_URL = process.env.NEXT_PUBLIC_ELLIS_API_URL ?? "";

export class EllisError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = "EllisError";
  }
}

export interface EllisRequestInit extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

export function isEllisConfigured(): boolean {
  return Boolean(BASE_URL);
}

async function getAuthToken(): Promise<string | null> {
  // TODO: Supabase Auth 세션의 access_token, 또는 별도 ELLIS API key 결정 후 구현
  // 임시: localStorage에서 'ellis-token' 읽기
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("ellis-token");
  } catch {
    return null;
  }
}

export async function ellisFetch<T = unknown>(
  path: string,
  init: EllisRequestInit = {}
): Promise<T> {
  if (!BASE_URL) {
    throw new EllisError(0, "ELLIS API URL 미설정 (NEXT_PUBLIC_ELLIS_API_URL)");
  }

  const url = new URL(path.startsWith("/") ? path : `/${path}`, BASE_URL);
  if (init.query) {
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const token = await getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url.toString(), {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: init.cache ?? "no-store",
    signal: init.signal,
  });

  if (!res.ok) {
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new EllisError(res.status, `ELLIS ${res.status}: ${res.statusText}`, body);
  }

  return (await res.json()) as T;
}
