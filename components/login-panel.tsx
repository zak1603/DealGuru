"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Field, FormMessage, inputClasses, primaryButton, quietButton } from "@/components/form-parts";
import {
  firstNameOf,
  resendConfirmation,
  sendPasswordReset,
  signInWithGoogle,
  signInWithPassword,
  signOut,
  signUpWithEmail,
  useShopper,
} from "@/lib/shopper";
import { emailSignUpReady, googleSignInReady, signUpOpen } from "@/lib/supabase-config";
import { useSearchParam } from "@/lib/use-search-param";

type Mode = "login" | "signup" | "forgot";
type Message = { ok: boolean; text: string } | null;

const errorCode = (error: unknown) => (error as { code?: string } | null)?.code;

function GoogleButton({ newsletter }: { newsletter?: boolean }) {
  const [busy, setBusy] = useState(false);
  if (!googleSignInReady) return null;
  return (
    <>
      <p className="text-center text-sm font-semibold text-ink/60">or</p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          signInWithGoogle({ newsletter }).catch(() => setBusy(false));
        }}
        className={`${quietButton} w-full justify-center border-2 border-ink/15 bg-white`}
      >
        Continue with Google
      </button>
    </>
  );
}

function ResendButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  if (state === "sent") return <FormMessage ok>Sent. Check your inbox and your spam folder.</FormMessage>;
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={state === "sending"}
        onClick={() => {
          setState("sending");
          resendConfirmation(email)
            .then(() => setState("sent"))
            .catch(() => setState("failed"));
        }}
        className={quietButton}
      >
        {state === "sending" ? "Sending…" : "Send the link again"}
      </button>
      {state === "failed" && <FormMessage ok={false}>Couldn&apos;t send it right now. Please try again in a few minutes.</FormMessage>}
    </div>
  );
}

function LogInForm({ onForgot }: { onForgot: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setUnconfirmed(false);
    try {
      await signInWithPassword(email.trim(), password);
      router.push("/");
    } catch (error) {
      if (errorCode(error) === "email_not_confirmed") {
        setUnconfirmed(true);
        setMessage({ ok: false, text: "Confirm your email first. We sent you a link when you signed up." });
      } else {
        setMessage({ ok: false, text: "Eish, that email and password didn't work." });
      }
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email">
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
      </Field>
      <Field label="Password">
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
      </Field>
      {message && <FormMessage ok={message.ok}>{message.text}</FormMessage>}
      {unconfirmed && <ResendButton email={email.trim()} />}
      <button type="submit" disabled={busy} className={`${primaryButton} w-full`}>
        {busy ? "Logging in…" : "Log in"}
      </button>
      <button type="button" onClick={onForgot} className="cursor-pointer text-sm font-bold text-springbok underline">
        Forgot your password?
      </button>
      <GoogleButton />
    </form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await sendPasswordReset(email.trim());
      setMessage({
        ok: true,
        text: "If there's a Deal Guru account for that email, we've sent it a link to choose a new password. Check your spam folder too.",
      });
    } catch {
      setMessage({ ok: false, text: "Couldn't send the link right now. Please try again in a few minutes." });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p>Enter your email and we&apos;ll send you a link to choose a new password.</p>
      <Field label="Email">
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
      </Field>
      {message && <FormMessage ok={message.ok}>{message.text}</FormMessage>}
      <button type="submit" disabled={busy} className={`${primaryButton} w-full`}>
        {busy ? "Sending…" : "Send me a link"}
      </button>
      <button type="button" onClick={onBack} className="cursor-pointer text-sm font-bold text-springbok underline">
        Back to log in
      </button>
    </form>
  );
}

function NewsletterBox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 rounded-lg bg-marigold/25 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-springbok"
      />
      <span>
        <span className="font-bold">Email me the latest deals every week.</span>{" "}
        <span className="text-sm">Unsubscribe any time with the link in every email.</span>
      </span>
    </label>
  );
}

function SignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [sentTo, setSentTo] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { needsConfirmation } = await signUpWithEmail({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        newsletter,
      });
      if (needsConfirmation) setSentTo(email.trim());
      else router.push("/");
    } catch (error) {
      const code = errorCode(error);
      const text =
        code === "weak_password"
          ? "Choose a stronger password: at least 8 characters, and not a common one."
          : code === "user_already_exists" || code === "email_exists"
            ? "There's already an account with that email. Log in instead."
            : code === "over_email_send_rate_limit" || code === "over_request_rate_limit"
              ? "Lots of people are signing up right now. Please try again in a few minutes."
              : "Eish, that didn't work. Please try again.";
      setMessage({ ok: false, text });
    }
    setBusy(false);
  }

  if (sentTo) {
    return (
      <div className="space-y-3" role="status">
        <h2 className="display text-3xl">Check your email</h2>
        <p>
          We&apos;ve sent a link to <span className="font-bold break-all">{sentTo}</span>. Click it to confirm your account. It can
          take a few minutes, so check your spam folder too.
        </p>
        <ResendButton email={sentTo} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {emailSignUpReady && (
        <>
          <Field label="First name" hint="optional">
            <input autoComplete="given-name" maxLength={60} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClasses} />
          </Field>
          <Field label="Email">
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
          </Field>
          <Field label="Password" hint="at least 8 characters">
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
        </>
      )}
      <NewsletterBox checked={newsletter} onChange={setNewsletter} />
      <p className="text-sm text-ink/70">
        By signing up you agree to how we handle your details in our{" "}
        <Link href="/privacy" className="font-bold underline">
          privacy notice
        </Link>
        .
      </p>
      {message && <FormMessage ok={message.ok}>{message.text}</FormMessage>}
      {emailSignUpReady && (
        <button type="submit" disabled={busy} className={`${primaryButton} w-full`}>
          {busy ? "Signing up…" : "Sign up"}
        </button>
      )}
      <GoogleButton newsletter={newsletter} />
    </form>
  );
}

function SignedIn() {
  const { user } = useShopper();
  const confirmed = useSearchParam("confirmed") === "1";
  if (!user) return null;
  return (
    <div className="space-y-4">
      <h2 className="display text-4xl">Howzit, {firstNameOf(user)}!</h2>
      <p>
        {confirmed ? "Your email is confirmed and you're logged in" : "You're logged in"} as{" "}
        <span className="font-bold break-all">{user.email}</span>.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/" className={primaryButton}>
          See today&apos;s deals
        </Link>
        <button type="button" onClick={() => void signOut()} className={quietButton}>
          Log out
        </button>
      </div>
    </div>
  );
}

export function LoginPanel() {
  const { user, authReady } = useShopper();
  const asked = useSearchParam("mode");
  const confirmed = useSearchParam("confirmed") === "1";
  const [chosen, setChosen] = useState<Mode | null>(null);
  const mode: Mode = chosen ?? (asked === "signup" && signUpOpen ? "signup" : asked === "forgot" ? "forgot" : "login");

  if (!authReady) return <p>Loading…</p>;

  return (
    <div className="max-w-md rounded-2xl bg-white p-5 sm:p-6">
      {user ? (
        <SignedIn />
      ) : (
        <div className="space-y-5">
          {confirmed && (
            <FormMessage ok>Your email is confirmed. Log in below to get started.</FormMessage>
          )}
          {signUpOpen && mode !== "forgot" && (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-paper p-1" role="group" aria-label="Log in or sign up">
              {(["login", "signup"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={mode === tab}
                  onClick={() => setChosen(tab)}
                  className={`min-h-10 cursor-pointer rounded-lg text-sm font-bold transition ${
                    mode === tab ? "bg-ink text-white" : "hover:bg-marigold/40"
                  }`}
                >
                  {tab === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>
          )}
          {mode === "signup" ? (
            <SignUpForm />
          ) : mode === "forgot" ? (
            <ForgotForm onBack={() => setChosen("login")} />
          ) : (
            <LogInForm onForgot={() => setChosen("forgot")} />
          )}
          <p className="border-t border-ink/10 pt-4 text-center text-sm">
            No account needed to shop the deals.{" "}
            <Link href="/" className="font-bold text-springbok underline">
              Keep browsing as a guest
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
