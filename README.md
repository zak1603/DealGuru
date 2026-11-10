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

Everything is in [data/stores.ts](data/stores.ts). The entries there now are made-up samples, so replace them with real ones.

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

## Go live

1. Go to <https://vercel.com/new> and sign in with GitHub.
2. Import the `DealGuru` repository and click **Deploy**. No settings need changing.

Vercel then rebuilds the site every time you push to `main`, so to change promos, edit [data/stores.ts](data/stores.ts) and push.
