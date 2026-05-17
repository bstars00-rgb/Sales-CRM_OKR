"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "sales-crm-favorites";
let favorites: Set<string> = new Set();
const listeners = new Set<() => void>();
let snap = 0;
let hydrated = false;

function load() {
  if (typeof window === "undefined" || hydrated) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      favorites = new Set(arr);
    }
  } catch {}
  hydrated = true;
}

function save() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
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

export function useFavorites() {
  useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return {
    isFavorite: (id: string) => favorites.has(id),
    toggle: (id: string) => {
      if (favorites.has(id)) favorites.delete(id);
      else favorites.add(id);
      save();
      notify();
    },
    list: () => Array.from(favorites),
    count: favorites.size,
  };
}
