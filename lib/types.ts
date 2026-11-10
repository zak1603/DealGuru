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
  /** Last valid day, as "YYYY-MM-DD" (South African time). Leave out if it has no end date. */
  expires?: string;
  /** Replaces the "Ends ..." text, e.g. when the end date isn't confirmed. */
  note?: string;
  /** Also lists this promo on the Black Friday page. */
  blackFriday?: boolean;
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
  blackFriday: boolean;
};

export type Ad = {
  id: string;
  advertiser: string;
  headline: string;
  description: string;
  code?: string;
  /** Where the ad sends people. */
  url: string;
  /** "featured" pins a card above the deals. "popup" slides in at the bottom of the screen. */
  placement: "featured" | "popup";
  /** First day the ad runs, as "YYYY-MM-DD" (South African time). */
  starts: string;
  /** Last day the ad runs, as "YYYY-MM-DD" (South African time). */
  ends: string;
};

export type LiveAd = {
  id: string;
  advertiser: string;
  headline: string;
  description: string;
  code?: string;
  href: string;
  endsLabel: string;
};

export type AdPackage = {
  id: string;
  name: string;
  /** Shown as written, e.g. "R499". Must match the price of the payment link. */
  price: string;
  description: string;
  /** A payment link from Payfast, Yoco or PayPal. While empty, the button reads "Coming soon". */
  paymentLink?: string;
};
