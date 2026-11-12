import { stores as backupStores } from "../data/stores";
import { getCatalog } from "./catalog";
import { assertDay, assertHttpUrl, endOfDay, formatDay } from "./data-helpers";
import type { LivePromo, Promo, Store } from "./types";

const DAY_MS = 86_400_000;
const ENDING_SOON_DAYS = 3;

type Indexed = Map<string, { promo: Promo; store: Store }>;

export function isExpired(promo: Promo, now = Date.now()) {
  return promo.expires !== undefined && endOfDay(promo.expires) < now;
}

function checkStore(store: Store) {
  if (store.affiliate && "template" in store.affiliate) {
    assertHttpUrl(store.affiliate.template, `Store "${store.name}" affiliate template`);
    if (!store.affiliate.template.includes("{url}")) {
      throw new Error(`Store "${store.name}" affiliate template must contain {url}`);
    }
  }
}

function checkPromo(promo: Promo, index: Indexed) {
  const label = `Promo "${promo.id}"`;
  if (index.has(promo.id)) throw new Error(`${label} is used more than once`);
  assertHttpUrl(promo.url, `${label} url`);
  if (promo.affiliateUrl) assertHttpUrl(promo.affiliateUrl, `${label} affiliateUrl`);
  if (promo.expires !== undefined) assertDay(promo.expires, `${label} expires`);
}

/**
 * Indexes promos by id. A mistake in data/stores.ts stops the build with a
 * readable message. A bad row from the database is skipped instead, so one
 * typo on the admin page can't take the site down.
 */
function indexPromos(stores: Store[], strict: boolean): Indexed {
  const index: Indexed = new Map();
  for (const store of stores) {
    try {
      checkStore(store);
    } catch (error) {
      if (strict) throw error;
      console.error(error);
      continue;
    }
    for (const promo of store.promos) {
      try {
        checkPromo(promo, index);
      } catch (error) {
        if (strict) throw error;
        console.error(error);
        continue;
      }
      index.set(promo.id, { promo, store });
    }
  }
  return index;
}

// The backup copy is checked when the site builds, so it's always safe to fall back to.
indexPromos(backupStores, true);

async function getIndex() {
  const { stores, fromBackup } = await getCatalog();
  return indexPromos(stores, fromBackup);
}

export async function findPromo(id: string) {
  return (await getIndex()).get(id);
}

/** Unexpired promos, soonest-ending first, with no-end-date promos last. */
export async function getLivePromos(now = Date.now()): Promise<LivePromo[]> {
  return [...(await getIndex()).values()]
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
