import type { Metadata } from "next";
import { DeleteMyData } from "@/components/delete-account";
import { NewsletterChoice } from "@/components/newsletter-choice";
import { emailSignUpReady, googleSignInReady, signUpOpen } from "@/lib/supabase-config";

export const metadata: Metadata = {
  title: "Privacy | Deal Guru",
  description: "What Deal Guru saves about you, why, and how to delete it.",
};

// Only describes the ways of signing up that are switched on, so the notice always matches the site.
const accountDetails = [
  emailSignUpReady &&
    "If you make an account, we save your email address, your first name if you give it, and when you joined. Your password is stored scrambled, so nobody at Deal Guru can read it.",
  googleSignInReady && "If you sign in with Google, we receive your name and email address from Google.",
  signUpOpen &&
    "If you tick the box for the weekly deals email, we save that you agreed and when, and when you unsubscribe, as a record of your choice.",
  signUpOpen && "When you're signed in, your approximate location is also saved to your account, so it follows you to other devices.",
].filter((text): text is string => typeof text === "string");

const sections = [
  {
    heading: "What we save",
    body: [
      "If you choose a location, we save an approximate version of it, rounded to about 1 km, so we can show the stores nearest you. It's kept on your device.",
      ...accountDetails,
    ],
  },
  {
    heading: "Why",
    body: [
      signUpOpen
        ? "Only to run your account, sort deals by the stores nearest you, and send the weekly deals email if you asked for it. We don't sell your details, and we don't share them with stores or advertisers."
        : "Only to sort deals by the stores nearest you. We don't sell your details, and we don't share them with stores or advertisers.",
    ],
  },
  {
    heading: "Where it's kept",
    body: [
      "Accounts and saved locations are stored with Supabase, on servers in Ireland.",
      ...(signUpOpen
        ? ["Our emails, such as account confirmations, password resets and the weekly deals email, are sent by Brevo, in the European Union, so Brevo receives the email addresses they go to."]
        : []),
      ...(googleSignInReady ? ["Google handles signing in with Google."] : []),
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

        {signUpOpen && (
          <section>
            <h2 className="display text-3xl">The weekly deals email</h2>
            <p className="mt-2 mb-4 leading-relaxed">
              It only goes to people who ticked the box, and every email has an unsubscribe link.
            </p>
            <NewsletterChoice />
          </section>
        )}

        <section>
          <h2 className="display text-3xl">Delete your data</h2>
          <p className="mt-2 mb-4 leading-relaxed">
            You can delete everything we hold about you at any time, right here.
            {signUpOpen && " Deleting your account also takes you off our mailing list within a day."}
          </p>
          <DeleteMyData />
        </section>
      </div>
    </main>
  );
}
