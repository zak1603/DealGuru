"use client";

import Link from "next/link";
import { useState } from "react";
import { FormMessage, primaryButton } from "@/components/form-parts";
import { newsletterFunctionUrl } from "@/lib/supabase-config";
import { useSearchParam } from "@/lib/use-search-param";

/**
 * Opened from the link in a welcome email. It waits for a click, because email
 * security scanners open links on their own and would otherwise unsubscribe people.
 */
export function UnsubscribePanel() {
  const account = useSearchParam("u");
  const signature = useSearchParam("s");
  const [state, setState] = useState<"idle" | "working" | "done" | "failed">("idle");

  if (!account || !signature) {
    return (
      <p className="max-w-md rounded-2xl bg-white p-5">
        This unsubscribe link is incomplete. Use the link at the bottom of any Deal Guru email, or log in and change your
        choice on the{" "}
        <Link href="/privacy" className="font-bold underline">
          Privacy page
        </Link>
        .
      </p>
    );
  }

  if (state === "done") {
    return (
      <div className="max-w-md space-y-2 rounded-2xl bg-white p-5" role="status">
        <p className="font-bold text-springbok">Done. You won&apos;t get the weekly deals email any more.</p>
        <p>
          Changed your mind? Log in and tick the box on the{" "}
          <Link href="/privacy" className="font-bold underline">
            Privacy page
          </Link>
          .
        </p>
      </div>
    );
  }

  async function unsubscribe() {
    setState("working");
    try {
      const response = await fetch(newsletterFunctionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsubscribe", u: account, s: signature }),
      });
      setState(response.ok ? "done" : "failed");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="max-w-md space-y-4 rounded-2xl bg-white p-5">
      <p>Stop getting Deal Guru&apos;s weekly deals email? Your account stays as it is.</p>
      {state === "failed" && (
        <FormMessage ok={false}>Eish, that didn&apos;t work. Please try again, or use the link in a newer email.</FormMessage>
      )}
      <button type="button" disabled={state === "working"} onClick={() => void unsubscribe()} className={`${primaryButton} w-full`}>
        {state === "working" ? "Unsubscribing…" : "Unsubscribe me"}
      </button>
    </div>
  );
}
