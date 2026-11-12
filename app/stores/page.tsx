import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getStoreSummaries } from "@/lib/promos";

export const metadata: Metadata = {
  title: "All stores | Deal Guru",
  description: "Every South African store on Deal Guru, with how many deals each has on right now.",
  alternates: { canonical: "/stores" },
};

export default async function StoresPage() {
  "use cache";
  cacheLife("hours");

  const summaries = getStoreSummaries();

  return (
    <>
      <header className="beadwork bg-springbok text-white">
        <div className="mx-auto max-w-6xl px-5 pt-6 pb-8">
          <h1 className="display text-[clamp(3.25rem,10vw,6rem)] text-marigold">All stores</h1>
          <p className="mt-2 text-lg font-medium">Pick a store to see all its deals.</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-8 pb-16">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((store) => (
            <li key={store.slug}>
              <Link
                href={`/stores/${store.slug}`}
                className="group flex items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgb(22_19_14/0.08)] transition hover:-translate-y-0.5 hover:ring-2 hover:ring-marigold motion-reduce:transform-none"
              >
                <span>
                  <span className="display block text-3xl">{store.name}</span>
                  <span className="text-sm font-medium text-ink/60">
                    {store.dealCount === 0
                      ? "No deals right now"
                      : `${store.dealCount} ${store.dealCount === 1 ? "deal" : "deals"}`}
                  </span>
                </span>
                <ArrowRight
                  className="size-5 shrink-0 text-springbok transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
