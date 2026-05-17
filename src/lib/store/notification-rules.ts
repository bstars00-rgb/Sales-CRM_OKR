"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "sales-crm-notif-rules";

export interface NotificationRules {
  dormantDays: number;          // KEY/GROWTH 고객사 미접촉 임계일
  staleDealDays: number;        // 딜 단계 정체 임계일
  renewalWarnDays: number;      // 갱신 임박 임계일 (자동 갱신 아닌 경우만)
  enableDormant: boolean;
  enableStaleDeal: boolean;
  enableOverdueTask: boolean;
  enableRenewal: boolean;
  toastOnEvent: boolean;        // mutation 이벤트마다 Toast 띄울지
}

export const DEFAULT_RULES: NotificationRules = {
  dormantDays: 60,
  staleDealDays: 14,
  renewalWarnDays: 60,
  enableDormant: true,
  enableStaleDeal: true,
  enableOverdueTask: true,
  enableRenewal: true,
  toastOnEvent: true,
};

let rules: NotificationRules = { ...DEFAULT_RULES };
let hydrated = false;
let snap = 0;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined" || hydrated) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NotificationRules>;
      rules = { ...DEFAULT_RULES, ...parsed };
    }
  } catch {}
  hydrated = true;
}

function save() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
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

export function useNotificationRules() {
  useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return {
    rules: { ...rules },
    update: (patch: Partial<NotificationRules>) => {
      rules = { ...rules, ...patch };
      save();
      notify();
    },
    reset: () => {
      rules = { ...DEFAULT_RULES };
      save();
      notify();
    },
  };
}

/** Component 외부에서 현재 룰을 읽어야 할 때 (mutator hook 등) */
export function getNotificationRules(): NotificationRules {
  load();
  return { ...rules };
}
