"use client";

import { ArrowUpRight, Clock, Search, X } from "lucide-react";
import { useState } from "react";
import { CopyCode } from "@/components/copy-code";
import type { LivePromo } from "@/lib/types";

function PromoCard({ promo }: { promo: LivePromo }) {
  return (
    <article className="flex flex-col rounded-2xl bg-white shadow-[0_1px_2px_rgb(22_19_14/0.08),0_12px_24px_-16px_rgb(22_19_14/0.35)]">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold">{promo.storeName}</p>
          {promo.endingSoon && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-tomato">
              <Clock className="size-3.5" aria-hidden />
              Ending soon
            </span>
          )}
        </div>
        <h2 className="display mt-4 text-5xl">{promo.headline}</h2>
        <p className="mt-3 flex-1 text-[15px] leading-snug text-ink/80">{promo.description}</p>
        <p className="mt-3 text-xs font-medium text-ink/60">{promo.expiresLabel}</p>
      </div>

      <div className="perforation flex items-stretch gap-2 p-4">
        {promo.code ? (
          <CopyCode code={promo.code} />
        ) : (
          <p className="flex flex-1 items-center px-1 text-sm font-medium text-ink/60">
            No code needed
          </p>
        )}
        {/* A plain link, because Next's <Link> would prefetch and fake affiliate clicks. */}
        <a
          href={`/api/redirect/${promo.id}`}
          target="_blank"
          rel="sponsored nofollow noopener"
          aria-label={`Get deal: ${promo.headline} at ${promo.storeName} (opens in a new tab)`}
          className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-marigold transition-transform hover:-translate-y-0.5"
        >
          Get deal
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>
    </article>
  );
}

function StoreChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-ink text-marigold" : "bg-white text-ink hover:bg-marigold/40"
      }`}
    >
      {label}
      <span className={active ? "text-marigold/70" : "text-ink/50"}>{count}</span>
    </button>
  );
}

export function PromoBrowser({ promos }: { promos: LivePromo[] }) {
  const [query, setQuery] = useState("");
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  const stores = [...new Map(promos.map((p) => [p.storeSlug, p.storeName]))]
    .map(([slug, name]) => ({
      slug,
      name,
      count: promos.filter((p) => p.storeSlug === slug).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const visible = promos.filter((promo) => {
    if (storeSlug && promo.storeSlug !== storeSlug) return false;
    const text = `${promo.storeName} ${promo.headline} ${promo.description}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });

  const isFiltered = words.length > 0 || storeSlug !== null;

  return (
    <>
      <div className="sticky top-0 z-10 -mx-5 space-y-3 bg-paper/95 px-5 py-3 backdrop-blur">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink/50"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stores or deals"
            aria-label="Search stores or deals"
            className="w-full rounded-xl border-2 border-ink bg-white py-2.5 pr-4 pl-11 text-base placeholder:text-ink/50"
          />
        </div>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-0.5">
          <StoreChip
            label="All stores"
            count={promos.length}
            active={storeSlug === null}
            onClick={() => setStoreSlug(null)}
          />
          {stores.map((store) => (
            <StoreChip
              key={store.slug}
              label={store.name}
              count={store.count}
              active={storeSlug === store.slug}
              onClick={() => setStoreSlug(store.slug)}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-ink/70" aria-live="polite">
        {visible.length} {visible.length === 1 ? "promo" : "promos"}
      </p>

      {visible.length > 0 ? (
        <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      ) : (
        <div className="mt-10 text-center">
          <p className="display text-4xl">
            {isFiltered ? "No matching promos" : "No promos right now"}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStoreSlug(null);
              }}
              className="mx-auto mt-4 flex cursor-pointer items-center gap-1 rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-marigold"
            >
              <X className="size-4" aria-hidden />
              Clear filters
            </button>
          )}
        </div>
      )}
    </>
  );
}
