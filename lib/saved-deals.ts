"use client";

import { useSyncExternalStore } from "react";

// Saved deals live in this browser only, so there's no account to sign up for.
const KEY = "dealguru:saved";
const listeners = new Set<() => void>();
let cache: { raw: string | null; ids: ReadonlySet<string> } = { raw: null, ids: new Set() };
const empty: ReadonlySet<string> = new Set();

function read(): ReadonlySet<string> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return empty; // Storage blocked, e.g. some private browsing modes.
  }
  if (raw !== cache.raw) {
    let ids: string[] = [];
    try {
      const parsed: unknown = JSON.parse(raw ?? "[]");
      if (Array.isArray(parsed)) ids = parsed.filter((id) => typeof id === "string");
    } catch {}
    cache = { raw, ids: new Set(ids) };
  }
  return cache.ids;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps other open tabs in step.
  const onStorage = (event: StorageEvent) => event.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleSaved(id: string) {
  const next = new Set(read());
  if (next.has(id)) next.delete(id);
  else next.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

/** Empty on the server and first render, so server and browser HTML match. */
export function useSavedDeals() {
  return useSyncExternalStore(subscribe, read, () => empty);
}
