/**
 * Public Supabase settings for Deal Guru's accounts, deals and saved locations.
 *
 * These are safe to publish: the publishable key only allows what the
 * database's access rules permit.
 */
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oulxrmolepbcshxjwjch.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_soRAyKrwdo17Gpp_DGY2rw_nPbollKv";

/**
 * Shows "Continue with Google". Switch to true once Google sign-in is set up in
 * Supabase (see README).
 */
export const googleSignInReady: boolean = false;

/**
 * Lets shoppers sign up with an email and password. Switch to true once Brevo
 * is connected to Supabase for emails (see README), because sign-ups need a
 * confirmation email.
 */
export const emailSignUpReady: boolean = false;

/** Whether shoppers can make an account at all, which shows "Log in" and "Sign up" links. */
export const signUpOpen = googleSignInReady || emailSignUpReady;

/** Where the newsletter's unsubscribe page sends its request. */
export const newsletterFunctionUrl = `${supabaseUrl}/functions/v1/newsletter`;
