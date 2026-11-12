"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FormMessage, primaryButton, quietButton } from "@/components/form-parts";
import { getNewsletter, setNewsletter, useShopper } from "@/lib/shopper";

/** On the Privacy page: shows whether the signed-in shopper gets the weekly deals email, and lets them change it. */
export function NewsletterChoice() {
  const { user, authReady } = useShopper();
  const [loaded, setLoaded] = useState<{ userId: string; subscribed: boolean | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void getNewsletter(user.id).then((subscribed) => {
      if (active) setLoaded({ userId: user.id, subscribed });
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (!authReady) return null;

  if (!user) {
    return (
      <p className="leading-relaxed">
        <Link href="/login" className="font-bold underline">
          Log in
        </Link>{" "}
        to change whether you get it, or use the unsubscribe link at the bottom of any of our emails.
      </p>
    );
  }

  if (loaded?.userId !== user.id) return <p>Checking…</p>;
  if (loaded.subscribed === null) return <p>Couldn&apos;t check your choice right now. Please refresh to try again.</p>;

  const subscribed = loaded.subscribed;

  async function change() {
    if (!user) return;
    setBusy(true);
    setFailed(false);
    try {
      await setNewsletter(user.id, !subscribed);
      setLoaded({ userId: user.id, subscribed: !subscribed });
    } catch {
      setFailed(true);
    }
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <p className="font-semibold">
        {subscribed ? "You get the weekly deals email." : "You don't get the weekly deals email."}
      </p>
      <button type="button" disabled={busy} onClick={() => void change()} className={subscribed ? quietButton : primaryButton}>
        {subscribed ? "Unsubscribe" : "Email me the latest deals every week"}
      </button>
      {failed && <FormMessage ok={false}>Eish, that didn&apos;t work. Please try again.</FormMessage>}
    </div>
  );
}
