// What the newsletter does, given a database and a way to call Brevo's API.
// index.ts wires in the real ones; tests pass fakes.

import { type Deal, SITE, welcomeEmail, weeklyEmail } from "./email.ts";

export const LIST_NAME = "Deal Guru newsletter";
const FOLDER_NAME = "Deal Guru";
/** How many welcome emails one run sends, to stay well inside the function's time limit. */
const WELCOME_BATCH = 40;

export type Person = { id: string; email: string; first_name: string | null; consent_at: Date | null };

export type Database = {
  /** Deals that haven't ended in South Africa yet, newest first. */
  liveDeals(limit: number): Promise<Deal[]>;
  /** Confirmed accounts that ticked the newsletter box. */
  subscribers(): Promise<Person[]>;
  /** Confirmed subscribers who haven't had their welcome email yet. */
  pendingWelcomes(limit: number): Promise<Person[]>;
  markWelcomed(accountId: string): Promise<void>;
  /** Records that someone stopped the newsletter, and returns their email if the account exists. */
  markUnsubscribed(accountId: string): Promise<string | null>;
  logSend(send: { kind: "welcome" | "weekly"; recipients: number; deals: number; campaignId?: number }): Promise<void>;
  /** Whether a weekly email went out in the last so-many hours. */
  weeklySentWithin(hours: number): Promise<boolean>;
  /** The secret shared with the cron jobs, which also signs unsubscribe links. */
  secret(): Promise<string>;
};

export class BrevoError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type Brevo = <T = Record<string, unknown>>(path: string, init?: { method?: string; body?: unknown }) => Promise<T>;

type BrevoContact = { email?: string; emailBlacklisted: boolean; modifiedAt: string; listUnsubscribed?: number[] };

/** Brevo problems that affect every send (a bad key, no credits left), so there's no point trying the next person. */
const stopsEveryone = (error: unknown) => error instanceof BrevoError && [401, 402, 403, 429].includes(error.status);

