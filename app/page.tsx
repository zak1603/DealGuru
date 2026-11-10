import { cacheLife } from "next/cache";
import { PromoBrowser } from "@/components/promo-browser";
import { getLivePromos } from "@/lib/promos";

export default async function Home() {
  "use cache";
  // Re-checks expiry dates hourly so ended promos drop off without a redeploy.
  cacheLife("hours");

  const promos = getLivePromos();

  return (
    <>
      <header className="scalloped bg-marigold">
        <div className="mx-auto max-w-6xl px-5 pt-8 pb-9 sm:pt-12 sm:pb-12">
          <h1 className="display text-[clamp(4.5rem,15vw,10rem)]">Deal Guru</h1>
          <p className="mt-3 max-w-xl text-lg font-medium sm:text-xl">
            Promo codes and sales from the stores you shop, all in one place.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-6 pb-16">
        <PromoBrowser promos={promos} />
      </main>

      <footer className="border-t border-ink/15">
        <p className="mx-auto max-w-6xl px-5 py-6 text-sm text-ink/70">
          Deal Guru may earn a commission when you buy through links on this site, at no extra cost
          to you. Offers are set by each store and can change without notice.
        </p>
      </footer>
    </>
  );
}
