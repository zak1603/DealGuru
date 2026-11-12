import { cacheLife } from "next/cache";
import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { isBlackFridayOver } from "@/lib/campaign";
import { signUpOpen } from "@/lib/supabase-config";

export async function SiteNav() {
  "use cache";
  cacheLife("hours");

  return (
    <nav aria-label="Main" className="bg-ink text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2.5">
        <Link href="/" className="display text-2xl whitespace-nowrap text-marigold">
          Deal Guru
        </Link>
        <div className="flex items-center gap-4 text-sm font-semibold whitespace-nowrap sm:gap-5">
          {!isBlackFridayOver() && (
            <Link href="/black-friday" className="hover:text-marigold">
              Black Friday
            </Link>
          )}
          {/* On phones, Log in and Sign up need the room. Advertise is in the footer too. */}
          <Link href="/advertise" className={signUpOpen ? "hidden hover:text-marigold sm:inline" : "hover:text-marigold"}>
            Advertise
          </Link>
          <AccountMenu />
        </div>
      </div>
    </nav>
  );
}