export async function signAccount(accountId: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`unsubscribe:${accountId}`)));
  return Array.from(mac.slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Compares secrets without leaking how much of them matched through timing. */
export function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

export function createNewsletter(db: Database, brevo: Brevo, options: { fromEmail?: string; now?: () => Date } = {}) {
  const now = options.now ?? (() => new Date());

  async function sender() {
    const preferred = options.fromEmail?.toLowerCase();
    const { senders = [] } = await brevo<{ senders?: { email: string; active: boolean }[] }>("/senders");
    const active = senders.filter((s) => s.active);
    const chosen = active.find((s) => s.email.toLowerCase() === preferred) ?? active[0];
    if (!chosen) throw new Error("Brevo has no active sender. Add one under Senders, Domains & Dedicated IPs.");
    return { name: "Deal Guru", email: chosen.email };
  }

  /** The Brevo list the newsletter goes to, made the first time it's needed. */
  async function listId(): Promise<number> {
    const { lists = [] } = await brevo<{ lists?: { id: number; name: string }[] }>("/contacts/lists?limit=50&offset=0");
    const found = lists.find((list) => list.name === LIST_NAME);
    if (found) return found.id;
    const { folders = [] } = await brevo<{ folders?: { id: number; name: string }[] }>("/contacts/folders?limit=50&offset=0");
    const folderId =
      folders.find((folder) => folder.name === FOLDER_NAME)?.id ??
      (await brevo<{ id: number }>("/contacts/folders", { method: "POST", body: { name: FOLDER_NAME } })).id;
    return (await brevo<{ id: number }>("/contacts/lists", { method: "POST", body: { name: LIST_NAME, folderId } })).id;
  }

  async function listContacts(list: number) {
    const contacts: BrevoContact[] = [];
    for (let offset = 0; ; offset += 500) {
      const page = await brevo<{ contacts?: BrevoContact[] }>(`/contacts/lists/${list}/contacts?limit=500&offset=${offset}`);
      contacts.push(...(page.contacts ?? []));
      if (!page.contacts || page.contacts.length < 500) return contacts;
    }
  }

  const addToList = (list: number, email: string) =>
    brevo("/contacts", { method: "POST", body: { email, listIds: [list], updateEnabled: true } });

  async function removeContact(email: string) {
    try {
      await brevo(`/contacts/${encodeURIComponent(email)}`, { method: "DELETE" });
    } catch (error) {
      if (!(error instanceof BrevoError && error.status === 404)) throw error;
    }
  }

  /**
   * Makes the Brevo list match the database, which is the record of who agreed.
   * Returns how many people are subscribed afterwards.
   */
  async function sync(list: number) {
    const contacts = await listContacts(list);
    const people = new Map((await db.subscribers()).map((person) => [person.email.toLowerCase(), person]));

    // Unsubscribed with the link in a Brevo email: record it, unless they ticked the box again since.
    for (const contact of contacts) {
      const email = contact.email?.toLowerCase();
      const person = email ? people.get(email) : undefined;
      if (!email || !person) continue;
      if (!contact.emailBlacklisted && !(contact.listUnsubscribed ?? []).includes(list)) continue;
      if (person.consent_at && person.consent_at > new Date(contact.modifiedAt)) {
        await brevo(`/contacts/${encodeURIComponent(email)}`, { method: "PUT", body: { emailBlacklisted: false, listIds: [list] } });
      } else {
        await db.markUnsubscribed(person.id);
        people.delete(email);
      }
    }

    const onList = new Set(contacts.map((contact) => contact.email?.toLowerCase()));
    for (const [email] of people) if (!onList.has(email)) await addToList(list, email);

    // Unsubscribed, or deleted their account: take them off Brevo entirely.
    for (const contact of contacts) {
      const email = contact.email?.toLowerCase();
      if (email && !people.has(email)) await removeContact(email);
    }
    return people.size;
  }

  async function welcome() {
    const pending = await db.pendingWelcomes(WELCOME_BATCH);
    if (pending.length === 0) return { welcomed: 0, failed: 0 };

    const [list, from, deals, secret] = await Promise.all([listId(), sender(), db.liveDeals(8), db.secret()]);
    let welcomed = 0;
    let failed = 0;
    try {
      for (const person of pending) {
        try {
          await addToList(list, person.email);
          const unsubscribeUrl = `${SITE}/unsubscribe?u=${person.id}&s=${await signAccount(person.id, secret)}`;
          const email = welcomeEmail({ firstName: person.first_name, deals, unsubscribeUrl });
          await brevo("/smtp/email", {
            method: "POST",
            body: { sender: from, to: [{ email: person.email }], subject: email.subject, htmlContent: email.html, tags: ["welcome"] },
          });
          await db.markWelcomed(person.id);
          welcomed++;
        } catch (error) {
          if (stopsEveryone(error)) throw error;
          // One bad address mustn't hold up everyone behind it. The database stops offering them after two days.
          console.error(`Welcome email for account ${person.id} failed:`, error);
          failed++;
        }
      }
    } finally {
      if (welcomed > 0) await db.logSend({ kind: "welcome", recipients: welcomed, deals: deals.length });
    }
    return { welcomed, failed };
  }

  async function weekly() {
    // A guard against the same email going out twice, for example if the job is ever run by hand as well.
    if (await db.weeklySentWithin(20)) return { skipped: "This week's email has already gone out." };
    const deals = await db.liveDeals(12);
    if (deals.length === 0) return { skipped: "No live deals to send." };
    const list = await listId();
    const count = await sync(list);
    if (count === 0) return { skipped: "No subscribers yet." };

    const dateLabel = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Johannesburg" }).format(now());
    const email = weeklyEmail({ deals, dateLabel });
    const { id } = await brevo<{ id: number }>("/emailCampaigns", {
      method: "POST",
      body: {
        name: `Deal Guru weekly, ${dateLabel}`,
        subject: email.subject,
        previewText: email.preheader,
        sender: await sender(),
        htmlContent: email.html,
        recipients: { listIds: [list] },
      },
    });
    await brevo(`/emailCampaigns/${id}/sendNow`, { method: "POST" });
    await db.logSend({ kind: "weekly", recipients: count, deals: deals.length, campaignId: id });
    return { sent: count, campaign: id };
  }

  /** From the /unsubscribe page. Returns false for a link that wasn't signed by us. */
  async function unsubscribe(accountId: unknown, signature: unknown, brevoConnected: boolean) {
    if (typeof accountId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(accountId)) return false;
    if (typeof signature !== "string" || !/^[0-9a-f]{32}$/.test(signature)) return false;
    if (!sameText(await signAccount(accountId, await db.secret()), signature)) return false;
    const email = await db.markUnsubscribed(accountId);
    // The daily sync would catch it too, but there's no reason to wait.
    if (email && brevoConnected) await removeContact(email).catch((error) => console.error(error));
    return true;
  }

  return { welcome, weekly, unsubscribe, sync: async () => ({ subscribers: await sync(await listId()) }) };
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

/**
 * The function's HTTP side. Anyone can reach it, so it checks every request itself:
 * "unsubscribe" needs a link we signed, and everything else needs the cron jobs' secret.
 */
export function createHandler(deps: { db: Database; brevo: Brevo; brevoConnected: boolean; fromEmail?: string; allowedOrigins: Set<string> }) {
  const newsletter = createNewsletter(deps.db, deps.brevo, { fromEmail: deps.fromEmail });

  return async function handle(request: Request): Promise<Response> {
    const origin = request.headers.get("origin") ?? "";
    const cors: Record<string, string> = deps.allowedOrigins.has(origin)
      ? { "access-control-allow-origin": origin, "access-control-allow-headers": "content-type", "access-control-allow-methods": "POST, OPTIONS", vary: "origin" }
      : {};
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, cors);

    let body: { action?: unknown; u?: unknown; s?: unknown };
    try {
      body = await request.json();
      if (typeof body !== "object" || body === null) throw new Error("not an object");
    } catch {
      return json({ error: "Send JSON." }, 400, cors);
    }

    if (body.action === "unsubscribe") {
      try {
        return (await newsletter.unsubscribe(body.u, body.s, deps.brevoConnected))
          ? json({ ok: true }, 200, cors)
          : json({ error: "That link isn't valid." }, 400, cors);
      } catch (error) {
        console.error(error);
        return json({ error: "Something went wrong." }, 500, cors);
      }
    }

    // Everything else is only for the scheduled jobs.
    const given = request.headers.get("x-newsletter-secret");
    if (!given) return json({ error: "Not allowed." }, 401);
    let expected: string;
    try {
      expected = await deps.db.secret();
    } catch (error) {
      // Callers who haven't proved who they are don't get to see internal errors.
      console.error(error);
      return json({ error: "Something went wrong." }, 500);
    }
    if (!sameText(given, expected)) return json({ error: "Not allowed." }, 401);
    try {
      if (!deps.brevoConnected) return json({ skipped: "BREVO_API_KEY isn't set yet." });
      if (body.action === "welcome") return json(await newsletter.welcome());
      if (body.action === "sync") return json(await newsletter.sync());
      if (body.action === "weekly") return json(await newsletter.weekly());
      return json({ error: "Unknown action." }, 400);
    } catch (error) {
      console.error(error);
      return json({ error: error instanceof Error ? error.message : "Something went wrong." }, 500);
    }
  };
}
