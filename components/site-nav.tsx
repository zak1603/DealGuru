import { cacheLife } from "next/cache";
import Link from "next/link";
import { AccountButton } from "@/components/account-button";
import { isBlackFridayOver } from "@/lib/campaign";

export async function SiteNav() {
  "use cache";
  cacheLife("hours");

  return (
    <nav aria-label="Main" className="bg-ink text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2.5">
        <Link href="/" className="display text-2xl text-marigold">
          Deal Guru
        </Link>
        <div className="flex items-center gap-4 text-sm sm:gap-5 font-semibold">
          {!isBlackFridayOver() && (
            <Link href="/black-friday" className="hover:text-marigold">
              Black Friday
            </Link>
          )}
          <Link href="/stores" className="hover:text-marigold">
            Stores
          </Link>
          <Link href="/advertise" className="hidden hover:text-marigold sm:inline">
            Advertise
          </Link>
          <AccountButton />
        </div>
      </div>
    </nav>
  );
}
