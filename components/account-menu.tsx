"use client";

import Link from "next/link";
import { firstNameOf, signOut, useShopper } from "@/lib/shopper";
import { signUpOpen } from "@/lib/supabase-config";

export function AccountMenu() {
  const { user } = useShopper();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline">Hi, {firstNameOf(user)}</span>
        <button type="button" onClick={() => void signOut()} className="cursor-pointer hover:text-marigold">
          Log out
        </button>
      </div>
    );
  }

  if (!signUpOpen) return null;

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="hover:text-marigold">
        Log in
      </Link>
      <Link
        href="/login?mode=signup"
        className="rounded-lg bg-marigold px-3 py-1.5 text-ink transition active:scale-95 motion-reduce:transform-none"
      >
        Sign up
      </Link>
    </div>
  );
}
