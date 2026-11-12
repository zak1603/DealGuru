"use client";

import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { loginEnabled } from "@/lib/supabase";

export function AccountButton() {
  const auth = useAuth();
  if (!loginEnabled) return null;

  const signedIn = auth.status === "signed-in";
  return (
    <Link
      href="/account"
      className={`flex items-center gap-1 hover:text-marigold ${auth.status === "loading" ? "invisible" : ""}`}
    >
      {signedIn && <CircleUserRound className="size-4" aria-hidden />}
      {signedIn ? "Account" : "Log in"}
    </Link>
  );
}
