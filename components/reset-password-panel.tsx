"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Field, FormMessage, inputClasses, primaryButton } from "@/components/form-parts";
import { updatePassword, useShopper } from "@/lib/shopper";

/** Opened from the "choose a new password" email. Supabase signs the shopper in from the link first. */
export function ResetPasswordPanel() {
  const { user, authReady } = useShopper();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await updatePassword(password);
      setDone(true);
    } catch (problem) {
      const code = (problem as { code?: string } | null)?.code;
      setError(
        code === "weak_password"
          ? "Choose a stronger password: at least 8 characters, and not a common one."
          : code === "same_password"
            ? "That's your current password. Choose a different one."
            : "Eish, that didn't work. Please try again.",
      );
    }
    setBusy(false);
  }

  if (!authReady) return <p>Loading…</p>;

  if (done) {
    return (
      <div className="max-w-md space-y-4 rounded-2xl bg-white p-5" role="status">
        <p className="font-bold text-springbok">Password changed. You&apos;re logged in.</p>
        <Link href="/" className={`${primaryButton} w-fit`}>
          See today&apos;s deals
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md space-y-3 rounded-2xl bg-white p-5">
        <p className="font-bold">This link has expired, or was opened in a different browser from the one you asked from.</p>
        <Link href="/login?mode=forgot" className="font-bold text-springbok underline">
          Send me a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4 rounded-2xl bg-white p-5">
      <p>
        Choose a new password for <span className="font-bold break-all">{user.email}</span>.
      </p>
      <Field label="New password" hint="at least 8 characters">
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
      </Field>
      {error && <FormMessage ok={false}>{error}</FormMessage>}
      <button type="submit" disabled={busy} className={`${primaryButton} w-full`}>
        {busy ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
