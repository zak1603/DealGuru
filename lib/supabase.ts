"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** False until the two Supabase settings are added, which hides everything to do with logging in. */
export const loginEnabled = Boolean(url && key);

let client: SupabaseClient | null = null;

/** The one Supabase client for this browser tab, or null when logging in isn't set up. */
export function getSupabase(): SupabaseClient | null {
  if (!loginEnabled || typeof window === "undefined") return null;
  // Sessions live in this browser's storage. Signing in from the email link happens automatically.
  client ??= createClient(url!, key!);
  return client;
}
