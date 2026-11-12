"use client";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { useEffect, useState, useSyncExternalStore } from "react";
import { type BranchFile, isSavedLocation, roundCoordinate, type SavedLocation } from "./geo";
import { supabasePublishableKey, supabaseUrl } from "./supabase-config";

/**
 * Who is signed in and which location they chose, shared by every component.
 * The location is always kept on this device, and also in the shopper's
 * account while they're signed in.
 */
type ShopperState = { user: User | null; location: SavedLocation | null; ready: boolean };

const STORAGE_KEY = "deal-guru-location";
const SERVER_STATE: ShopperState = { user: null, location: null, ready: false };

let state: ShopperState = SERVER_STATE;
let started = false;
let supabase: SupabaseClient | undefined;
const listeners = new Set<() => void>();

export function getSupabase() {
  supabase ??= createClient(supabaseUrl, supabasePublishableKey, { auth: { flowType: "pkce" } });
  return supabase;
}

function update(next: Partial<ShopperState>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

function readDevice(): SavedLocation | null {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return isSavedLocation(saved) ? saved : null;
  } catch {
    return null;
  }
}

function writeDevice(location: SavedLocation | null) {
  try {
    if (location) localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private browsing can block storage. The choice still works until the tab closes.
  }
}

async function saveToAccount(userId: string, location: SavedLocation | null) {
  await getSupabase().from("profiles").upsert({
    id: userId,
    location_label: location?.label ?? null,
    latitude: location?.lat ?? null,
    longitude: location?.lng ?? null,
    updated_at: new Date().toISOString(),
  });
}

/** After signing in, the account's saved location wins. With none, this device's choice is saved to it. */
async function syncAfterSignIn(userId: string) {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("location_label, latitude, longitude")
    .eq("id", userId)
    .maybeSingle();
  if (error || state.user?.id !== userId) return;

  if (data && data.latitude !== null && data.longitude !== null) {
    const saved = { label: data.location_label ?? "your saved location", lat: data.latitude, lng: data.longitude };
    writeDevice(saved);
    update({ location: saved });
  } else if (state.location) {
    await saveToAccount(userId, state.location);
  }
}

function start() {
  if (started) return;
  started = true;
  update({ location: readDevice(), ready: true });

  getSupabase().auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;
    const signedIn = user !== null && user.id !== state.user?.id;
    update({ user });
    // Supabase advises against making other Supabase calls inside this callback.
    if (signedIn) setTimeout(() => void syncAfterSignIn(user.id), 0);
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => listeners.delete(listener);
}

export function useShopper(): ShopperState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}

export function setLocation(location: SavedLocation | null) {
  const rounded = location && {
    label: location.label.slice(0, 80),
    lat: roundCoordinate(location.lat),
    lng: roundCoordinate(location.lng),
  };
  writeDevice(rounded);
  update({ location: rounded });
  if (state.user) void saveToAccount(state.user.id, rounded);
}

export async function signInWithGoogle() {
  await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
}

/** For the admin account, which has a password set in Supabase. */
export async function signInWithPassword(email: string, password: string) {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

/** Deletes the shopper's account and saved location, then clears this device too. */
export async function deleteAccount() {
  const { error } = await getSupabase().rpc("delete_my_account");
  if (error) throw error;
  await getSupabase().auth.signOut();
  writeDevice(null);
  update({ location: null, user: null });
}

let branchRequest: Promise<BranchFile | null> | undefined;

/** Loads store branch locations, only once a shopper has chosen a location. */
export function useBranches(enabled: boolean) {
  const [branches, setBranches] = useState<BranchFile | null>(null);

  useEffect(() => {
    if (!enabled || branches) return;
    branchRequest ??= fetch("/branches.json")
      .then((response) => (response.ok ? (response.json() as Promise<BranchFile>) : null))
      .catch(() => null);
    let active = true;
    void branchRequest.then((file) => {
      if (active) setBranches(file);
    });
    return () => {
      active = false;
    };
  }, [enabled, branches]);

  return branches;
}
