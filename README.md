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

## Deals near you

Shoppers can tap **Use my location** or pick their city, and the deals re-sort so the nearest stores come first. Online-only stores like Takealot show as "Online store". The location is rounded to about 1 km and saved on the shopper's device, and in their account if they're signed in.

Store branch locations come from [OpenStreetMap](https://www.openstreetmap.org/copyright), which is free but community-mapped, so some branches are missing (HiFiCorp especially). To refresh them, run:

```bash
node scripts/update-branches.mjs
```

When you add a new store with physical shops, add its name to the list at the top of [scripts/update-branches.mjs](scripts/update-branches.mjs) and run it again.

## Sign in with Google (one-time setup)

Sign-in uses a free [Supabase](https://supabase.com) project called `dealguru`, which already has its table and access rules. Google sign-in needs switching on:

1. In the [Google Cloud console](https://console.cloud.google.com/auth/overview), set up the consent screen with the app name **Deal Guru** and your email, and publish it so anyone can sign in.
2. [Create an OAuth client](https://console.cloud.google.com/auth/clients/create) of type **Web application**:
   - Authorised JavaScript origins: `https://dealguru.netlify.app`
   - Authorised redirect URIs: `https://oulxrmolepbcshxjwjch.supabase.co/auth/v1/callback`
3. In Supabase, open the `dealguru` project, go to **Authentication**, then **Sign In / Providers**, then **Google**. Turn it on and paste the Client ID and Client Secret from step 2.
4. In Supabase, go to **Authentication**, then **URL Configuration**. Set the Site URL to `https://dealguru.netlify.app` and add `https://dealguru.netlify.app/**` to the redirect URLs.
5. In [lib/supabase-config.ts](lib/supabase-config.ts), change `googleSignInReady` to `true` and push. The "Sign in" button then appears.

On Supabase's free plan, a project that nobody uses for a week gets paused. Deals keep working, but sign-in stops until you press **Restore** on the project in Supabase.

Shoppers can delete their account and saved location from the Privacy page.

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
