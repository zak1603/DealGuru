"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { quietButton } from "@/components/form-parts";
import { formatMoment } from "@/lib/data-helpers";
import { getSupabase } from "@/lib/shopper";

type Signup = {
  email: string | null;
  first_name: string | null;
  joined_at: string;
  confirmed: boolean;
  signed_up_with: string;
  newsletter: boolean;
  newsletter_consent_at: string | null;
  newsletter_unsubscribed_at: string | null;
};
type Send = { kind: "welcome" | "weekly"; sent_at: string; recipients: number };

/** Brevo's free plan sends up to 300 emails a day, shared with sign-up and password emails. */
const DAILY_EMAIL_LIMIT = 300;

type Loaded = { signups: Signup[]; lastWeekly: Send | null } | "not-set-up" | null;

async function fetchSignups(): Promise<Loaded> {
  const supabase = getSupabase();
  const [signups, sends] = await Promise.all([
    supabase.rpc("admin_signups"),
    supabase.from("newsletter_sends").select("kind, sent_at, recipients").eq("kind", "weekly").order("sent_at", { ascending: false }).limit(1),
  ]);
  // PGRST202: the database doesn't have the sign-ups list yet.
  if (signups.error) return signups.error.code === "PGRST202" ? "not-set-up" : null;
  return { signups: signups.data as Signup[], lastWeekly: (sends.data?.[0] as Send | undefined) ?? null };
}

/** Quotes a spreadsheet cell, and stops a name like =SUM(...) being run as a formula. */
function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

function downloadCsv(signups: Signup[]) {
  const header = ["Email", "First name", "Joined", "Email confirmed", "Signed up with", "Gets newsletter", "Agreed to newsletter", "Unsubscribed"];
  const rows = signups.map((s) => [
    s.email ?? "",
    s.first_name ?? "",
    s.joined_at,
    s.confirmed ? "yes" : "no",
    s.signed_up_with,
    s.newsletter ? "yes" : "no",
    s.newsletter_consent_at ?? "",
    s.newsletter_unsubscribed_at ?? "",
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `deal-guru-signups-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function newsletterLabel(s: Signup) {
  if (s.newsletter) return s.newsletter_consent_at ? `Newsletter since ${formatMoment(s.newsletter_consent_at)}` : "Newsletter";
  if (s.newsletter_unsubscribed_at) return `Unsubscribed ${formatMoment(s.newsletter_unsubscribed_at)}`;
  return "No newsletter";
}

export function SignupsSection() {
  const [result, setResult] = useState<Loaded | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void fetchSignups().then((loaded) => {
      if (active) setResult(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  if (result === undefined) {
    return (
      <section aria-labelledby="signups">
        <h2 id="signups" className="display text-3xl">Sign-ups</h2>
        <p className="mt-3">Loading…</p>
      </section>
    );
  }

  if (result === null || result === "not-set-up") {
    return (
      <section aria-labelledby="signups">
        <h2 id="signups" className="display text-3xl">Sign-ups</h2>
        <p className="mt-3">
          {result === "not-set-up"
            ? "Sign-ups will show here once the database update for accounts and the newsletter is applied."
            : "Couldn't load the sign-ups. Check your connection and refresh."}
        </p>
      </section>
    );
  }

  const { signups, lastWeekly } = result;
  const confirmed = signups.filter((s) => s.confirmed).length;
  const subscribers = signups.filter((s) => s.newsletter && s.confirmed).length;

  return (
    <section aria-labelledby="signups" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="signups" className="display text-3xl">
          Sign-ups ({signups.length})
        </h2>
        {signups.length > 0 && (
          <button type="button" onClick={() => downloadCsv(signups)} className={quietButton}>
            <Download className="size-4" aria-hidden />
            Download as spreadsheet
          </button>
        )}
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          ["Accounts", signups.length],
          ["Email confirmed", confirmed],
          ["Get the newsletter", subscribers],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white p-4">
            <dt className="text-sm font-bold text-ink/70">{label}</dt>
            <dd className="display text-4xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-sm">
        {lastWeekly
          ? `Last weekly email: ${formatMoment(lastWeekly.sent_at)}, to ${lastWeekly.recipients} ${lastWeekly.recipients === 1 ? "person" : "people"}.`
          : "No weekly email sent yet. It goes out on Thursdays at 08:00 to everyone who ticked the newsletter box."}
      </p>
      {subscribers > DAILY_EMAIL_LIMIT - 30 && (
        <p className="rounded-lg bg-marigold/30 p-3 text-sm font-semibold">
          You&apos;re close to Brevo&apos;s free limit of {DAILY_EMAIL_LIMIT} emails a day. Upgrade your Brevo plan before the next
          Thursday email, or some subscribers will miss it.
        </p>
      )}

      {signups.length === 0 ? (
        <p>No sign-ups yet.</p>
      ) : (
        <ul className="space-y-2">
          {signups.map((s) => (
            <li key={`${s.email}-${s.joined_at}`} className="rounded-xl bg-white p-3">
              <p className="text-sm">
                <span className="font-bold break-all">{s.email}</span>
                {s.first_name && ` · ${s.first_name}`}
              </p>
              <p className="text-xs text-ink/60">
                Joined {formatMoment(s.joined_at)} with {s.signed_up_with === "google" ? "Google" : "email"} ·{" "}
                {s.confirmed ? "Email confirmed" : "Not confirmed yet"} · {newsletterLabel(s)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
