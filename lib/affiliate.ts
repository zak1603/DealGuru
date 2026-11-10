import type { Promo, Store } from "./types";

/** Builds the link a shopper is sent to, with affiliate tracking applied. */
export function outboundUrl(promo: Promo, store: Store): string {
  if (promo.affiliateUrl) return promo.affiliateUrl;

  const destination = new URL(promo.url);
  const { affiliate } = store;

  if (!affiliate) return destination.href;

  if ("template" in affiliate) {
    return affiliate.template.replace("{url}", encodeURIComponent(destination.href));
  }

  destination.searchParams.set(affiliate.param, affiliate.value);
  return destination.href;
}
