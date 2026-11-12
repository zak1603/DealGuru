# Deal Guru

A website that lists promo codes and sales from different retail stores. Every "Get deal" button goes through your affiliate link.

## Run it

You need [Node.js](https://nodejs.org) installed.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Add stores and promos

Everything is in [data/stores.ts](data/stores.ts). The entries there are real South African offers, checked on 10 November 2026. Offers change fast, so recheck them and remove any that have ended. Most of them end by 30 November, so add new deals before then or the site will run out.

Each promo looks like this:

```ts
{
  id: "mystore-summer-20",     // unique, no spaces
  headline: "20% off",         // the big text on the card
  description: "All summer dresses.",
  code: "SUMMER20",            // leave this line out if no code is needed
  url: "https://mystore.com/summer",
  expires: "2026-12-31",       // last valid day; leave out if there's no end date
},
```

Expired promos disappear from the site by themselves, within about an hour.

## What shoppers can do

- **Store pages.** Every store gets its own page at `/stores/<slug>` (for example `/stores/takealot`), and `/stores` lists them all. These pages help people find you on Google. Store names on deal cards link to them. The `slug` on each store in [data/stores.ts](data/stores.ts) sets the address, so keep it lowercase with dashes and don't change it once the site is live.
- **Save deals.** The heart on a card saves it in that shopper's browser, with no account needed. A "Saved" filter appears once they've saved something.
- **Share deals.** The share button opens the phone's share sheet, or WhatsApp on a computer, with a link straight to that deal.
- **"Has a code" filter.** Appears by itself once any live promo has a `code`.

The sitemap at `/sitemap.xml` updates itself as you add stores. Submit it once in [Google Search Console](https://search.google.com/search-console). If the site moves to its own domain, change the address in [lib/site.ts](lib/site.ts).

## Connect your affiliate accounts

Sign up with an affiliate network or a store's own programme, then use whichever option matches what they give you:

| What your network gives you | What to add |
| --- | --- |
| A link format you can put any store page into | On the store: `affiliate: { template: "https://network.com/click?id=123&url={url}" }`. `{url}` is where the store page goes. |
| An ID that gets added to the store's links, like `?tag=you-20` | On the store: `affiliate: { param: "tag", value: "you-20" }` |
| A ready-made link for one specific offer | On the promo: `affiliateUrl: "https://..."` |

A store with none of these still works. Its links go straight to the store and earn nothing.

Your clicks and earnings appear in your affiliate network's dashboard. The site doesn't record them itself.

## Black Friday

Add `blackFriday: true` to any promo in [data/stores.ts](data/stores.ts) to list it on the `/black-friday` page. The banner and countdown switch off by themselves after Cyber Monday. For next year, update the dates in [lib/campaign.ts](lib/campaign.ts).

## Sell ads

The Advertise page lists what businesses can buy. To start taking payments:

1. Create one payment link for each ad, at the price you want. [Payfast](https://payfast.io) and [Yoco](https://www.yoco.com) can charge in rand. PayPal also works, but it doesn't support rand, and withdrawing to a South African bank goes through FNB.
2. Make a free [Google Form](https://forms.google.com) asking for **Store name**, **Link to promote**, **Offer details**, **Start date** and **Email you paid from**.
3. In [data/advertising.ts](data/advertising.ts), set your prices, paste each payment link into `paymentLink`, and paste the form's link into `adDetailsFormUrl`. The buttons read "Coming soon" until both are added.

When someone pays, match their form to the payment and check that the ad is legitimate. Then add it to the `ads` list in the same file. It starts and stops by itself on the dates you set. If you can't accept an ad, refund the payment, as the Advertise page promises.

You can also add your own pop-up with no payment involved, for example to promote a store whose affiliate program you've joined. Add it to the `ads` list with your affiliate link as the `url`.

## Go live

The site is set up for [Netlify's](https://www.netlify.com) free plan, which you can use for a site that earns money. Vercel's free plan doesn't allow that.

1. Go to <https://app.netlify.com/start> and sign up with GitHub.
2. Import the `DealGuru` repository and deploy it. No settings need changing.

Netlify then rebuilds the site every time you push to `main`, so to change promos, edit [data/stores.ts](data/stores.ts) and push. Each rebuild uses some of the free plan's monthly credits, so group your edits together. If you go past the free limits, Netlify pauses the site instead of charging you.
