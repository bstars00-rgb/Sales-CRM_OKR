"use client";

import { useSyncExternalStore } from "react";
import { recordAudit } from "./audit-log";

const STORAGE_KEY = "sales-crm-1on1s";

export interface OneOnOne {
  id: string;
  memberId: string;       // 팀원
  memberName: string;
  leadId: string;         // LEAD/Manager
  leadName: string;
  meetingDate: string;    // YYYY-MM-DD
  agenda?: string;        // 진행 안건
  achievements?: string;  // 잘한 것
  concerns?: string;      // 막힌 것/우려
  actionItems?: string;   // 다음까지 액션
  rating?: 1 | 2 | 3 | 4 | 5; // 컨디션 1-5
  followUpAt?: string;    // 다음 1on1 예정
  createdAt: string;
}

let entries: OneOnOne[] = [];
let hydrated = false;
let snap = 0;
const listeners = new Set<() => void>();
let counter = 0;

function load() {
  if (typeof window === "undefined" || hydrated) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) entries = JSON.parse(raw) as OneOnOne[];
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

export function useOneOnOnes() {
  useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return {
    all: () => [...entries].sort((a, b) => b.meetingDate.localeCompare(a.meetingDate)),
    forMember: (memberId: string) =>
      entries.filter((e) => e.memberId === memberId)
             .sort((a, b) => b.meetingDate.localeCompare(a.meetingDate)),
    add: (input: Omit<OneOnOne, "id" | "createdAt">): OneOnOne => {
      load();
      counter++;
      const o: OneOnOne = {
        id: `1on1-${Date.now()}-${counter}`,
        createdAt: new Date().toISOString(),
        ...input,
      };
      entries.unshift(o);
      save();
      recordAudit({
        action: "ACTIVITY_ADD",
        actorId: o.leadId, actorName: o.leadName,
        refType: "activity", refId: o.id,
        summary: `🤝 1on1 기록: ${o.leadName} ↔ ${o.memberName} (${o.meetingDate})`,
        meta: { rating: o.rating },
      });
      notify();
      return o;
    },
    update: (id: string, patch: Partial<Omit<OneOnOne, "id" | "createdAt">>): OneOnOne | null => {
      const e = entries.find((x) => x.id === id);
      if (!e) return null;
      Object.assign(e, patch);
      save();
      notify();
      return e;
    },
    remove: (id: string): boolean => {
      const idx = entries.findIndex((x) => x.id === id);
      if (idx < 0) return false;
      entries.splice(idx, 1);
      save();
      notify();
      return true;
    },
    /** 마지막 1on1로부터 N일 지난 멤버 (1on1 누락 감지용) */
    overdueMembers: (allMemberIds: string[], thresholdDays = 28): { memberId: string; daysSince: number | null }[] => {
      const now = Date.now();
      return allMemberIds.map((memberId) => {
        const list = entries.filter((e) => e.memberId === memberId);
        if (list.length === 0) return { memberId, daysSince: null };
        const latest = list.sort((a, b) => b.meetingDate.localeCompare(a.meetingDate))[0];
        const days = Math.floor((now - new Date(latest.meetingDate).getTime()) / 86400000);
        return { memberId, daysSince: days };
      }).filter((x) => x.daysSince === null || x.daysSince > thresholdDays);
    },
    count: entries.length,
  };
}

export function getAllOneOnOnes(): OneOnOne[] {
  load();
  return [...entries];
}
