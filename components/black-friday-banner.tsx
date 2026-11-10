import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { blackFriday } from "@/lib/campaign";

export function BlackFridayBanner() {
  return (
    <section
      aria-label="Black Friday"
      className="flex flex-col gap-4 rounded-2xl bg-ink p-5 text-white sm:gap-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <h2 className="display shimmer text-5xl text-marigold sm:text-7xl">Black Friday</h2>
        <p className="mt-2 text-white/80">{blackFriday.dates}. Mzansi&apos;s biggest sales, all in one place.</p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
        <Countdown />
        <Link
          href="/black-friday"
          className="group flex min-h-11 animate-glow items-center justify-center gap-1 rounded-lg bg-marigold px-5 py-2.5 font-bold text-ink transition-transform hover:-translate-y-0.5 motion-reduce:animate-none"
        >
          Sharp sharp, show me
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
