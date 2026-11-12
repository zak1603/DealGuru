"use client";

import { LocateFixed, MapPin, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { cities } from "@/lib/geo";
import { saveLocation, useSavedLocation } from "@/lib/location";
import { loginEnabled } from "@/lib/supabase";

const pill =
  "flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition active:scale-95 motion-reduce:transform-none";

export function LocationBar() {
  const location = useSavedLocation();
  const auth = useAuth();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser can't share a location. Pick your city instead.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        saveLocation({ label: "My location", lat: coords.latitude, lng: coords.longitude });
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location. Allow it in your browser, or pick your city.");
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 600_000 },
    );
  }

  const citySelect = (
    <select
      aria-label="Pick your city"
      value=""
      onChange={(event) => {
        const city = cities.find((c) => c.name === event.target.value);
        if (city) saveLocation({ label: city.name, lat: city.lat, lng: city.lng });
      }}
      className={`${pill} border-2 border-ink/20 bg-white pr-2 hover:border-ink`}
    >
      <option value="" disabled>
        {location ? "Change city" : "Pick your city"}
      </option>
      {cities.map((city) => (
        <option key={city.name}>{city.name}</option>
      ))}
    </select>
  );

  if (!location) {
    return (
      <div className="mt-3 rounded-2xl border-2 border-dashed border-ink/25 p-4">
        <p className="flex items-center gap-1.5 font-bold">
          <MapPin className="size-5 text-springbok" aria-hidden />
          See deals closest to you first
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className={`${pill} bg-springbok text-white disabled:opacity-60`}
          >
            <LocateFixed className="size-4" aria-hidden />
            {locating ? "Finding you..." : "Use my location"}
          </button>
          <span className="text-sm text-ink/60">or</span>
          {citySelect}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-tomato">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <MapPin className="size-4 text-springbok" aria-hidden />
        Closest to {location.label === "My location" ? "you" : location.label} first
      </p>
      <button type="button" onClick={useMyLocation} disabled={locating} className={`${pill} bg-white hover:bg-marigold/40`}>
        <LocateFixed className="size-4" aria-hidden />
        {locating ? "Finding you..." : "Update"}
      </button>
      {citySelect}
      <button
        type="button"
        onClick={() => saveLocation(null)}
        aria-label="Forget my location"
        title="Forget my location"
        className={`${pill} px-2 text-ink/60 hover:bg-marigold/40 hover:text-ink`}
      >
        <X className="size-4" aria-hidden />
      </button>
      {loginEnabled && auth.status === "signed-out" && (
        <Link href="/account" className="text-sm font-semibold text-springbok underline underline-offset-2">
          Log in to keep it on every device
        </Link>
      )}
      {error && (
        <p role="alert" className="w-full text-sm font-medium text-tomato">
          {error}
        </p>
      )}
    </div>
  );
}
