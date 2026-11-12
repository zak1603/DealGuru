"use client";

import { Heart, Share2 } from "lucide-react";
import { toggleSaved, useSavedDeals } from "@/lib/saved-deals";

const iconButton =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink/60 transition hover:bg-marigold/30 hover:text-ink active:scale-90 motion-reduce:transform-none";

export function SaveButton({ id, label }: { id: string; label: string }) {
  const saved = useSavedDeals().has(id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${label}`}
      title={saved ? "Saved" : "Save for later"}
      onClick={() => toggleSaved(id)}
      className={iconButton}
    >
      <Heart
        className={`size-[18px] ${saved ? "animate-tick fill-tomato text-tomato motion-reduce:animate-none" : ""}`}
        aria-hidden
      />
    </button>
  );
}

export function ShareButton({ url, text }: { url: string; text: string }) {
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Deal Guru", text, url });
      } catch {}
      return; // Cancelled or done, either way the share sheet handled it.
    }
    // Desktop browsers without a share sheet: WhatsApp is how most of Mzansi shares.
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      "_blank",
      "noopener",
    );
  }

  return (
    <button type="button" onClick={share} aria-label={`Share: ${text}`} title="Share" className={iconButton}>
      <Share2 className="size-[18px]" aria-hidden />
    </button>
  );
}
