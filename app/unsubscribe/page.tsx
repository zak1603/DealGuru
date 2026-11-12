import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribePanel } from "@/components/unsubscribe-panel";

export const metadata: Metadata = {
  title: "Unsubscribe | Deal Guru",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 pt-10 pb-16">
      <h1 className="display mb-6 text-6xl">Unsubscribe</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <UnsubscribePanel />
      </Suspense>
    </main>
  );
}
