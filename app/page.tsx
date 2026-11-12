import { cacheLife } from "next/cache";
import { AdPopup } from "@/components/ad-popup";
import { AnimatedWord } from "@/components/animated-word";
import { BlackFridayBanner } from "@/components/black-friday-banner";
import { JoinBanner } from "@/components/join-banner";
import { PromoBrowser } from "@/components/promo-browser";
import { getLiveAds } from "@/lib/ads";
import { isBlackFridayOver } from "@/lib/campaign";
import { getLivePromos } from "@/lib/promos";

export default async function Home() {
  "use cache";
  // Refreshes about once a minute, so deals saved on the admin page show up quickly
  // and ended ones drop off without a redeploy.
  cacheLife("minutes");
  const promos = await getLivePromos();

  return (
    <>
      <header className="beadwork bg-springbok text-white">
        <div className="mx-auto max-w-6xl px-5 pt-5 pb-7 sm:pt-8 sm:pb-10">
          <p className="mb-2 animate-rise text-lg font-bold motion-reduce:animate-none sm:text-xl">
            Howzit, Mzansi!
          </p>
          <h1 className="display text-[clamp(4rem,12vw,7.5rem)] text-marigold">
            <AnimatedWord text="Deal Guru" />
          </h1>
          <p
            className="mt-3 max-w-xl animate-rise text-lg font-medium motion-reduce:animate-none sm:text-xl"
            style={{ animationDelay: "350ms" }}
          >
            Lekker deals from South Africa&apos;s favourite stores, all in one place.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-11 pb-16">
        {!isBlackFridayOver() && (
          <div className="mb-3 animate-rise motion-reduce:animate-none" style={{ animationDelay: "250ms" }}>
            <BlackFridayBanner />
          </div>
        )}
        <PromoBrowser promos={promos} featuredAds={getLiveAds("featured")} />
        <JoinBanner />
      </main>

      <AdPopup ads={getLiveAds("popup")} />
    </>
  );
}
