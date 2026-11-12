/**
 * Public Supabase settings for Deal Guru's sign-in and saved locations.
 *
 * These are safe to publish: the publishable key only allows what the
 * database's access rules permit, and those only let shoppers see and change
 * their own saved location.
 */
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oulxrmolepbcshxjwjch.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_soRAyKrwdo17Gpp_DGY2rw_nPbollKv";

/**
 * Shows the "Sign in" button. Switch to true once Google sign-in is set up in
 * Supabase (see README). Until then shoppers' locations are saved on their device.
 */
export const googleSignInReady = false;
