import { adDetailsFormUrl, adPackages, ads } from "../data/advertising";
import { assertDay, assertHttpUrl, endOfDay, formatDay, startOfDay } from "./data-helpers";
import type { Ad, LiveAd } from "./types";

/** Fails the build with a readable message if data/advertising.ts has a mistake. */
function validateAdvertising() {
  const ids = new Set<string>();

  for (const ad of ads) {
    const label = `Ad "${ad.id}"`;
    if (ids.has(ad.id)) throw new Error(`${label} is used more than once`);
    ids.add(ad.id);
    assertHttpUrl(ad.url, `${label} url`);
    assertDay(ad.starts, `${label} starts`);
    assertDay(ad.ends, `${label} ends`);
    if (endOfDay(ad.ends) < startOfDay(ad.starts)) throw new Error(`${label} ends before it starts`);
  }

  for (const adPackage of adPackages) {
    if (adPackage.paymentLink) {
      assertHttpUrl(adPackage.paymentLink, `Ad package "${adPackage.name}" paymentLink`);
    }
  }

  if (adDetailsFormUrl) assertHttpUrl(adDetailsFormUrl, "adDetailsFormUrl");
}

validateAdvertising();

/** Ads whose run dates include right now. */
export function getLiveAds(placement: Ad["placement"], now = Date.now()): LiveAd[] {
  return ads
    .filter(
      (ad) =>
        ad.placement === placement && startOfDay(ad.starts) <= now && now <= endOfDay(ad.ends),
    )
    .map((ad) => ({
      id: ad.id,
      advertiser: ad.advertiser,
      headline: ad.headline,
      description: ad.description,
      code: ad.code,
      href: ad.url,
      endsLabel: `Ends ${formatDay(ad.ends)}`,
    }));
}
