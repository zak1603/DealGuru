import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import { stores as backupStores } from "../data/stores";
import { supabasePublishableKey, supabaseUrl } from "./supabase-config";
import type { Store } from "./types";

type DealRow = {
  id: string;
  headline: string;
  description: string;
  code: string | null;
  url: string;
  affiliate_url: string | null;
  expires: string | null;
  note: string | null;
  black_friday: boolean;
};

type StoreRow = {
  slug: string;
  name: string;
  affiliate_template: string | null;
  affiliate_param: string | null;
  affiliate_value: string | null;
  deals: DealRow[];
};

function toStore(row: StoreRow): Store {
  return {
    slug: row.slug,
    name: row.name,
    affiliate: row.affiliate_template
      ? { template: row.affiliate_template }
      : row.affiliate_param && row.affiliate_value
        ? { param: row.affiliate_param, value: row.affiliate_value }
        : undefined,
    promos: row.deals.map((deal) => ({
      id: deal.id,
      headline: deal.headline,
      description: deal.description,
      code: deal.code ?? undefined,
      url: deal.url,
      affiliateUrl: deal.affiliate_url ?? undefined,
      expires: deal.expires ?? undefined,
      note: deal.note ?? undefined,
      blackFriday: deal.black_friday,
    })),
  };
}

/**
 * Every store and deal, as managed on the admin page. Refreshed about once a
 * minute. If the database can't be reached, the copy in data/stores.ts is used
 * so the site never goes blank.
 */
export async function getCatalog(): Promise<{ stores: Store[]; fromBackup: boolean }> {
  "use cache";
  cacheLife("minutes");

  try {
    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("stores")
      .select(
        "slug, name, affiliate_template, affiliate_param, affiliate_value, deals (id, headline, description, code, url, affiliate_url, expires, note, black_friday)",
      )
      .returns<StoreRow[]>();
    if (error) throw error;
    if (!data || data.length === 0) return { stores: backupStores, fromBackup: true };
    return { stores: data.map(toStore), fromBackup: false };
  } catch (error) {
    console.error("Couldn't load deals from Supabase, so showing data/stores.ts instead.", error);
    return { stores: backupStores, fromBackup: true };
  }
}
