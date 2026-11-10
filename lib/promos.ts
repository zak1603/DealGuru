import { stores } from "../data/stores";
import type { LivePromo, Promo, Store } from "./types";

const DAY_MS = 86_400_000;
const ENDING_SOON_DAYS = 3;

const dateLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const expiryTime = (expires: string) => Date.parse(`${expires}T23:59:59.999Z`);

export function isExpired(promo: Promo, now = Date.now()) {
  return promo.expires !== undefined && expiryTime(promo.expires) < now;
}

function assertHttpUrl(value: string, label: string) {
  if (!URL.canParse(value) || !/^https?:$/.test(new URL(value).protocol)) {
    throw new Error(`${label} must be a full link starting with http:// or https://`);
  }
}

/** Fails the build with a readable message if data/stores.ts has a mistake. */
function indexPromos(allStores: Store[]) {
  const index = new Map<string, { promo: Promo; store: Store }>();

  for (const store of allStores) {
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
      if (
        promo.expires !== undefined &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(promo.expires) || Number.isNaN(expiryTime(promo.expires)))
      ) {
        throw new Error(`${label} expires must look like 2026-12-31`);
      }
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
        (a.promo.expires ? expiryTime(a.promo.expires) : Infinity) -
        (b.promo.expires ? expiryTime(b.promo.expires) : Infinity),
    )
    .map(({ promo, store }) => ({
      id: promo.id,
      storeSlug: store.slug,
      storeName: store.name,
      headline: promo.headline,
      description: promo.description,
      code: promo.code,
      expiresLabel: promo.expires
        ? `Ends ${dateLabel.format(expiryTime(promo.expires))}`
        : "No end date",
      endingSoon:
        promo.expires !== undefined &&
        expiryTime(promo.expires) - now < ENDING_SOON_DAYS * DAY_MS,
    }));
}
