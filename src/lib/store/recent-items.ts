"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "sales-crm-recent-items";
const MAX_ITEMS = 20;

export interface RecentItem {
  id: string;        // 검색 결과의 id (account-X / deal-Y / page-N)
  title: string;
  href: string;
  kind: string;
  lastSelectedAt: string;
  selectCount: number;
}

let entries: RecentItem[] = [];
let hydrated = false;
let snap = 0;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined" || hydrated) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) entries = JSON.parse(raw) as RecentItem[];
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

export function useRecentItems() {
  useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return {
    all: () => [...entries],
    /** 사용자가 선택한 항목 기록 */
    record: (item: Omit<RecentItem, "lastSelectedAt" | "selectCount">) => {
      load();
      const existing = entries.find((e) => e.id === item.id);
      if (existing) {
        existing.selectCount++;
        existing.lastSelectedAt = new Date().toISOString();
        // 맨 앞으로 이동
        entries = [existing, ...entries.filter((e) => e.id !== item.id)];
      } else {
        entries.unshift({
          ...item,
          lastSelectedAt: new Date().toISOString(),
          selectCount: 1,
        });
      }
      if (entries.length > MAX_ITEMS) entries.length = MAX_ITEMS;
      save();
      notify();
    },
    /** 특정 id의 가중치 점수 — 최근일수록 + 자주 선택할수록 높음 */
    weight: (id: string): number => {
      const e = entries.find((x) => x.id === id);
      if (!e) return 0;
      const daysSince = (Date.now() - new Date(e.lastSelectedAt).getTime()) / 86400000;
      // 최근 1일 = +50, 1주 = +20, 30일 후 = ~0
      const recency = Math.max(0, 50 / (1 + daysSince));
      const frequency = Math.min(50, e.selectCount * 5);
      return recency + frequency;
    },
    clear: () => {
      entries = [];
      save();
      notify();
    },
    count: entries.length,
  };
}

/** Component 외부에서 가중치 계산 */
export function getRecentWeight(id: string): number {
  if (typeof window === "undefined") return 0;
  load();
  const e = entries.find((x) => x.id === id);
  if (!e) return 0;
  const daysSince = (Date.now() - new Date(e.lastSelectedAt).getTime()) / 86400000;
  const recency = Math.max(0, 50 / (1 + daysSince));
  const frequency = Math.min(50, e.selectCount * 5);
  return recency + frequency;
}
