import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PromoBrowser } from "@/components/promo-browser";
import { stores } from "@/data/stores";
import { findStore, getLivePromos } from "@/lib/promos";

export async function generateStaticParams() {
  return stores.map((store) => ({ slug: store.slug }));
}

export async function generateMetadata({ params }: PageProps<"/stores/[slug]">): Promise<Metadata> {
  const store = findStore((await params).slug);
  if (!store) return {};
  const title = `${store.name} promo codes and deals | Deal Guru`;
  const description = `Current ${store.name} sales, specials and promo codes in South Africa, checked and in one place.`;
  return {
    title,
    description,
    alternates: { canonical: `/stores/${store.slug}` },
    openGraph: { title, description, url: `/stores/${store.slug}` },
  };
}

export default async function StorePage({ params }: PageProps<"/stores/[slug]">) {
  const { slug } = await params;
  if (!findStore(slug)) notFound();
  return <StoreDeals slug={slug} />;
}

async function StoreDeals({ slug }: { slug: string }) {
  "use cache";
  // Re-checks dates hourly so ended promos drop off without a redeploy.
  cacheLife("hours");

  const store = findStore(slug)!;
  const promos = getLivePromos().filter((promo) => promo.storeSlug === slug);

  return (
    <>
      <header className="beadwork bg-springbok text-white">
        <div className="mx-auto max-w-6xl px-5 pt-5 pb-8">
          <Link
            href="/stores"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            All stores
          </Link>
          <h1 className="display mt-3 text-[clamp(3.25rem,10vw,6rem)] text-marigold">
            {store.name}
          </h1>
          <p className="mt-2 text-lg font-medium">
            {promos.length > 0
              ? `${promos.length} lekker ${promos.length === 1 ? "deal" : "deals"} right now.`
              : "No deals right now. Check back soon."}
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-8 pb-16">
        {promos.length > 0 ? (
          <PromoBrowser promos={promos} featuredAds={[]} showStores={false} />
        ) : (
          <div className="mt-6 text-center">
            <p className="display text-4xl">Eish, nothing on at {store.name}</p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-springbok px-5 py-2.5 font-bold text-white"
            >
              See all deals
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
