"use client";

/**
 * ELLIS 매출 동기화 어댑터 — 매일 체크아웃 기준 자동 갱신.
 *
 * 운영 정책 (ELLIS 연동 후):
 * ─────────────────────────────────────────────────────────────
 * 1. ELLIS 서버에서 매일 04:00 KST 전일 체크아웃 데이터 집계 (cron)
 *    → 일별 metrics 테이블에 누적 저장
 *
 * 2. 클라이언트는 페이지 로드 시 `GET /metrics/ytd?asOf=YYYY-MM-DD` 호출
 *    → asOf는 최신 동기화일 (보통 전일까지 — 당일은 체크아웃 미확정)
 *
 * 3. lastSyncedAt timestamp를 응답 헤더 또는 body에 포함
 *    → UI에 "데이터 기준: 5월 18일 체크아웃까지 (오늘 04:00 갱신)" 표시
 *
 * 4. ELLIS 미연동 (현재) 시 mock 데이터 fallback
 *    → asOf = 오늘 자정 - 1일 (전일 체크아웃까지 가정)
 *
 * 5. 사용자가 [↻ 새로고침] 클릭 시 강제 재계산 (캐시 무효화)
 *    → 운영 단계에선 5분 캐시 + 강제 refresh 옵션 권장
 *
 * Endpoint 명세 (ELLIS 측 구현 대기):
 *   GET /api/v1/metrics/ytd
 *     ?asOf=2026-05-18    # 체크아웃 기준일 (생략 시 latest)
 *     ?userId=user-xxx    # 본인 담당만 (DIRECTOR/EXEC는 생략)
 *
 *   Response:
 *   {
 *     asOf: "2026-05-18",
 *     syncedAt: "2026-05-19T04:00:12+09:00",
 *     metrics: {
 *       ttv: { current: 1234567890, lastYear: 987654321, annualTarget: ... },
 *       revenue: { ... },
 *       margin: { ... },
 *       bookings: { ... },
 *       roomNights: { ... }
 *     }
 *   }
 */

import { ellisFetch, isEllisConfigured } from "./client";
import type { KpiSnapshot, KpiContext } from "@/lib/dashboard/ytd-kpi";
import { computeYtdKpi } from "@/lib/dashboard/ytd-kpi";

export interface KpiSyncResult {
  asOf: string;              // YYYY-MM-DD — 체크아웃 데이터가 반영된 마지막 날짜
  syncedAt: string;          // ISO — 마지막 동기화 시각
  source: "ELLIS" | "MOCK";  // 데이터 출처
  metrics: KpiSnapshot[];
}

interface EllisMetricsResponse {
  asOf: string;
  syncedAt: string;
  metrics: KpiSnapshot[];
}

/**
 * 5종 YTD KPI를 ELLIS에서 fetch — 미설정 시 mock fallback.
 */
export async function syncYtdKpi(ctx: KpiContext): Promise<KpiSyncResult> {
  if (isEllisConfigured()) {
    try {
      const res = await ellisFetch<EllisMetricsResponse>("/api/v1/metrics/ytd", {
        query: { userId: ctx.userId },
      });
      return {
        asOf: res.asOf,
        syncedAt: res.syncedAt,
        source: "ELLIS",
        metrics: res.metrics,
      };
    } catch (err) {
      // 네트워크/auth 실패 시 mock으로 fallback (개발 환경 친화)
      console.warn("[ELLIS] metrics/ytd fetch 실패 — mock fallback:", err);
    }
  }

  // Mock 동기화 — 전일을 asOf로 간주
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const asOf = yesterday.toISOString().slice(0, 10);

  // 매일 04:00 KST 동기화 시뮬: 오늘 04:00 또는 어제 04:00 (현재 시각에 따라)
  const todaySync = new Date(now);
  todaySync.setHours(4, 0, 0, 0);
  const syncedAt = now >= todaySync ? todaySync.toISOString() : new Date(todaySync.getTime() - 86400000).toISOString();

  return {
    asOf,
    syncedAt,
    source: "MOCK",
    metrics: computeYtdKpi(ctx, yesterday),
  };
}

/**
 * "데이터 기준일"을 한국어 친화적으로 포맷.
 * 예: "5월 18일 체크아웃까지 (오늘 04:00 동기화)"
 */
export function formatAsOf(result: KpiSyncResult): string {
  const asOfDate = new Date(result.asOf);
  const sync = new Date(result.syncedAt);
  const md = `${asOfDate.getMonth() + 1}월 ${asOfDate.getDate()}일`;

  const now = new Date();
  const sameDay = sync.toDateString() === now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000);
  const wasYesterday = sync.toDateString() === yesterday.toDateString();

  const syncWhen =
    sameDay ? `오늘 ${sync.getHours().toString().padStart(2, "0")}:${sync.getMinutes().toString().padStart(2, "0")}`
    : wasYesterday ? `어제 ${sync.getHours().toString().padStart(2, "0")}:${sync.getMinutes().toString().padStart(2, "0")}`
    : sync.toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return `${md} 체크아웃까지 · ${syncWhen} 동기화`;
}
