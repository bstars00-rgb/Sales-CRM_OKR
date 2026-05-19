"use client";

import { useEffect, useState } from "react";
import { getMockSession } from "./session";
import type { SessionUser } from "./types";

/** 클라이언트 사이드에서 현재 세션 사용자를 안전하게 가져오는 hook.
 *  hydration mismatch 회피를 위해 마운트 후 상태 갱신. */
export function useSession(): SessionUser | null {
  const [session, setSession] = useState<SessionUser | null>(null);
  useEffect(() => {
    setSession(getMockSession());
  }, []);
  return session;
}
