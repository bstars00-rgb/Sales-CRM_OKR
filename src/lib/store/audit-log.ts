"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "sales-crm-audit-log";
const MAX_ENTRIES = 500;

export type AuditAction =
  | "ACTIVITY_ADD"
  | "TASK_ADD" | "TASK_TOGGLE" | "TASK_DELETE"
  | "DEAL_UPDATE" | "DEAL_STAGE_MOVE" | "DEAL_WON" | "DEAL_LOST"
  | "C6_TOGGLE" | "C6_REPLACE";

export interface AuditEntry {
  id: string;
  ts: string;            // ISO timestamp
  action: AuditAction;
  actorId: string;       // userId
  actorName: string;
  refType: "activity" | "task" | "deal" | "critical6";
  refId: string;
  summary: string;       // human readable
  meta?: Record<string, unknown>;
}

let entries: AuditEntry[] = [];
let hydrated = false;
let snap = 0;
const listeners = new Set<() => void>();
let counter = 0;

function load() {
  if (typeof window === "undefined" || hydrated) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) entries = JSON.parse(raw) as AuditEntry[];
  } catch {}
  hydrated = true;
}

function save() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

function notify() {
  snap++;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): number {
  return snap;
}

/** Component 외부에서 호출 가능 — sales-store mutator에서 직접 호출 */
export function recordAudit(input: Omit<AuditEntry, "id" | "ts">): void {
  load();
  counter++;
  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${counter}`,
    ts: new Date().toISOString(),
    ...input,
  };
  entries.unshift(entry);
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  save();
  notify();
}

export function useAuditLog() {
  useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return {
    entries: [...entries],
    clear: () => {
      entries = [];
      save();
      notify();
    },
    count: entries.length,
  };
}

export function getAuditEntries(): AuditEntry[] {
  load();
  return [...entries];
}
