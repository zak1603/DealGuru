import { stores } from "../data/stores";
import { assertDay, assertHttpUrl, endOfDay, formatDay } from "./data-helpers";
import type { LivePromo, Promo, Store } from "./types";

const DAY_MS = 86_400_000;
const ENDING_SOON_DAYS = 3;

export function isExpired(promo: Promo, now = Date.now()) {
  return promo.expires !== undefined && endOfDay(promo.expires) < now;
}

/** Fails the build with a readable message if data/stores.ts has a mistake. */
function indexPromos(allStores: Store[]) {
  const index = new Map<string, { promo: Promo; store: Store }>();

  const slugs = new Set<string>();
  for (const store of allStores) {
    if (!/^[a-z0-9-]+$/.test(store.slug)) {
      throw new Error(`Store "${store.name}" slug must use only a-z, 0-9 and dashes`);
    }
    if (slugs.has(store.slug)) throw new Error(`Store slug "${store.slug}" is used more than once`);
    slugs.add(store.slug);
    if (!store.online === !store.branchNames?.length) {
      throw new Error(`Store "${store.name}" needs exactly one of online: true or branchNames`);
    }
    if (store.affiliate && "template" in store.affiliate) {
      assertHttpUrl(store.affiliate.template, `Store "${store.name}" affiliate template`);
      if (!store.affiliate.template.includes("{url}")) {
        throw new Error(`Store "${store.name}" affiliate template must contain {url}`);
      }
    }

    for (const promo of store.promos) {
      const label = `Promo "${promo.id}"`;
      if (index.has(promo.id)) throw new Error(`${label} is used more than once`);
      assertHttpUrl(promo.url, `${label} url`);
      if (promo.affiliateUrl) assertHttpUrl(promo.affiliateUrl, `${label} affiliateUrl`);
      if (promo.expires !== undefined) assertDay(promo.expires, `${label} expires`);
      index.set(promo.id, { promo, store });
    }
  }

  return index;
}

const promoIndex = indexPromos(stores);

export function findPromo(id: string) {
  return promoIndex.get(id);
}

/** Unexpired promos, soonest-ending first, with no-end-date promos last. */
export function getLivePromos(now = Date.now()): LivePromo[] {
  return [...promoIndex.values()]
    .filter(({ promo }) => !isExpired(promo, now))
    .sort(
      (a, b) =>
        (a.promo.expires ? endOfDay(a.promo.expires) : Infinity) -
        (b.promo.expires ? endOfDay(b.promo.expires) : Infinity),
    )
    .map(({ promo, store }) => ({
      id: promo.id,
      storeSlug: store.slug,
      storeName: store.name,
      online: store.online === true,
      headline: promo.headline,
      description: promo.description,
      code: promo.code,
      expiresLabel:
        promo.note ?? (promo.expires ? `Ends ${formatDay(promo.expires)}` : "No end date"),
      endingSoon:
        promo.expires !== undefined && endOfDay(promo.expires) - now < ENDING_SOON_DAYS * DAY_MS,
      blackFriday: promo.blackFriday === true,
    }));
}

export type StoreSummary = { slug: string; name: string; dealCount: number };

/** Every store, with how many live deals it has right now. */
export function getStoreSummaries(now = Date.now()): StoreSummary[] {
  const live = getLivePromos(now);
  return stores
    .map((store) => ({
      slug: store.slug,
      name: store.name,
      dealCount: live.filter((promo) => promo.storeSlug === store.slug).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findStore(slug: string) {
  return stores.find((store) => store.slug === slug);
}
