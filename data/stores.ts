import type { Store } from "../lib/types";

/**
 * Every store and promo on the site lives in this file.
 *
 * These are real offers, checked on 10 November 2026 against each store's own
 * page or South African news reports. Offers change fast, so recheck them and
 * remove any that have ended. Never add a code you can't confirm.
 *
 * None of these stores has affiliate tracking yet, so links go straight to the
 * store and earn nothing. Once you've joined a store's programme, add one of:
 *   1. affiliate: { template: "...{url}..." }    a network deep link
 *   2. affiliate: { param: "tag", value: "..." } your ID added to the store's link
 *   3. affiliateUrl on one promo                 a ready-made link from your network
 *
 * blackFriday: true also lists a promo on the Black Friday page.
 * note replaces the "Ends ..." text when the end date isn't confirmed.
 *
 * Every store needs one of these, for sorting deals by distance:
 *   online: true        the store only sells online
 *   branchNames: [...]  what its branches are called on OpenStreetMap. A branch
 *                       matches when its name starts with one of these as a
 *                       whole word, so "Game" matches "Game Menlyn" but not
 *                       "Games Workshop". Locations download on every build.
 *
 * Mistakes here (a duplicate id, a broken link) stop the site from building and
 * tell you which promo to fix, so a bad entry can't reach shoppers.
 */
export const stores: Store[] = [
  {
    slug: "takealot",
    name: "Takealot",
    online: true,
    promos: [
      {
        id: "takealot-black-november",
        headline: "Up to 50% off",
        description: "Black November specials on selected products, with new deals every week.",
        url: "https://www.takealot.com/deals",
        expires: "2026-11-23",
        blackFriday: true,
      },
      {
        id: "takealot-blue-dot-sale",
        headline: "Blue Dot Sale",
        description: "Takealot's main Black Friday event, with exclusive deals from midnight.",
        url: "https://www.takealot.com/blue-dot-sale",
        expires: "2026-11-30",
        note: "Starts 27 Nov 2026",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "superbalist",
    name: "Superbalist",
    online: true,
    promos: [
      {
        id: "superbalist-black-friday",
        headline: "Up to 80% off",
        description: "Selected fashion, sneakers, beauty and homeware on the two biggest sale days.",
        url: "https://superbalist.com/blackfriday-sale",
        expires: "2026-11-30",
        note: "27 and 30 Nov 2026 only",
        blackFriday: true,
      },
      {
        id: "superbalist-black-november",
        headline: "Up to 70% off",
        description: "Black November sale on fashion and sneakers, with new markdowns daily.",
        url: "https://superbalist.com/blackfriday-sale",
        expires: "2026-11-30",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "woolworths",
    name: "Woolworths",
    branchNames: ["Woolworths"],
    promos: [
      {
        id: "woolworths-fashion",
        headline: "30% off",
        description: "Selected fashion, footwear and accessories.",
        url: "https://www.woolworths.co.za/browse/black-friday",
        expires: "2026-11-18",
        blackFriday: true,
      },
      {
        id: "woolworths-home-beauty",
        headline: "20% off",
        description: "Selected homeware and beauty products.",
        url: "https://www.woolworths.co.za/browse/black-friday",
        expires: "2026-11-30",
        note: "End date varies, check in store",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "makro",
    name: "Makro",
    branchNames: ["Makro"],
    promos: [
      {
        id: "makro-black-friday",
        headline: "Up to 50% off",
        description: "Black Friday deals on big-ticket items, tech, appliances and essentials.",
        url: "https://www.makro.co.za/black-friday-store",
        expires: "2026-11-30",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "game",
    name: "Game",
    branchNames: ["Game"],
    promos: [
      {
        id: "game-black-friday",
        headline: "Up to 50% off",
        description: "Month-long Black Friday deals on tech, appliances and household goods.",
        url: "https://www.game.co.za/event/black-friday",
        expires: "2026-11-30",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "builders",
    name: "Builders",
    branchNames: ["Builders Warehouse", "Builders Express", "Builders Superstore", "Builders"],
    promos: [
      {
        id: "builders-black-friday",
        headline: "Up to 50% off",
        description: "Month-long Black Friday deals on tools, braais and home improvement.",
        url: "https://www.builders.co.za/black-friday",
        expires: "2026-11-30",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "amazon-za",
    name: "Amazon South Africa",
    online: true,
    promos: [
      {
        id: "amazon-early-black-friday",
        headline: "Up to 50% off",
        description: "Early Black Friday deals on electronics, headphones, beauty, tools and home.",
        url: "https://www.amazon.co.za/events/blackfriday",
        expires: "2026-11-30",
        note: "End date not announced",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "bash",
    name: "Bash",
    online: true,
    promos: [
      {
        id: "bash-black-friday",
        headline: "Up to 75% off",
        description: "Black Friday deals on selected clothing, footwear and accessories.",
        url: "https://bash.com/black-friday",
        expires: "2026-11-30",
        note: "End date not announced",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "dis-chem",
    name: "Dis-Chem",
    branchNames: ["Dis-Chem"],
    promos: [
      {
        id: "dischem-sonicare",
        headline: "R450 off",
        description: "Philips Sonicare 2000 toothbrush, now R449.99 (was R899.99).",
        url: "https://www.dischem.co.za/promotions/black-friday",
        expires: "2026-11-30",
        note: "While stocks last",
        blackFriday: true,
      },
      {
        id: "dischem-earbuds",
        headline: "R200 off",
        description: "Motorola Wireless Earbuds 100, now R599 (was R799).",
        url: "https://www.dischem.co.za/promotions/black-friday",
        expires: "2026-11-30",
        note: "While stocks last",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "hificorp",
    name: "HiFiCorp",
    branchNames: ["HiFi Corp", "HiFi Corporation"],
    promos: [
      {
        id: "hificorp-black-november",
        headline: "Black November",
        description: "Extended Black Friday deals all month on tech and appliances.",
        url: "https://www.hificorp.co.za/",
        expires: "2026-11-30",
        blackFriday: true,
      },
    ],
  },
  {
    slug: "incredible",
    name: "Incredible",
    branchNames: ["Incredible Connection"],
    promos: [
      {
        id: "incredible-black-november",
        headline: "Black November",
        description: "Extended Black Friday deals all month on laptops, tech and appliances.",
        url: "https://www.incredible.co.za/",
        expires: "2026-11-30",
        blackFriday: true,
      },
    ],
  },
];
