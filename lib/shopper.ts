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
type ShopperState = {
  user: User | null;
  location: SavedLocation | null;
  /** The saved location has been read from this device. */
  ready: boolean;
  /** Supabase has checked whether someone is signed in, including any link they just opened from an email. */
  authReady: boolean;
};

const STORAGE_KEY = "deal-guru-location";
/** Set while a shopper who ticked the newsletter box is away signing in with Google. */
const NEWSLETTER_PENDING_KEY = "deal-guru-newsletter-pending";
const SERVER_STATE: ShopperState = { user: null, location: null, ready: false, authReady: false };

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

/** Someone who ticked "Email me the latest deals" and then signed up with Google gets subscribed on their return. */
async function applyPendingNewsletter(userId: string) {
  let pending = false;
  try {
    pending = localStorage.getItem(NEWSLETTER_PENDING_KEY) === "1";
    localStorage.removeItem(NEWSLETTER_PENDING_KEY);
  } catch {
    return;
  }
  if (pending) await setNewsletter(userId, true).catch(() => undefined);
}

/** After signing in, the account's saved location wins. With none, this device's choice is saved to it. */
async function syncAfterSignIn(userId: string) {
  await applyPendingNewsletter(userId);
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
    update({ user, authReady: true });
    // Supabase advises against making other Supabase calls inside this callback.
    if (signedIn) setTimeout(() => void syncAfterSignIn(user.id), 0);
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => listeners.delete(listener);
}

/** The name to greet someone by: from the sign-up form or Google, else the start of their email. */
export function firstNameOf(user: User) {
  const metadata: Record<string, unknown> = user.user_metadata ?? {};
  for (const key of ["first_name", "given_name", "full_name", "name"]) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim().split(/\s+/)[0];
  }
  return user.email?.split("@")[0] ?? "there";
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

export async function signInWithGoogle(options: { newsletter?: boolean } = {}) {
  try {
    if (options.newsletter) localStorage.setItem(NEWSLETTER_PENDING_KEY, "1");
    else localStorage.removeItem(NEWSLETTER_PENDING_KEY);
  } catch {
    // Storage can be blocked. They can still subscribe on the Privacy page.
  }
  await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
}

export async function signInWithPassword(email: string, password: string) {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

const confirmLink = () => `${window.location.origin}/login?confirmed=1`;

/**
 * Creates an account. The database saves the name and newsletter choice with it.
 * Returns whether the shopper still has to click the link in their confirmation email.
 */
export async function signUpWithEmail(details: { email: string; password: string; firstName: string; newsletter: boolean }) {
  const { data, error } = await getSupabase().auth.signUp({
    email: details.email,
    password: details.password,
    options: {
      emailRedirectTo: confirmLink(),
      data: { first_name: details.firstName, newsletter: details.newsletter },
    },
  });
  if (error) throw error;
  return { needsConfirmation: data.session === null };
}

export async function resendConfirmation(email: string) {
  const { error } = await getSupabase().auth.resend({ type: "signup", email, options: { emailRedirectTo: confirmLink() } });
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await getSupabase().auth.updateUser({ password });
  if (error) throw error;
}

/** Whether this account gets the weekly deals email, or null if it couldn't be checked. */
export async function getNewsletter(userId: string) {
  const { data, error } = await getSupabase().from("profiles").select("newsletter").eq("id", userId).maybeSingle();
  if (error) return null;
  return data?.newsletter === true;
}

export async function setNewsletter(userId: string, subscribed: boolean) {
  const { data, error } = await getSupabase()
    .from("profiles")
    .update({ newsletter: subscribed })
    .eq("id", userId)
    .select("newsletter");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Your account's details weren't found.");
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
