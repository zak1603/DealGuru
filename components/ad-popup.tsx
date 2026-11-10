"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { CopyCode } from "@/components/copy-code";
import { GetDealLink } from "@/components/deal-card";
import type { LiveAd } from "@/lib/types";

const SHOW_AFTER_MS = 6000;
const DISMISSED_KEY = "deal-guru-popup-dismissed";

export function PopupCard({
  advertiser,
  headline,
  description,
  code,
  href,
  onClose,
}: {
  advertiser: string;
  headline: string;
  description: string;
  code?: string;
  href?: string;
  onClose?: () => void;
}) {
  return (
    <aside
      aria-label="Sponsored offer"
      className="rounded-2xl bg-white p-4 shadow-[0_8px_32px_rgb(22_19_14/0.3)] ring-2 ring-marigold"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <span className="shrink-0 rounded bg-marigold px-1.5 py-0.5 text-xs font-bold">
            Sponsored
          </span>
          <span className="truncate">{advertiser}</span>
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ad"
            className="-m-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/70 hover:bg-ink/10 hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        )}
      </div>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="display shrink-0 text-3xl">{headline}</span>
        <span className="truncate text-sm text-ink/80">{description}</span>
      </p>
      <div className="mt-3 flex items-stretch gap-2">
        {code ? <CopyCode code={code} /> : <span className="flex-1" />}
        <GetDealLink href={href} label={`Get deal: ${headline} at ${advertiser}`} />
      </div>
    </aside>
  );
}

/** A small slide-in rather than a full-screen overlay, which Google penalizes. */
export function AdPopup({ ads }: { ads: LiveAd[] }) {
  const [ad, setAd] = useState<LiveAd | null>(null);

  useEffect(() => {
    if (ads.length === 0 || sessionStorage.getItem(DISMISSED_KEY)) return;

    const timer = setTimeout(() => {
      setAd(ads[Math.floor(Math.random() * ads.length)]);
    }, SHOW_AFTER_MS);

    return () => clearTimeout(timer);
  }, [ads]);

  if (!ad) return null;

  return (
    <div className="fixed right-4 bottom-4 left-4 z-20 animate-popup motion-reduce:animate-none sm:left-auto sm:w-96">
      <PopupCard
        advertiser={ad.advertiser}
        headline={ad.headline}
        description={ad.description}
        code={ad.code}
        href={ad.href}
        onClose={() => {
          sessionStorage.setItem(DISMISSED_KEY, "1");
          setAd(null);
        }}
      />
    </div>
  );
}
