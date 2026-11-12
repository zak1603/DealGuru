"use client";

import { useSyncExternalStore } from "react";
import { onSignIn } from "./auth";
import { roundCoord, type Coords } from "./geo";
import { getSupabase } from "./supabase";

export type SavedLocation = Coords & { label: string };

const KEY = "dealguru:location";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: SavedLocation | null } = { raw: null, value: null };

function parse(raw: string | null): SavedLocation | null {
  try {
    const v = JSON.parse(raw ?? "null");
    if (v && typeof v.lat === "number" && typeof v.lng === "number" && typeof v.label === "string") {
      return { lat: v.lat, lng: v.lng, label: v.label };
    }
  } catch {}
  return null;
}

function read(): SavedLocation | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cache.raw) cache = { raw, value: parse(raw) };
  return cache.value;
}

function writeLocal(value: SavedLocation | null) {
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify(value));
    else localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((listener) => listener());
}

/** Saves to the signed-in account, so the location follows them to other devices. */
async function writeAccount(value: SavedLocation | null) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;
  await supabase.from("profiles").upsert({
    id: user.id,
    location_label: value?.label ?? null,
    lat: value?.lat ?? null,
    lng: value?.lng ?? null,
    updated_at: new Date().toISOString(),
  });
}

export function saveLocation(value: SavedLocation | null) {
  const rounded = value && { label: value.label, lat: roundCoord(value.lat), lng: roundCoord(value.lng) };
  writeLocal(rounded);
  void writeAccount(rounded);
}

let syncing = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === KEY && listener();
  window.addEventListener("storage", onStorage);

  if (!syncing) {
    syncing = true;
    // On sign-in the account's saved location wins. If the account has none yet,
    // the one already chosen on this device is saved to it.
    onSignIn(async (user) => {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from("profiles")
        .select("location_label, lat, lng")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.lat != null && data?.lng != null) {
        writeLocal({ label: data.location_label ?? "Saved location", lat: data.lat, lng: data.lng });
      } else if (read()) {
        void writeAccount(read());
      }
    });
  }

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Null on the server and first render, so server and browser HTML match. */
export function useSavedLocation() {
  return useSyncExternalStore(subscribe, read, () => null);
}

/** Forgets the location on this device only, e.g. when logging out of a shared computer. */
export function clearDeviceLocation() {
  writeLocal(null);
}
