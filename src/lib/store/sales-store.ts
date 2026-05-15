"use client";

import { useSyncExternalStore } from "react";
import { MOCK_ACTIVITIES, MOCK_TASKS } from "../mock/activities";
import { MOCK_DEALS, MOCK_STAGES } from "../mock/deals";
import { MOCK_CRITICAL_6 } from "../mock/kpi";
import type { Activity, Task, Deal, Critical6Item } from "../mock/types";

/**
 * Lightweight reactive store — useSyncExternalStore 기반.
 * MOCK 배열을 직접 mutate하고 version을 bump해서 구독 컴포넌트가 재렌더링하게 한다.
 *
 * 컴포넌트 사용:
 *   const version = useSalesVersion();
 *   const sim = useMemo(() => computeIncentive(uid), [version, uid]);
 */

const listeners = new Set<() => void>();
let version = 0;

function bump() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): number {
  return version;
}

export function useSalesVersion(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

// ============================================================
// Activities
// ============================================================
export function addActivity(input: Omit<Activity, "id" | "occurredAt"> & { occurredAt?: string }): Activity {
  const a: Activity = {
    id: `act-new-${Date.now()}`,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    ...input,
  };
  MOCK_ACTIVITIES.unshift(a);
  // 연결된 account의 last_activity_at 갱신 (트리거 시뮬)
  if (a.accountId) {
    // mock account의 lastActivityAt도 업데이트하면 좋지만, 여기선 store가 최소 침습으로
  }
  bump();
  return a;
}

// ============================================================
// Tasks
// ============================================================
export function toggleTask(taskId: string): Task | null {
  const t = MOCK_TASKS.find((x) => x.id === taskId);
  if (!t) return null;
  t.status = t.status === "DONE" ? "TODO" : "DONE";
  if (t.status === "DONE") t.completedAt = new Date().toISOString();
  bump();
  return t;
}

// ============================================================
// Deals — 단계 이동 / Win / Lost
// ============================================================
export function moveDealStage(dealId: string, toStageId: string): Deal | null {
  const d = MOCK_DEALS.find((x) => x.id === dealId);
  if (!d) return null;
  const stage = MOCK_STAGES.find((s) => s.id === toStageId);
  if (!stage) return null;

  d.stageId = toStageId;
  d.stageName = stage.name;
  d.stageOrder = stage.orderNo;
  d.daysInStage = 0;
  if (stage.stageKind === "WON") {
    d.outcome = "WON";
    d.probabilityPct = 100;
  } else if (stage.stageKind === "LOST") {
    d.outcome = "LOST";
    d.probabilityPct = 0;
  } else {
    d.outcome = "OPEN";
  }

  // 연결된 Critical 6 자동 done 처리
  autoMarkLinkedC6Done(dealId);

  bump();
  return d;
}

export function markDealWon(dealId: string, winReason: string): Deal | null {
  const d = MOCK_DEALS.find((x) => x.id === dealId);
  if (!d) return null;
  d.outcome = "WON";
  d.stageId = "stg-9";
  d.stageName = "Won";
  d.stageOrder = 9;
  d.probabilityPct = 100;
  d.winReasonCode = winReason;

  autoMarkLinkedC6Done(dealId);
  bump();
  return d;
}

export function markDealLost(dealId: string, lostReason: string): Deal | null {
  const d = MOCK_DEALS.find((x) => x.id === dealId);
  if (!d) return null;
  d.outcome = "LOST";
  d.stageId = "stg-10";
  d.stageName = "Lost";
  d.stageOrder = 10;
  d.probabilityPct = 0;
  d.lostReasonCode = lostReason;
  bump();
  return d;
}

// ============================================================
// Critical 6
// ============================================================
function autoMarkLinkedC6Done(dealId: string): boolean {
  let changed = false;
  for (const item of MOCK_CRITICAL_6) {
    if (item.linkedDealId === dealId && !item.done) {
      item.done = true;
      changed = true;
    }
  }
  return changed;
}

export function toggleCriticalSix(idx: number): boolean {
  const item = MOCK_CRITICAL_6[idx];
  if (!item) return false;
  item.done = !item.done;
  bump();
  return item.done;
}

export function replaceCriticalSix(items: Critical6Item[]): void {
  MOCK_CRITICAL_6.splice(0, MOCK_CRITICAL_6.length, ...items);
  bump();
}

