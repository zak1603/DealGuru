import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { AdPopup } from "@/components/ad-popup";
import { AnimatedWord } from "@/components/animated-word";
import { Countdown } from "@/components/countdown";
import { PromoBrowser } from "@/components/promo-browser";
import { getLiveAds } from "@/lib/ads";
import { blackFriday, isBlackFridayOver } from "@/lib/campaign";
import { getLivePromos } from "@/lib/promos";

export const metadata: Metadata = {
  title: `Black Friday ${blackFriday.year} Deals | Deal Guru`,
  description: `Black Friday and Cyber Monday ${blackFriday.year} sales from South Africa's favourite stores.`,
};

export default async function BlackFridayPage() {
  "use cache";
  cacheLife("hours");

  if (isBlackFridayOver()) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-20 text-center">
        <h1 className="display text-6xl">Eish, Black Friday is over</h1>
        <p className="mt-4 text-lg">But there are still lekker deals to find.</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-springbok px-5 py-2.5 font-bold text-white"
        >
          See all deals
        </Link>
      </main>
    );
  }

  return (
    <>
      <header className="beadwork bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 pt-6 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-[clamp(4rem,12vw,7.5rem)] text-marigold">
              <AnimatedWord text="Black Friday" />
            </h1>
            <p className="mt-3 text-lg font-medium">
              {blackFriday.dates}, through Cyber Monday. Get ready, Mzansi!
            </p>
          </div>
          <Countdown />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-8 pb-16">
        <PromoBrowser
          promos={getLivePromos().filter((promo) => promo.blackFriday)}
          featuredAds={getLiveAds("featured")}
        />
      </main>

      <AdPopup ads={getLiveAds("popup")} />
    </>
  );
}
