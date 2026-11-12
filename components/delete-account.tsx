"use client";

import { useState } from "react";
import { deleteAccount, setLocation, useShopper } from "@/lib/shopper";

export function DeleteMyData() {
  const { user, location } = useShopper();
  const [status, setStatus] = useState<"idle" | "working" | "done" | "failed">("idle");

  if (status === "done") {
    return <p className="font-bold text-springbok">Done. Your account and saved location are deleted.</p>;
  }

  if (user) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={status === "working"}
          onClick={() => {
            if (!window.confirm("Delete your Deal Guru account and saved location? This can't be undone.")) return;
            setStatus("working");
            deleteAccount()
              .then(() => setStatus("done"))
              .catch(() => setStatus("failed"));
          }}
          className="min-h-11 cursor-pointer rounded-lg bg-tomato px-4 py-2.5 text-sm font-bold text-white disabled:opacity-70"
        >
          {status === "working" ? "Deleting…" : "Delete my account and data"}
        </button>
        {status === "failed" && (
          <p role="alert" className="text-sm font-semibold text-tomato">
            Eish, that didn&apos;t work. Please try again.
          </p>
        )}
      </div>
    );
  }

  if (location) {
    return (
      <button
        type="button"
        onClick={() => setLocation(null)}
        className="min-h-11 cursor-pointer rounded-lg bg-springbok px-4 py-2.5 text-sm font-bold text-white"
      >
        Clear the location saved on this device
      </button>
    );
  }

  return <p className="font-semibold">There&apos;s nothing saved about you on this device.</p>;
}
