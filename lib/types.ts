/** How a store's links earn commission. */
export type Affiliate =
  /** A network link containing {url}, where the store page gets inserted. */
  | { template: string }
  /** A programme that adds your ID to the store's own link, e.g. ?tag=you-20. */
  | { param: string; value: string };

export type Promo = {
  /** Unique across the whole site. Used in the outbound link. */
  id: string;
  /** The big text on the card, e.g. "25% off" or "Free shipping". */
  headline: string;
  description: string;
  /** Leave out when the shopper doesn't need a code. */
  code?: string;
  /** The page on the store's website. */
  url: string;
  /** A ready-made tracking link for this promo. Overrides the store's affiliate setting. */
  affiliateUrl?: string;
  /** Last valid day, as "YYYY-MM-DD" (UTC). Leave out if it has no end date. */
  expires?: string;
};

export type Store = {
  slug: string;
  name: string;
  /** Leave out to link straight to the store with no commission. */
  affiliate?: Affiliate;
  promos: Promo[];
};

/** What the browser receives. Destination URLs and affiliate settings stay on the server. */
export type LivePromo = {
  id: string;
  storeSlug: string;
  storeName: string;
  headline: string;
  description: string;
  code?: string;
  expiresLabel: string;
  endingSoon: boolean;
};
