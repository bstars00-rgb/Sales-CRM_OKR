"use client";

import { useSyncExternalStore } from "react";
import { recordAudit } from "./audit-log";

const STORAGE_KEY = "sales-crm-comments";

export type CommentRefType = "deal" | "account";

export interface Comment {
  id: string;
  refType: CommentRefType;
  refId: string;
  authorId: string;
  authorName: string;
  body: string;          // markdown-lite (@mention 포함)
  mentions: string[];    // userId 배열
  createdAt: string;     // ISO
  editedAt?: string;
}

let entries: Comment[] = [];
let hydrated = false;
let snap = 0;
const listeners = new Set<() => void>();
let counter = 0;

function load() {
  if (typeof window === "undefined" || hydrated) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) entries = JSON.parse(raw) as Comment[];
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

/** @멘션 추출 — @홍길동 또는 @user-id 형식 */
export function extractMentions(body: string, validUsers: { id: string; name: string }[]): string[] {
  const out = new Set<string>();
  // @로 시작하는 토큰 추출 (한글/영문/숫자/하이픈 포함)
  const regex = /@([\w가-힣\-]+)/g;
  let m;
  while ((m = regex.exec(body)) !== null) {
    const token = m[1];
    const byId = validUsers.find((u) => u.id === token || u.id === `user-${token}`);
    const byName = validUsers.find((u) => u.name === token);
    if (byId) out.add(byId.id);
    else if (byName) out.add(byName.id);
  }
  return Array.from(out);
}

export function useComments() {
  useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return {
    all: () => [...entries],
    forRef: (refType: CommentRefType, refId: string) =>
      entries.filter((c) => c.refType === refType && c.refId === refId)
             .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    countForRef: (refType: CommentRefType, refId: string) =>
      entries.filter((c) => c.refType === refType && c.refId === refId).length,
    add: (input: Omit<Comment, "id" | "createdAt">): Comment => {
      load();
      counter++;
      const c: Comment = {
        id: `comment-${Date.now()}-${counter}`,
        createdAt: new Date().toISOString(),
        ...input,
      };
      entries.unshift(c);
      save();
      recordAudit({
        action: "ACTIVITY_ADD",
        actorId: c.authorId, actorName: c.authorName,
        refType: "activity", refId: c.id,
        summary: `💬 댓글: ${c.refType}/${c.refId}${c.mentions.length > 0 ? ` (@${c.mentions.length}명 멘션)` : ""}`,
        meta: { body: c.body.slice(0, 100), mentions: c.mentions },
      });
      notify();
      return c;
    },
    remove: (id: string): boolean => {
      const idx = entries.findIndex((c) => c.id === id);
      if (idx < 0) return false;
      entries.splice(idx, 1);
      save();
      notify();
      return true;
    },
    /** 특정 userId가 받은 미확인 멘션 (실 알림은 NotificationBell이 detect) */
    mentionsFor: (userId: string) =>
      entries.filter((c) => c.mentions.includes(userId)),
  };
}

export function getCommentsForRef(refType: CommentRefType, refId: string): Comment[] {
  load();
  return entries.filter((c) => c.refType === refType && c.refId === refId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllComments(): Comment[] {
  load();
  return [...entries];
}
