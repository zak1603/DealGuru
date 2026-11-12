# Deal Guru

A website that lists promo codes and sales from different retail stores. Every "Get deal" button goes through your affiliate link.

## Run it

You need [Node.js](https://nodejs.org) installed.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Add, edit and remove deals

Go to <https://dealguru.netlify.app/admin> and sign in. You can add deals, including for new stores, and edit or delete existing ones. Changes show on the site within about a minute, with no code and no redeploy. Ended deals disappear by themselves.

**First time:** create your admin account in Supabase. Open the `dealguru` project, go to **Authentication**, then **Users**, then **Add user**, then **Create new user**. Enter the email address that's listed as admin and a password of your choice, and tick **Auto Confirm User**.

Only emails listed in the `admins` table in Supabase can make changes. To add another admin, add their email there in lowercase.

The deals live in the Supabase database. [data/stores.ts](data/stores.ts) is a backup copy the site falls back to if the database can't be reached, so it isn't updated by the admin page.

## Share on WhatsApp

Every deal has a **Share on WhatsApp** link that opens WhatsApp with the deal ready to send. The message links back to Deal Guru, which jumps to and outlines that deal, so friends discover the rest of the site too.

## Connect your affiliate accounts

Sign up with an affiliate network or a store's own programme, then use whichever option matches what they give you:

| What your network gives you | Where it goes |
| --- | --- |
| A ready-made link for one specific offer | The deal's **Affiliate link** field on the admin page |
| A link format you can put any store page into, like `https://network.com/click?id=123&url={url}` | The store's `affiliate_template` in the `stores` table in Supabase. `{url}` is where the store page goes. |
| An ID that gets added to the store's links, like `?tag=you-20` | The store's `affiliate_param` (`tag`) and `affiliate_value` (`you-20`) in the `stores` table |

A store with none of these still works. Its links go straight to the store and earn nothing.

Your clicks and earnings appear in your affiliate network's dashboard. The site doesn't record them itself.

## Black Friday

Tick **Also show on the Black Friday page** on the admin page to list a deal on the `/black-friday` page. The banner and countdown switch off by themselves after Cyber Monday. For next year, update the dates in [lib/campaign.ts](lib/campaign.ts).

## Deals near you

Shoppers can tap **Use my location** or pick their city, and the deals re-sort so the nearest stores come first. Online-only stores like Takealot show as "Online store". The location is rounded to about 1 km and saved on the shopper's device, and in their account if they're signed in.

Store branch locations come from [OpenStreetMap](https://www.openstreetmap.org/copyright), which is free but community-mapped, so some branches are missing (HiFiCorp especially). To refresh them, run:

```bash
node scripts/update-branches.mjs
```

When you add a new store with physical shops, add its name to the list at the top of [scripts/update-branches.mjs](scripts/update-branches.mjs) and run it again.

## Accounts and the weekly deals email

Nobody needs an account to browse deals. Shoppers can sign up at `/login` if they want to, and tick **Email me the latest deals every week**. Those who tick it get a welcome email with today's deals once they've confirmed their email address. After that they get the newest deals every Thursday at 08:00. Every email has an unsubscribe link, and signed-in shoppers can also change their choice on the Privacy page.

Every sign-up is listed in the **Sign-ups** section of the admin page, with when they joined and when they agreed to or stopped the newsletter. **Download as spreadsheet** saves the list as a CSV file.

Emails are sent by [Brevo](https://www.brevo.com). Its free plan sends 300 emails a day in total, including sign-up and password emails. The admin page warns you when the newsletter list gets close to that.

### One-time setup

Sign-ups stay switched off until these steps are done.

1. **Brevo:** sign up free with your Gmail address and complete your profile so Brevo lets you send. Under **Settings**, then **SMTP & API**, create an **API key** and copy your **SMTP login** and an **SMTP key**.
2. **Supabase, sign-up emails:** in the `dealguru` project, go to **Authentication**, then **Emails**, then **SMTP Settings**. Turn on custom SMTP and enter host `smtp-relay.brevo.com`, port `587`, your Brevo SMTP login as the username, the SMTP key as the password, your Gmail address as the sender email, and `Deal Guru` as the sender name.
3. **Supabase, links in emails:** go to **Authentication**, then **URL Configuration**. Set the Site URL to `https://dealguru.netlify.app` and add `https://dealguru.netlify.app/**` to the redirect URLs.
4. **Supabase, the newsletter's key:** go to **Edge Functions**, then **Secrets**, and add `BREVO_API_KEY` with the API key from step 1. Paste it there, not into a chat or the code.
5. **Database and newsletter program:** apply [supabase/migrations/20261112190000_signups_and_newsletter.sql](supabase/migrations/20261112190000_signups_and_newsletter.sql) and deploy the `newsletter` Edge Function from [supabase/functions/newsletter](supabase/functions/newsletter) with JWT verification turned off. The function checks every request itself.
6. In [lib/supabase-config.ts](lib/supabase-config.ts), change `emailSignUpReady` to `true` and push.

Without your own domain, Brevo sends from an address on `brevosend.com` in place of your Gmail, and emails are a little more likely to land in spam. Buying a domain and authenticating it in Brevo fixes that.

## Sign in with Google (one-time setup)

Sign-in uses a free [Supabase](https://supabase.com) project called `dealguru`, which already has its table and access rules. Google sign-in needs switching on:

1. In the [Google Cloud console](https://console.cloud.google.com/auth/overview), set up the consent screen with the app name **Deal Guru** and your email, and publish it so anyone can sign in.
2. [Create an OAuth client](https://console.cloud.google.com/auth/clients/create) of type **Web application**:
   - Authorised JavaScript origins: `https://dealguru.netlify.app`
   - Authorised redirect URIs: `https://oulxrmolepbcshxjwjch.supabase.co/auth/v1/callback`
3. In Supabase, open the `dealguru` project, go to **Authentication**, then **Sign In / Providers**, then **Google**. Turn it on and paste the Client ID and Client Secret from step 2.
4. In Supabase, go to **Authentication**, then **URL Configuration**. Set the Site URL to `https://dealguru.netlify.app` and add `https://dealguru.netlify.app/**` to the redirect URLs.
5. In [lib/supabase-config.ts](lib/supabase-config.ts), change `googleSignInReady` to `true` and push. The **Log in** and **Sign up** links then appear, with a **Continue with Google** button.

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

Netlify then rebuilds the site every time you push to `main`. Deals don't need a rebuild, because they're managed on the admin page. Each rebuild uses some of the free plan's monthly credits, so group your edits together. If you go past the free limits, Netlify pauses the site instead of charging you.
