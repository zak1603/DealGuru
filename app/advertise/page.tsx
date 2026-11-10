import type { Metadata } from "next";
import { PopupCard } from "@/components/ad-popup";
import { AnimatedWord } from "@/components/animated-word";
import { DealCard } from "@/components/deal-card";
import { adDetailsFormUrl, adPackages } from "@/data/advertising";

export const metadata: Metadata = {
  title: "Advertise | Deal Guru",
  description: "Put your store's offer in front of shoppers looking for a deal on Deal Guru.",
};

const example = {
  headline: "30% off",
  description: "Your offer goes here.",
  code: "YOURCODE",
};

const steps = [
  "Pick an ad and pay online.",
  "Fill in our short form with your store, the link to promote, your offer and your start date.",
  "We review every ad before it runs. If we can't accept yours, you get a full refund.",
  "Your ad goes live for the dates you bought, with a clear Sponsored label.",
];

export default function AdvertisePage() {
  return (
    <>
      <header className="beadwork bg-springbok text-white">
        <div className="mx-auto max-w-6xl px-5 pt-7 pb-8 sm:pt-9 sm:pb-10">
          <h1 className="display text-[clamp(3.5rem,10vw,6.5rem)] text-marigold">
            <AnimatedWord text="Advertise with us" />
          </h1>
          <p className="mt-3 max-w-xl text-lg font-medium sm:text-xl">
            Put your store in front of South Africans hunting for a lekker deal.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-5 pt-12 pb-16">
        <section aria-labelledby="packages-heading">
          <h2 id="packages-heading" className="display text-4xl">
            Pick your ad
          </h2>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {adPackages.map((adPackage) => (
              <article key={adPackage.id} className="flex flex-col rounded-2xl bg-white p-5">
                <h3 className="font-bold">{adPackage.name}</h3>
                <p className="display mt-3 text-5xl">{adPackage.price}</p>
                <p className="mt-3 flex-1 text-[15px] leading-snug text-ink/80">
                  {adPackage.description}
                </p>
                {/* Paying only makes sense once advertisers can also send their ad details. */}
                {adPackage.paymentLink && adDetailsFormUrl ? (
                  <a
                    href={adPackage.paymentLink}
                    target="_blank"
                    rel="noopener"
                    className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-springbok px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Buy this ad
                  </a>
                ) : (
                  <p className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-ink/10 px-4 py-2.5 text-sm font-bold text-ink/70">
                    Coming soon
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="examples-heading">
          <h2 id="examples-heading" className="display text-4xl">
            What shoppers see
          </h2>
          <div className="mt-4 grid items-start gap-5 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-bold">Featured card</h3>
              <DealCard
                storeName="Your store"
                note="Example"
                flag="sponsored"
                {...example}
              />
            </div>
            <div>
              <h3 className="mb-2 font-bold">Pop-up</h3>
              <PopupCard advertiser="Your store" {...example} />
            </div>
          </div>
        </section>

        <section aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="display text-4xl">
            How it works
          </h2>
          <ol className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step}>
                <span className="display text-4xl text-tomato">{index + 1}</span>
                <p className="mt-1 text-[15px] leading-snug">{step}</p>
              </li>
            ))}
          </ol>
          {adDetailsFormUrl && (
            <a
              href={adDetailsFormUrl}
              target="_blank"
              rel="noopener"
              className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-springbok px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Already paid? Send your ad details
            </a>
          )}
        </section>

        <p className="text-sm text-ink/70">
          We don&apos;t accept ads for illegal products, counterfeit goods, adult content, gambling,
          or anything misleading.
        </p>
      </main>
    </>
  );
}
