"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { DealCard } from "@/components/deal-card";
import type { LiveAd, LivePromo } from "@/lib/types";

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
      className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition active:scale-95 motion-reduce:transform-none ${
        active ? "bg-springbok text-white" : "bg-white text-ink hover:bg-marigold/40"
      }`}
    >
      {label}
      <span className={active ? "text-white/75" : "text-ink/50"}>{count}</span>
    </button>
  );
}

export function PromoBrowser({
  promos,
  featuredAds,
}: {
  promos: LivePromo[];
  featuredAds: LiveAd[];
}) {
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
  // Someone narrowing down the list wants matches, so ads step aside.
  const visibleAds = isFiltered ? [] : featuredAds;

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
            placeholder="Looking for something lekker?"
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
        {visible.length} lekker {visible.length === 1 ? "deal" : "deals"}
      </p>

      {visible.length > 0 ? (
        <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleAds.map((ad, index) => (
            <DealCard
              key={ad.id}
              revealIndex={index}
              storeName={ad.advertiser}
              headline={ad.headline}
              description={ad.description}
              code={ad.code}
              note={ad.endsLabel}
              href={ad.href}
              flag="sponsored"
            />
          ))}
          {visible.map((promo, index) => (
            <DealCard
              key={promo.id}
              revealIndex={visibleAds.length + index}
              storeName={promo.storeName}
              headline={promo.headline}
              description={promo.description}
              code={promo.code}
              note={promo.expiresLabel}
              href={`/api/redirect/${promo.id}`}
              flag={
                promo.endingSoon ? "ending-soon" : promo.blackFriday ? "black-friday" : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 text-center">
          <p className="display text-4xl">
            {isFiltered ? "Eish, no matches" : "Eish, no deals right now"}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStoreSlug(null);
              }}
              className="mx-auto mt-4 flex cursor-pointer items-center gap-1 rounded-lg bg-springbok px-4 py-2.5 text-sm font-bold text-white"
            >
              <X className="size-4" aria-hidden />
              Start over
            </button>
          )}
        </div>
      )}
    </>
  );
}
