"use client";

import { useSyncExternalStore } from "react";
import { blackFriday } from "@/lib/campaign";

const subscribe = (tick: () => void) => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
};
const getSecond = () => Math.floor(Date.now() / 1000);
const getServerSecond = () => null;

const UNITS = [
  ["Days", 86_400, Infinity],
  ["Hours", 3_600, 24],
  ["Mins", 60, 60],
  ["Secs", 1, 60],
] as const;

export function Countdown() {
  // Null until the browser takes over, so server and browser HTML match.
  const now = useSyncExternalStore(subscribe, getSecond, getServerSecond);

  const startsAt = blackFriday.startsAt / 1000;
  const endsAt = blackFriday.endsAt / 1000;
  if (now !== null && now >= endsAt) return null;

  const isRunning = now !== null && now >= startsAt;
  const remaining = now === null ? null : (isRunning ? endsAt : startsAt) - now;
  const label = now === null ? " " : isRunning ? "On now, ends in" : "Starts in";
  const value = (size: number, wrap: number) =>
    remaining === null ? "--" : String(Math.floor(remaining / size) % wrap);

  return (
    <div
      role="timer"
      aria-label={remaining === null ? undefined : `${label} ${value(86_400, Infinity)} days`}
    >
      <p className="text-xs font-semibold text-white/70" aria-hidden>
        {label}
      </p>
      <div className="mt-1.5 flex gap-2" aria-hidden>
        {UNITS.map(([unit, size, wrap]) => {
          const display = value(size, wrap).padStart(2, "0");
          return (
            <div key={unit} className="w-14 overflow-hidden rounded-lg bg-white/10 py-2 text-center">
              {/* Keyed by its value so the number animates each time it changes. */}
              <div
                key={display}
                className="display animate-tick text-3xl text-marigold tabular-nums motion-reduce:animate-none"
              >
                {display}
              </div>
              <div className="mt-1 text-[11px] text-white/70">{unit}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
