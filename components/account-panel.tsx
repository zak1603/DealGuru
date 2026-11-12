"use client";

import { LogOut, MailCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOut, useAuth } from "@/lib/auth";
import { clearDeviceLocation, saveLocation, useSavedLocation } from "@/lib/location";
import { getSupabase, loginEnabled } from "@/lib/supabase";

const button =
  "flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 font-bold transition active:scale-[0.98] disabled:opacity-60 motion-reduce:transform-none";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      // The link brings them back here, already logged in. New emails get an account automatically.
      options: { emailRedirectTo: `${window.location.origin}/account` },
    });
    if (error) {
      setState("error");
      setMessage(
        error.status === 429
          ? "Too many emails sent just now. Wait a few minutes and try again."
          : "Eish, that didn't work. Check your email address and try again.",
      );
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-6 rounded-2xl bg-white p-6 text-center">
        <MailCheck className="mx-auto size-10 text-springbok" aria-hidden />
        <p className="display mt-3 text-3xl">Check your email</p>
        <p className="mt-2 text-ink/70">
          We sent a login link to <strong className="text-ink">{email}</strong>. Tap it and you&apos;re in.
          It can take a minute, and might land in spam.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-4 cursor-pointer text-sm font-semibold underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="mt-6 space-y-3">
      <label htmlFor="email" className="block font-semibold">
        Email address
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.co.za"
        className="w-full rounded-xl border-2 border-ink bg-white px-4 py-2.5 text-base placeholder:text-ink/40"
      />
      <button type="submit" disabled={state === "sending"} className={`${button} bg-springbok text-white`}>
        {state === "sending" ? "Sending..." : "Email me a login link"}
      </button>
      {state === "error" && (
        <p role="alert" className="text-sm font-medium text-tomato">
          {message}
        </p>
      )}
      <p className="text-sm text-ink/60">No password needed. New here? This creates your account.</p>
    </form>
  );
}

export function AccountPanel() {
  const auth = useAuth();
  const location = useSavedLocation();

  if (!loginEnabled) {
    return (
      <>
        <h1 className="display text-5xl">Accounts coming soon</h1>
        <p className="mt-3 text-ink/70">
          Logging in isn&apos;t switched on yet. Your location is still remembered on this device.
        </p>
      </>
    );
  }

  if (auth.status === "loading") {
    return <p className="text-ink/60" aria-busy>Loading...</p>;
  }

  if (auth.status === "signed-out") {
    return (
      <>
        <h1 className="display text-5xl">Log in</h1>
        <p className="mt-3 text-ink/70">
          Save your location to your account, so deals closest to you come first on any device.
        </p>
        <LoginForm />
      </>
    );
  }

  return (
    <>
      <h1 className="display text-5xl">Howzit!</h1>
      <p className="mt-2 text-ink/70">
        Logged in as <strong className="text-ink">{auth.user.email}</strong>
      </p>

      <div className="mt-6 rounded-2xl bg-white p-5">
        <p className="flex items-center gap-1.5 font-bold">
          <MapPin className="size-5 text-springbok" aria-hidden />
          Your location
        </p>
        {location ? (
          <>
            <p className="mt-1 text-ink/70">
              {location.label === "My location" ? "Set from your device" : location.label}. Saved to
              your account, rounded to about 1 km.
            </p>
            <button
              type="button"
              onClick={() => saveLocation(null)}
              className="mt-3 cursor-pointer text-sm font-semibold text-tomato underline"
            >
              Forget my location
            </button>
          </>
        ) : (
          <p className="mt-1 text-ink/70">
            Not set yet.{" "}
            <Link href="/" className="font-semibold text-springbok underline">
              Set it on the deals page
            </Link>
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-3">
        <Link href="/" className={`${button} bg-springbok text-white`}>
          See deals near me
        </Link>
        <button type="button" onClick={async () => {
            await signOut();
            // The location belongs to the account, so it leaves with it.
            clearDeviceLocation();
          }} className={`${button} bg-white`}>
          <LogOut className="size-4" aria-hidden />
          Log out
        </button>
      </div>
    </>
  );
}
