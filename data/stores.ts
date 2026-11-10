import type { Store } from "../lib/types";

/**
 * Every store and promo on the site lives in this file.
 *
 * THE ENTRIES BELOW ARE SAMPLES. The stores are made up, the links go to
 * example.com, and YOUR_ID is a placeholder. Replace them with real promos and
 * the tracking details from your affiliate accounts before going live.
 *
 * Three ways to earn commission, shown in the samples:
 *   1. affiliate: { template: "...{url}..." }    a network deep link (Awin, CJ, Rakuten, Impact)
 *   2. affiliate: { param: "tag", value: "..." } your ID added to the store's link (Amazon-style)
 *   3. affiliateUrl on one promo                 a ready-made link copied from your network
 *
 * Mistakes here (a duplicate id, a broken link) stop the site from building and
 * tell you which promo to fix, so a bad entry can't reach shoppers.
 */
export const stores: Store[] = [
  {
    slug: "harbor-pine",
    name: "Harbor & Pine",
    affiliate: {
      template: "https://example.com/network-click?publisher=YOUR_ID&destination={url}",
    },
    promos: [
      {
        id: "harbor-winter-25",
        headline: "25% off",
        description: "All winter jackets and outerwear.",
        code: "WARMUP25",
        url: "https://example.com/harbor-pine/winter",
        expires: "2026-12-31",
      },
      {
        id: "harbor-free-returns",
        headline: "Free returns",
        description: "On every order over $50, no code needed.",
        url: "https://example.com/harbor-pine/returns",
      },
    ],
  },
  {
    slug: "voltbox",
    name: "VoltBox Electronics",
    affiliate: { param: "tag", value: "YOUR_ID-20" },
    promos: [
      {
        id: "voltbox-headphones-40",
        headline: "40% off",
        description: "Wireless headphones and earbuds.",
        code: "QUIET40",
        url: "https://example.com/voltbox/audio",
        expires: "2026-11-13",
      },
      {
        id: "voltbox-20-back",
        headline: "$20 off",
        description: "Any order of $150 or more.",
        code: "VOLT20",
        url: "https://example.com/voltbox/sale",
        expires: "2027-01-15",
      },
      {
        id: "voltbox-cables",
        headline: "Buy 2, get 1",
        description: "Mix and match chargers and cables.",
        url: "https://example.com/voltbox/cables",
        expires: "2026-12-05",
      },
    ],
  },
  {
    slug: "fern-table",
    name: "Fern & Table",
    affiliate: {
      template: "https://example.com/network-click?publisher=YOUR_ID&destination={url}",
    },
    promos: [
      {
        id: "fern-cookware-30",
        headline: "30% off",
        description: "Cast iron and stainless cookware.",
        code: "SIZZLE30",
        url: "https://example.com/fern-table/cookware",
        expires: "2026-12-20",
      },
      {
        id: "fern-free-shipping",
        headline: "Free shipping",
        description: "Sitewide on orders over $35.",
        code: "SHIPFREE",
        url: "https://example.com/fern-table",
      },
    ],
  },
  {
    slug: "stride-co",
    name: "Stride Co.",
    promos: [
      {
        id: "stride-running-35",
        headline: "35% off",
        description: "Last season's running shoes.",
        url: "https://example.com/stride-co/running",
        affiliateUrl: "https://example.com/network-click?offer=12345&publisher=YOUR_ID",
        expires: "2026-11-12",
      },
      {
        id: "stride-first-order",
        headline: "15% off",
        description: "Your first order when you join the mailing list.",
        code: "HELLO15",
        url: "https://example.com/stride-co/join",
        affiliateUrl: "https://example.com/network-click?offer=67890&publisher=YOUR_ID",
      },
    ],
  },
  {
    slug: "glow-theory",
    name: "Glow Theory",
    affiliate: {
      template: "https://example.com/network-click?publisher=YOUR_ID&destination={url}",
    },
    promos: [
      {
        id: "glow-skincare-20",
        headline: "20% off",
        description: "All skincare sets.",
        code: "GLOW20",
        url: "https://example.com/glow-theory/sets",
        expires: "2026-12-24",
      },
      {
        id: "glow-gift",
        headline: "Free gift",
        description: "A travel-size serum with orders over $60.",
        url: "https://example.com/glow-theory/gift",
        expires: "2027-02-01",
      },
    ],
  },
  {
    slug: "little-otter",
    name: "Little Otter Toys",
    affiliate: { param: "ref", value: "YOUR_ID" },
    promos: [
      {
        id: "otter-blocks-50",
        headline: "50% off",
        description: "Wooden blocks and building sets.",
        code: "STACK50",
        url: "https://example.com/little-otter/blocks",
        expires: "2026-12-15",
      },
    ],
  },
];
