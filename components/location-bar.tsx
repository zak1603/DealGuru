"use client";

import { LocateFixed, MapPin, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CITIES } from "@/lib/geo";
import { setLocation, useShopper } from "@/lib/shopper";

type Status = "idle" | "locating" | "denied" | "failed";

const buttonClasses =
  "flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 text-sm font-bold transition active:scale-95 motion-reduce:transform-none";

export function LocationBar() {
  const { location, user } = useShopper();
  const [status, setStatus] = useState<Status>("idle");
  const [editing, setEditing] = useState(false);

  function useMyLocation() {
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ label: "you", lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("idle");
        setEditing(false);
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "failed"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    );
  }

  function chooseCity(label: string) {
    const city = CITIES.find((option) => option.label === label);
    if (!city) return;
    setLocation(city);
    setStatus("idle");
    setEditing(false);
  }

  const showControls = !location || editing;

  return (
    <section
      aria-label="Your location"
      className="mb-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgb(22_19_14/0.08)]"
    >
      {location && !editing ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <MapPin className="size-5 shrink-0 text-springbok" aria-hidden />
          <p className="mr-auto font-bold">
            Showing the stores nearest {location.label}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`${buttonClasses} bg-paper hover:bg-marigold/40`}
          >
            Change
          </button>
          <button
            type="button"
            onClick={() => setLocation(null)}
            className={`${buttonClasses} bg-paper hover:bg-marigold/40`}
          >
            <X className="size-4" aria-hidden />
            Clear
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <MapPin className="size-5 shrink-0 text-springbok" aria-hidden />
          <p className="mr-auto font-bold">Sharp! Find the deals nearest you</p>
          {showControls && (
            <>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={status === "locating"}
                className={`${buttonClasses} bg-springbok text-white disabled:opacity-70`}
              >
                <LocateFixed className="size-4" aria-hidden />
                {status === "locating" ? "Finding you…" : "Use my location"}
              </button>
              <select
                aria-label="Or choose your city"
                defaultValue=""
                onChange={(event) => chooseCity(event.target.value)}
                className="min-h-10 cursor-pointer rounded-lg border-2 border-ink bg-white px-3 text-sm font-semibold"
              >
                <option value="" disabled>
                  Or choose a city
                </option>
                {CITIES.map((city) => (
                  <option key={city.label} value={city.label}>
                    {city.label}
                  </option>
                ))}
              </select>
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className={`${buttonClasses} bg-paper hover:bg-marigold/40`}
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      )}

      {(status === "denied" || status === "failed") && (
        <p role="alert" className="mt-2 text-sm font-semibold text-tomato">
          {status === "denied"
            ? "Eish, location is blocked in your browser. Choose your city instead."
            : "We couldn't find you just now. Choose your city instead."}
        </p>
      )}

      <p className="mt-2 text-xs text-ink/60">
        We keep an approximate location (about 1 km) on this device
        {user ? " and in your account" : ""} to sort the deals.{" "}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
      </p>
    </section>
  );
}
