import type { Metadata } from "next";
import { DeleteMyData } from "@/components/delete-account";

export const metadata: Metadata = {
  title: "Privacy | Deal Guru",
  description: "What Deal Guru saves about you, why, and how to delete it.",
};

const sections = [
  {
    heading: "What we save",
    body: [
      "If you choose a location, we save an approximate version of it, rounded to about 1 km, so we can show the stores nearest you. It's kept on your device.",
      "If you sign in with Google, we also receive your name and email address from Google, and we save your approximate location to your account so it follows you to other devices.",
    ],
  },
  {
    heading: "Why",
    body: [
      "Only to sign you in and sort deals by the stores nearest you. We don't sell your details, and we don't share them with stores or advertisers.",
    ],
  },
  {
    heading: "Where it's kept",
    body: [
      "Accounts and saved locations are stored with Supabase, on servers in Ireland. Google handles the sign-in itself.",
      "When you open a deal, you go to the store's own website, and its privacy policy applies there. Affiliate links can tell the store you came from Deal Guru.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 pt-10 pb-16">
      <h1 className="display text-6xl">Privacy</h1>
      <p className="mt-3 text-lg">Short and simple: here&apos;s what Deal Guru saves about you, and how to delete it.</p>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="display text-3xl">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-2 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section>
          <h2 className="display text-3xl">Delete your data</h2>
          <p className="mt-2 mb-4 leading-relaxed">
            You can delete everything we hold about you at any time, right here.
          </p>
          <DeleteMyData />
        </section>
      </div>
    </main>
  );
}
