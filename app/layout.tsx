import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SloganTicker } from "@/components/slogan-ticker";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Deal Guru | Lekker deals from South Africa's favourite stores",
  description: "Current sales and specials from South Africa's favourite stores, all in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-ZA" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteNav />
        <SloganTicker />
        {children}
        <footer className="border-t border-ink/15">
          <div className="mx-auto max-w-6xl space-y-2 px-5 py-6 text-sm text-ink/70">
            <p className="font-bold text-springbok">Built for Mzansi.</p>
            <p>
              Deal Guru may earn a commission when you buy through links on this site, at no extra
              cost to you. Items marked Sponsored are paid ads. Offers are set by each store and can
              change without notice, so check the price before you buy.
            </p>
            <p>
              <Link href="/advertise" className="font-semibold underline">
                Advertise with us
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
