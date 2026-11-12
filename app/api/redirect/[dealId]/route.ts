import { NextResponse, type NextRequest } from "next/server";
import { outboundUrl } from "@/lib/affiliate";
import { findPromo, isExpired } from "@/lib/promos";

/** Sends a shopper to the store through the affiliate link for this promo. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/redirect/[dealId]">) {
  const { dealId } = await ctx.params;
  const match = await findPromo(dealId);

  // A stale page can still link to a promo that has since ended, so send those home.
  const destination =
    match && !isExpired(match.promo)
      ? outboundUrl(match.promo, match.store)
      : new URL("/", request.url);

  return NextResponse.redirect(destination, {
    status: 307,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
