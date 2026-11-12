"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useShopper } from "@/lib/shopper";
import { signUpOpen } from "@/lib/supabase-config";

/** Invites shoppers who aren't signed in to join for the weekly deals email. */
export function JoinBanner() {
  const { user, authReady } = useShopper();
  if (!signUpOpen || !authReady || user) return null;

  return (
    <aside className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink p-5 text-white sm:p-6">
      <div className="flex items-start gap-3">
        <Mail className="mt-1 size-6 shrink-0 text-marigold" aria-hidden />
        <div>
          <p className="display text-3xl text-marigold">Never miss a lekker deal</p>
          <p>Join free and get the week&apos;s best deals in your inbox every Thursday.</p>
        </div>
      </div>
      <Link
        href="/login?mode=signup"
        className="rounded-lg bg-marigold px-5 py-3 font-bold text-ink transition active:scale-95 motion-reduce:transform-none"
      >
        Sign up free
      </Link>
    </aside>
  );
}
