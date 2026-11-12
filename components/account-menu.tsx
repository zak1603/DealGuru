"use client";

import { LogIn } from "lucide-react";
import { useState } from "react";
import { signInWithGoogle, signOut, useShopper } from "@/lib/shopper";
import { googleSignInReady } from "@/lib/supabase-config";

function firstName(metadata: Record<string, unknown>, email?: string) {
  const name = metadata.full_name ?? metadata.name;
  if (typeof name === "string" && name.trim()) return name.trim().split(/\s+/)[0];
  return email?.split("@")[0] ?? "there";
}

export function AccountMenu() {
  const { user } = useShopper();
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline">Hi, {firstName(user.user_metadata ?? {}, user.email)}</span>
        <button type="button" onClick={() => void signOut()} className="cursor-pointer hover:text-marigold">
          Sign out
        </button>
      </div>
    );
  }

  if (!googleSignInReady) return null;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        signInWithGoogle().catch(() => setBusy(false));
      }}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-marigold px-3 py-1.5 text-ink transition active:scale-95 disabled:opacity-70 motion-reduce:transform-none"
    >
      <LogIn className="size-4" aria-hidden />
      Sign in
    </button>
  );
}
