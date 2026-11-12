import type { ReactNode } from "react";

export const inputClasses = "w-full rounded-lg border-2 border-ink/25 bg-white px-3 py-2 text-base focus:border-ink";
export const primaryButton =
  "flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-springbok px-4 py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-60 motion-reduce:transform-none";
export const quietButton =
  "flex min-h-10 cursor-pointer items-center gap-1 rounded-lg bg-paper px-3 text-sm font-bold transition hover:bg-marigold/40 active:scale-95 motion-reduce:transform-none";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      {hint && <span className="ml-1 text-xs text-ink/60">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

/** A short status line under a form: green when something worked, red when it didn't. */
export function FormMessage({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <p role={ok ? "status" : "alert"} className={`text-sm font-semibold ${ok ? "text-springbok" : "text-tomato"}`}>
      {children}
    </p>
  );
}
