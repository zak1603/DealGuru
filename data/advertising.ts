import type { Ad, AdPackage } from "../lib/types";

/**
 * What businesses can buy on the Advertise page.
 *
 * THESE PRICES ARE PLACEHOLDERS. Set your own, create a matching payment link
 * for each one, and paste it into paymentLink. The button reads "Coming soon"
 * and takes no money until that link and adDetailsFormUrl below are both added.
 */
export const adPackages: AdPackage[] = [
  {
    id: "featured-week",
    name: "Featured card",
    price: "R499",
    description: "Your offer pinned above all the deals for 7 days.",
    paymentLink: "",
  },
  {
    id: "popup-week",
    name: "Pop-up ad",
    price: "R999",
    description: "Your offer slides in for shoppers on the deal pages for 7 days.",
    paymentLink: "",
  },
  {
    id: "black-friday-popup",
    name: "Black Friday pop-up",
    price: "R2 499",
    description: "Your pop-up runs 23–30 November, through Black Friday and Cyber Monday.",
    paymentLink: "",
  },
];

/**
 * The link to your Google Form, where advertisers send their store name, link
 * to promote, offer details, start date and the email they paid from.
 */
export const adDetailsFormUrl = "";

/**
 * Ads that are running or booked. Each one goes live on its start date and
 * disappears after its end date. Add one like this after you've reviewed it:
 *
 *   {
 *     id: "mystore-nov-popup",        // unique, no spaces
 *     advertiser: "My Store",
 *     headline: "30% off",
 *     description: "Everything this weekend.",
 *     code: "SAVE30",                 // leave this line out if no code is needed
 *     url: "https://mystore.co.za/sale",
 *     placement: "popup",             // or "featured"
 *     starts: "2026-11-23",
 *     ends: "2026-11-30",
 *   },
 */
export const ads: Ad[] = [];
