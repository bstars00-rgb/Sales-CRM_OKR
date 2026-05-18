"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "sales-crm-follows";

export type FollowRefType = "deal" | "account";

interface FollowKey {
  type: FollowRefType;
  id: string;
}

function key(type: FollowRefType, id: string): string {
  return `${type}:${id}`;
}

let follows: Set<string> = new Set();
let hydrated = false;
let snap = 0;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined" || hydrated) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) follows = new Set(JSON.parse(raw) as string[]);
  } catch {}
  hydrated = true;
}

function save() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(follows)));
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

export function useFollows() {
  useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return {
    isFollowing: (type: FollowRefType, id: string) => follows.has(key(type, id)),
    toggle: (type: FollowRefType, id: string) => {
      const k = key(type, id);
      if (follows.has(k)) follows.delete(k);
      else follows.add(k);
      save();
      notify();
    },
    list: (): FollowKey[] =>
      Array.from(follows).map((k) => {
        const [type, id] = k.split(":");
        return { type: type as FollowRefType, id };
      }),
    count: follows.size,
  };
}

/** Component 외부에서 현재 구독 목록 조회 (NotificationBell 등) */
export function getFollowingIds(type: FollowRefType): string[] {
  load();
  return Array.from(follows)
    .filter((k) => k.startsWith(`${type}:`))
    .map((k) => k.slice(type.length + 1));
}
