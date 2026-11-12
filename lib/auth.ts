"use client";

import type { User } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "signed-out"; user: null }
  | { status: "signed-in"; user: User };

const LOADING: AuthState = { status: "loading", user: null };
const SIGNED_OUT: AuthState = { status: "signed-out", user: null };

let state: AuthState = LOADING;
let started = false;
const listeners = new Set<() => void>();
const signInHandlers = new Set<(user: User) => void>();

function set(next: AuthState) {
  const wasSignedIn = state.status === "signed-in" ? state.user.id : null;
  state = next;
  if (next.status === "signed-in" && wasSignedIn !== next.user.id) {
    signInHandlers.forEach((handler) => handler(next.user));
  }
  listeners.forEach((listener) => listener());
}

function start() {
  if (started) return;
  started = true;
  const supabase = getSupabase();
  if (!supabase) return set(SIGNED_OUT);
  supabase.auth.onAuthStateChange((_event, session) => {
    // Supabase warns against awaiting its own calls inside this callback, so defer the work.
    setTimeout(() => set(session ? { status: "signed-in", user: session.user } : SIGNED_OUT), 0);
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Runs whenever someone signs in, including when a page loads with them already signed in. */
export function onSignIn(handler: (user: User) => void) {
  start();
  signInHandlers.add(handler);
  if (state.status === "signed-in") handler(state.user);
  return () => signInHandlers.delete(handler);
}

export function useAuth() {
  return useSyncExternalStore(subscribe, () => state, () => LOADING);
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
}
