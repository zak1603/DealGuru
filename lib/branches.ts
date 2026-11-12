"use client";

import { useSyncExternalStore } from "react";
import { distanceKm, type Coords } from "./geo";

type BranchFile = { updated: string | null; stores: Record<string, [number, number, string][]> };
export type Nearest = { km: number; branch: string };

let data: BranchFile | null = null;
let loading = false;
const listeners = new Set<() => void>();

/** Downloads branch locations the first time someone sets a location, not on every visit. */
function load() {
  if (data || loading) return;
  loading = true;
  fetch("/branches.json")
    .then((response) => response.json() as Promise<BranchFile>)
    .then((file) => {
      data = file;
      listeners.forEach((listener) => listener());
    })
    .catch(() => {
      loading = false; // Try again next time.
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The closest branch of each store to `from`, by store slug. Null until loaded or with no location. */
export function useNearestBranches(from: Coords | null): Map<string, Nearest> | null {
  const file = useSyncExternalStore(subscribe, () => data, () => null);
  if (!from) return null;
  if (!file) {
    load();
    return null;
  }
  return nearestFor(file, from);
}

let memo: { file: BranchFile; lat: number; lng: number; result: Map<string, Nearest> } | null = null;

function nearestFor(file: BranchFile, from: Coords) {
  if (memo && memo.file === file && memo.lat === from.lat && memo.lng === from.lng) return memo.result;
  const result = new Map<string, Nearest>();
  for (const [slug, branches] of Object.entries(file.stores)) {
    let best: Nearest | null = null;
    for (const [lat, lng, branch] of branches) {
      const km = distanceKm(from, { lat, lng });
      if (!best || km < best.km) best = { km, branch };
    }
    if (best) result.set(slug, best);
  }
  memo = { file, lat: from.lat, lng: from.lng, result };
  return result;
}
