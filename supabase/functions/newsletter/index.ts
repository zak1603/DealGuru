// Deal Guru's newsletter, run by Supabase on a schedule (see the migration's cron jobs).
//
//   welcome      emails today's deals to new subscribers once they've confirmed their email
//   sync         keeps the Brevo list in step with who has ticked "Email me the latest deals",
//                and records anyone who unsubscribed with Brevo's link
//   weekly       syncs, then sends this week's deals to the list as a Brevo campaign
//   unsubscribe  called by the /unsubscribe page, with a signed link from a welcome email
//
// Deploy with JWT verification off: the function checks every request itself (see newsletter.ts).
// Needs the BREVO_API_KEY secret. NEWSLETTER_FROM_EMAIL can pick which verified Brevo
// sender to use; otherwise it's the first active one.

import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import { type Deal, SITE } from "./email.ts";
import { type Brevo, BrevoError, createHandler, type Database, type Person } from "./newsletter.ts";

const brevoKey = Deno.env.get("BREVO_API_KEY") ?? "";
// prepare: false keeps this working if the connection goes through Supabase's pooler.
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 1, prepare: false });
let secret: string | undefined;

const db: Database = {
  async liveDeals(limit) {
    const rows = await sql`
      select d.id, s.name as store_name, d.headline, d.description, d.code, d.expires::text as expires, d.note
      from public.deals d
      join public.stores s on s.slug = d.store_slug
      where d.expires is null or d.expires >= (now() at time zone 'Africa/Johannesburg')::date
      order by d.created_at desc, d.expires asc nulls last, d.id
      limit ${limit}::int`;
    return rows as unknown as Deal[];
  },
  async subscribers() {
    const rows = await sql`
      select p.id, u.email::text as email, p.first_name, p.newsletter_consent_at as consent_at
      from public.profiles p
      join auth.users u on u.id = p.id
      where p.newsletter and u.email_confirmed_at is not null and u.email is not null`;
    return rows as unknown as Person[];
  },
  async pendingWelcomes(limit) {
    const rows = await sql`select id, email, first_name, consent_at from private.pending_welcomes(${limit}::int)`;
    return rows as unknown as Person[];
  },
  async markWelcomed(accountId) {
    await sql`update public.profiles set welcome_sent_at = now() where id = ${accountId}`;
  },
  async markUnsubscribed(accountId) {
    const [row] = await sql`
      update public.profiles p set newsletter = false
      from auth.users u
      where p.id = ${accountId} and u.id = p.id
      returning u.email::text as email`;
    return (row?.email as string | undefined) ?? null;
  },
  async logSend({ kind, recipients, deals, campaignId }) {
    await sql`insert into public.newsletter_sends (kind, recipients, deals, campaign_id) values (${kind}, ${recipients}, ${deals}, ${campaignId ?? null})`;
  },
  async weeklySentWithin(hours) {
    const [row] = await sql`
      select exists (
        select 1 from public.newsletter_sends where kind = 'weekly' and sent_at > now() - make_interval(hours => ${hours}::int)
      ) as sent`;
    return row.sent === true;
  },
  async secret() {
    if (secret) return secret;
    const [row] = await sql`select decrypted_secret from vault.decrypted_secrets where name = 'newsletter_secret'`;
    if (!row) throw new Error("newsletter_secret is missing from Vault");
    secret = row.decrypted_secret as string;
    return secret;
  },
};

const brevo: Brevo = async <T,>(path: string, init: { method?: string; body?: unknown } = {}) => {
  const method = init.method ?? "GET";
  const response = await fetch(`https://api.brevo.com/v3${path}`, {
    method,
    headers: {
      "api-key": brevoKey,
      accept: "application/json",
      ...(init.body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const detail = (data as { message?: string } | null)?.message ?? text;
    throw new BrevoError(`Brevo ${method} ${path} failed (${response.status}): ${detail}`, response.status);
  }
  return data as T;
};

Deno.serve(
  createHandler({
    db,
    brevo,
    brevoConnected: brevoKey !== "",
    fromEmail: Deno.env.get("NEWSLETTER_FROM_EMAIL"),
    allowedOrigins: new Set([SITE, "http://localhost:3000"]),
  }),
);
