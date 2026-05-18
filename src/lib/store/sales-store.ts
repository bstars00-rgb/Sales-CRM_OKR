"use client";

import { useSyncExternalStore } from "react";
import { MOCK_ACTIVITIES, MOCK_TASKS } from "../mock/activities";
import { MOCK_DEALS, MOCK_STAGES } from "../mock/deals";
import { MOCK_ACCOUNTS } from "../mock/accounts";
import { MOCK_CRITICAL_6 } from "../mock/kpi";
import type { Activity, Task, Deal, Account, Critical6Item } from "../mock/types";
import { recordAudit } from "./audit-log";

// 현재 시연 액터 (auth 통합 전 mock 기본값)
const DEFAULT_ACTOR = { id: "user-mock-1", name: "김민수" };

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

let idCounter = 0;
function uniqueId(prefix: string): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
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
    id: uniqueId("act-new"),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    ...input,
  };
  MOCK_ACTIVITIES.unshift(a);
  // 연결된 account의 last_activity_at 갱신 (트리거 시뮬)
  if (a.accountId) {
    // mock account의 lastActivityAt도 업데이트하면 좋지만, 여기선 store가 최소 침습으로
  }
  recordAudit({
    action: "ACTIVITY_ADD",
    actorId: a.userId, actorName: a.userName,
    refType: "activity", refId: a.id,
    summary: `${a.activityType} 활동 기록${a.accountName ? ` (${a.accountName})` : ""}`,
    meta: { subject: a.subject, durationMinutes: a.durationMinutes },
  });
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
  recordAudit({
    action: "TASK_TOGGLE",
    actorId: DEFAULT_ACTOR.id, actorName: DEFAULT_ACTOR.name,
    refType: "task", refId: t.id,
    summary: `태스크 ${t.status === "DONE" ? "완료" : "미완료"}: ${t.title}`,
  });
  bump();
  return t;
}

export function addTask(input: Omit<Task, "id" | "status"> & { status?: Task["status"] }): Task {
  const t: Task = {
    id: uniqueId("task-new"),
    status: input.status ?? "TODO",
    ...input,
  };
  MOCK_TASKS.unshift(t);
  recordAudit({
    action: "TASK_ADD",
    actorId: DEFAULT_ACTOR.id, actorName: DEFAULT_ACTOR.name,
    refType: "task", refId: t.id,
    summary: `태스크 추가: ${t.title}`,
    meta: { priority: t.priority, channel: t.channel },
  });
  bump();
  return t;
}

export function deleteTask(taskId: string): boolean {
  const idx = MOCK_TASKS.findIndex((x) => x.id === taskId);
  if (idx < 0) return false;
  const t = MOCK_TASKS[idx];
  MOCK_TASKS.splice(idx, 1);
  recordAudit({
    action: "TASK_DELETE",
    actorId: DEFAULT_ACTOR.id, actorName: DEFAULT_ACTOR.name,
    refType: "task", refId: t.id,
    summary: `태스크 삭제: ${t.title}`,
  });
  bump();
  return true;
}

// ============================================================
// Deals — 단계 이동 / Win / Lost
// ============================================================
export function updateDeal(
  dealId: string,
  patch: Partial<Pick<Deal, "amount" | "expectedCloseDate" | "expectedGp" | "probabilityPct" | "name">>
): Deal | null {
  const d = MOCK_DEALS.find((x) => x.id === dealId);
  if (!d) return null;
  const before = { amount: d.amount, expectedCloseDate: d.expectedCloseDate };
  Object.assign(d, patch);
  recordAudit({
    action: "DEAL_UPDATE",
    actorId: d.ownerUserId, actorName: d.ownerName,
    refType: "deal", refId: d.id,
    summary: `딜 업데이트: ${d.name}`,
    meta: { before, patch },
  });
  bump();
  return d;
}

export function moveDealStage(dealId: string, toStageId: string): Deal | null {
  const d = MOCK_DEALS.find((x) => x.id === dealId);
  if (!d) return null;
  const stage = MOCK_STAGES.find((s) => s.id === toStageId);
  if (!stage) return null;

  const fromStageName = d.stageName;
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

  recordAudit({
    action: "DEAL_STAGE_MOVE",
    actorId: d.ownerUserId, actorName: d.ownerName,
    refType: "deal", refId: d.id,
    summary: `딜 단계 이동: ${d.name} (${fromStageName} → ${stage.name})`,
    meta: { from: fromStageName, to: stage.name, outcome: d.outcome },
  });
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
  recordAudit({
    action: "DEAL_WON",
    actorId: d.ownerUserId, actorName: d.ownerName,
    refType: "deal", refId: d.id,
    summary: `🏆 딜 Win: ${d.name} (${d.amount.toLocaleString()}원)`,
    meta: { winReason, amount: d.amount },
  });
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
  recordAudit({
    action: "DEAL_LOST",
    actorId: d.ownerUserId, actorName: d.ownerName,
    refType: "deal", refId: d.id,
    summary: `❌ 딜 Lost: ${d.name}`,
    meta: { lostReason, amount: d.amount },
  });
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
  recordAudit({
    action: "C6_TOGGLE",
    actorId: DEFAULT_ACTOR.id, actorName: DEFAULT_ACTOR.name,
    refType: "critical6", refId: `c6-${idx}`,
    summary: `Critical 6 ${item.done ? "완료" : "되돌림"}: ${item.title}`,
  });
  bump();
  return item.done;
}

// ============================================================
// Accounts (CSV 가져오기용 — 최소 mutator)
// ============================================================
export function addAccounts(rows: Account[]): { added: number; skipped: number } {
  let added = 0;
  let skipped = 0;
  for (const a of rows) {
    if (MOCK_ACCOUNTS.find((x) => x.id === a.id)) {
      skipped++;
      continue;
    }
    MOCK_ACCOUNTS.unshift(a);
    added++;
  }
  if (added > 0) {
    recordAudit({
      action: "ACTIVITY_ADD",  // 별도 action 추가하면 좋지만 일단 재사용
      actorId: DEFAULT_ACTOR.id, actorName: DEFAULT_ACTOR.name,
      refType: "activity", refId: `import-${Date.now()}`,
      summary: `CSV 가져오기: 고객사 ${added}개 추가 (${skipped}개 중복 스킵)`,
      meta: { added, skipped },
    });
    bump();
  }
  return { added, skipped };
}

export function replaceCriticalSix(items: Critical6Item[]): void {
  MOCK_CRITICAL_6.splice(0, MOCK_CRITICAL_6.length, ...items);
  recordAudit({
    action: "C6_REPLACE",
    actorId: DEFAULT_ACTOR.id, actorName: DEFAULT_ACTOR.name,
    refType: "critical6", refId: "c6-week",
    summary: `Critical 6 일괄 교체 (${items.length}건)`,
  });
  bump();
}

