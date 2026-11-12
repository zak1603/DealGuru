import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPanel } from "@/components/login-panel";
import { signUpOpen } from "@/lib/supabase-config";

export const metadata: Metadata = {
  title: "Log in or sign up | Deal Guru",
  description: "Log in to Deal Guru, or join free to get the latest deals by email every week.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 pt-10 pb-16">
      <h1 className="display text-6xl">{signUpOpen ? "Join the guru" : "Log in"}</h1>
      <p className="mt-2 mb-6 max-w-xl text-lg">
        {signUpOpen
          ? "Join free to save your location across devices and get the week's lekker deals in your inbox."
          : "Log in to your Deal Guru account."}
      </p>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginPanel />
      </Suspense>
    </main>
  );
}
