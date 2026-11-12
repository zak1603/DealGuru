import { ArrowUpRight, Clock, Globe, MapPin } from "lucide-react";
import Link from "next/link";
import { CopyCode } from "@/components/copy-code";
import { SaveButton, ShareButton } from "@/components/deal-actions";
import { siteUrl } from "@/lib/site";

const getDealClasses =
  "flex min-h-11 shrink-0 items-center gap-1 rounded-lg bg-springbok px-4 py-2.5 text-sm font-bold text-white";

/** A plain link, because Next's <Link> would prefetch and fake affiliate clicks. Without an href it's a preview. */
export function GetDealLink({ href, label }: { href?: string; label: string }) {
  const content = (
    <>
      Yebo, grab it
      <ArrowUpRight
        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
        aria-hidden
      />
    </>
  );

  if (!href) return <span className={getDealClasses}>{content}</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      aria-label={`${label} (opens in a new tab)`}
      className={`${getDealClasses} group transition-transform hover:-translate-y-0.5 active:scale-95 motion-reduce:transform-none`}
    >
      {content}
    </a>
  );
}

export type CardFlag = "sponsored" | "ending-soon" | "black-friday";

function Flag({ flag }: { flag: CardFlag }) {
  if (flag === "ending-soon") {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-tomato">
        <Clock className="size-3.5 animate-pulse motion-reduce:animate-none" aria-hidden />
        Ending now-now
      </span>
    );
  }

  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${
        flag === "sponsored" ? "bg-marigold text-ink" : "bg-ink text-marigold"
      }`}
    >
      {flag === "sponsored" ? "Sponsored" : "Black Friday"}
    </span>
  );
}

export function DealCard({
  id,
  storeName,
  storeSlug,
  headline,
  description,
  code,
  note,
  distance,
  href,
  flag,
  revealIndex,
}: {
  /** A promo id. Gives the card an anchor plus save and share buttons. Leave out for ads. */
  id?: string;
  storeName: string;
  /** Links the store name to its page. */
  storeSlug?: string;
  headline: string;
  description: string;
  code?: string;
  note: string;
  /** Nearest branch, e.g. "2.4 km · Woolworths, Sandton". */
  distance?: { label: string; online?: boolean };
  href?: string;
  flag?: CardFlag;
  /** Position in the grid, so cards rise in one after another. Leave out for no entrance. */
  revealIndex?: number;
}) {
  const reveals = revealIndex !== undefined;

  return (
    <article
      id={id}
      style={reveals ? { animationDelay: `${Math.min(revealIndex, 11) * 45}ms` } : undefined}
      className={`flex scroll-mt-40 flex-col rounded-2xl bg-white shadow-[0_1px_2px_rgb(22_19_14/0.08),0_12px_24px_-16px_rgb(22_19_14/0.35)] transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgb(22_19_14/0.1),0_20px_32px_-16px_rgb(22_19_14/0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        reveals ? "animate-rise motion-reduce:animate-none" : ""
      } ${flag === "sponsored" ? "ring-2 ring-marigold" : ""}`}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="-my-2 flex min-h-9 items-center gap-2">
          {storeSlug ? (
            <Link
              href={`/stores/${storeSlug}`}
              className="truncate text-sm font-semibold underline-offset-2 hover:underline"
            >
              {storeName}
            </Link>
          ) : (
            <p className="truncate text-sm font-semibold">{storeName}</p>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            {flag && <Flag flag={flag} />}
            {id && (
              <>
                <SaveButton id={id} label={`${headline} at ${storeName}`} />
                <ShareButton
                  url={`${siteUrl}/stores/${storeSlug ?? ""}#${id}`}
                  text={`${headline} at ${storeName}`}
                />
              </>
            )}
          </div>
        </div>
        <h2 className="display mt-5 text-5xl">{headline}</h2>
        <p className="mt-3 flex-1 text-[15px] leading-snug text-ink/80">{description}</p>
        <p className="mt-3 text-xs font-medium text-ink/60">{note}</p>
        {distance && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-springbok">
            {distance.online ? (
              <Globe className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <MapPin className="size-3.5 shrink-0" aria-hidden />
            )}
            <span className="truncate">{distance.label}</span>
          </p>
        )}
      </div>

      <div className="perforation flex items-stretch gap-2 p-4">
        {code ? (
          <CopyCode code={code} />
        ) : (
          <p className="flex flex-1 items-center px-1 text-sm font-medium text-ink/60">
            No code, no stress
          </p>
        )}
        <GetDealLink href={href} label={`Get deal: ${headline} at ${storeName}`} />
      </div>
    </article>
  );
}
