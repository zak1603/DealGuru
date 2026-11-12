"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Field, inputClasses, primaryButton, quietButton } from "@/components/form-parts";
import { SignupsSection } from "@/components/signups-section";
import { endOfDay, formatDay } from "@/lib/data-helpers";
import { getSupabase, signInWithGoogle, signInWithPassword, signOut, useShopper } from "@/lib/shopper";
import { googleSignInReady } from "@/lib/supabase-config";

type StoreRow = { slug: string; name: string };
type DealRow = {
  id: string;
  store_slug: string;
  headline: string;
  description: string;
  code: string | null;
  url: string;
  affiliate_url: string | null;
  expires: string | null;
  note: string | null;
  black_friday: boolean;
};

const NEW_STORE = "__new__";
const EMPTY_FORM = {
  storeSlug: "",
  newStoreName: "",
  headline: "",
  description: "",
  code: "",
  url: "",
  affiliateUrl: "",
  expires: "",
  note: "",
  blackFriday: false,
};
type Form = typeof EMPTY_FORM;
type Message = { ok: boolean; text: string } | null;
type ListedDeal = DealRow & { ended: boolean };

/** Loads every store and deal, marking which deals have ended. Null if it fails. */
async function fetchCatalog(): Promise<{ stores: StoreRow[]; deals: ListedDeal[] } | null> {
  const supabase = getSupabase();
  const [storeResult, dealResult] = await Promise.all([
    supabase.from("stores").select("slug, name").order("name"),
    supabase.from("deals").select("*").order("expires", { ascending: true, nullsFirst: false }),
  ]);
  if (storeResult.error || dealResult.error) return null;
  const now = Date.now();
  return {
    stores: storeResult.data,
    deals: (dealResult.data as DealRow[]).map((deal) => ({
      ...deal,
      ended: deal.expires !== null && endOfDay(deal.expires) < now,
    })),
  };
}

const LOAD_FAILED: Message = { ok: false, text: "Couldn't load the deals. Check your connection and refresh." };

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInWithPassword(email.trim(), password);
    } catch {
      setError("Eish, that email and password didn't work.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4 rounded-2xl bg-white p-5">
      <Field label="Email">
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
      </Field>
      <Field label="Password">
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm font-semibold text-tomato">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={`${primaryButton} w-full`}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      {googleSignInReady && (
        <button type="button" onClick={() => void signInWithGoogle()} className={`${quietButton} w-full justify-center`}>
          Sign in with Google instead
        </button>
      )}
    </form>
  );
}

function DealManager() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [deals, setDeals] = useState<ListedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let active = true;
    void fetchCatalog().then((result) => {
      if (!active) return;
      if (result) {
        setStores(result.stores);
        setDeals(result.deals);
      } else {
        setMessage(LOAD_FAILED);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function reload() {
    const result = await fetchCatalog();
    if (!result) return setMessage(LOAD_FAILED);
    setStores(result.stores);
    setDeals(result.deals);
  }

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));
  const storeName = (slug: string) => stores.find((store) => store.slug === slug)?.name ?? slug;

  function startEdit(deal: DealRow) {
    setEditingId(deal.id);
    setMessage(null);
    setForm({
      storeSlug: deal.store_slug,
      newStoreName: "",
      headline: deal.headline,
      description: deal.description,
      code: deal.code ?? "",
      url: deal.url,
      affiliateUrl: deal.affiliate_url ?? "",
      expires: deal.expires ?? "",
      note: deal.note ?? "",
      blackFriday: deal.black_friday,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const supabase = getSupabase();

    try {
      let storeSlug = form.storeSlug;
      if (storeSlug === NEW_STORE) {
        const name = form.newStoreName.trim();
        storeSlug = slugify(name);
        if (storeSlug.length < 2) throw new Error("Give the new store a name.");
        const { error } = await supabase.from("stores").insert({ slug: storeSlug, name });
        // 23505 means the store already exists, which is fine: the deal goes under it.
        if (error && error.code !== "23505") throw error;
      }

      const row = {
        store_slug: storeSlug,
        headline: form.headline.trim(),
        description: form.description.trim(),
        code: form.code.trim() || null,
        url: form.url.trim(),
        affiliate_url: form.affiliateUrl.trim() || null,
        expires: form.expires || null,
        note: form.note.trim() || null,
        black_friday: form.blackFriday,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = editingId
        ? await supabase.from("deals").update(row).eq("id", editingId).select("id")
        : await supabase.from("deals").insert(row).select("id");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Nothing was saved. Are you still signed in as the admin?");

      setMessage({ ok: true, text: "Saved. Shoppers will see it within about a minute." });
      resetForm();
      await reload();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Something went wrong.";
      setMessage({ ok: false, text: `Couldn't save: ${text}` });
    } finally {
      setSaving(false);
    }
  }

  async function remove(deal: DealRow) {
    if (!window.confirm(`Delete "${deal.headline}" at ${storeName(deal.store_slug)}? This can't be undone.`)) return;
    const { data, error } = await getSupabase().from("deals").delete().eq("id", deal.id).select("id");
    if (error || !data || data.length === 0) {
      setMessage({ ok: false, text: "Couldn't delete that deal. Are you still signed in as the admin?" });
      return;
    }
    if (editingId === deal.id) resetForm();
    setMessage({ ok: true, text: "Deleted. It disappears from the site within about a minute." });
    await reload();
  }

  return (
    <div className="space-y-10">
      <form ref={formRef} onSubmit={save} className="scroll-mt-6 space-y-4 rounded-2xl bg-white p-5">
        <h2 className="display text-3xl">{editingId ? "Edit deal" : "Add a deal"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store">
            <select required value={form.storeSlug} onChange={(e) => set("storeSlug", e.target.value)} className={inputClasses}>
              <option value="" disabled>
                Choose a store
              </option>
              {stores.map((store) => (
                <option key={store.slug} value={store.slug}>
                  {store.name}
                </option>
              ))}
              <option value={NEW_STORE}>+ New store</option>
            </select>
          </Field>
          {form.storeSlug === NEW_STORE && (
            <Field label="New store name" hint="shows as an online store until its branches are added">
              <input required maxLength={60} value={form.newStoreName} onChange={(e) => set("newStoreName", e.target.value)} className={inputClasses} />
            </Field>
          )}
          <Field label="Headline" hint="the big text, e.g. 30% off">
            <input required maxLength={40} value={form.headline} onChange={(e) => set("headline", e.target.value)} className={inputClasses} />
          </Field>
          <Field label="Promo code" hint="leave empty if none">
            <input maxLength={40} value={form.code} onChange={(e) => set("code", e.target.value)} className={inputClasses} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                required
                maxLength={200}
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={inputClasses}
              />
            </Field>
          </div>
          <Field label="Link to the deal" hint="on the store's website">
            <input required type="url" pattern="https?://.+" value={form.url} onChange={(e) => set("url", e.target.value)} className={inputClasses} />
          </Field>
          <Field label="Affiliate link" hint="optional, from your affiliate network">
            <input type="url" pattern="https?://.+" value={form.affiliateUrl} onChange={(e) => set("affiliateUrl", e.target.value)} className={inputClasses} />
          </Field>
          <Field label="Last day" hint="leave empty if it has no end date">
            <input type="date" value={form.expires} onChange={(e) => set("expires", e.target.value)} className={inputClasses} />
          </Field>
          <Field label="Note" hint="optional, replaces the end date, e.g. While stocks last">
            <input maxLength={60} value={form.note} onChange={(e) => set("note", e.target.value)} className={inputClasses} />
          </Field>
        </div>
        <label className="flex items-center gap-2 font-semibold">
          <input type="checkbox" checked={form.blackFriday} onChange={(e) => set("blackFriday", e.target.checked)} className="size-5 accent-springbok" />
          Also show on the Black Friday page
        </label>

        {message && (
          <p role="status" className={`font-semibold ${message.ok ? "text-springbok" : "text-tomato"}`}>
            {message.text}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={saving} className={primaryButton}>
            <Plus className="size-4" aria-hidden />
            {saving ? "Saving…" : editingId ? "Save changes" : "Add deal"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className={quietButton}>
              Cancel editing
            </button>
          )}
        </div>
      </form>

      <section aria-labelledby="all-deals">
        <h2 id="all-deals" className="display text-3xl">
          All deals ({deals.length})
        </h2>
        {loading ? (
          <p className="mt-3">Loading…</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {deals.map((deal) => {
              const { ended } = deal;
              return (
                <li key={deal.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-bold">{storeName(deal.store_slug)}</span>
                      {" · "}
                      {deal.headline}
                    </p>
                    <p className="truncate text-xs text-ink/60">{deal.description}</p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${ended ? "bg-ink/10 text-ink/60" : "bg-springbok/15 text-springbok"}`}
                  >
                    {ended ? "Ended" : deal.expires ? `Live until ${formatDay(deal.expires)}` : "Live"}
                  </span>
                  <button type="button" onClick={() => startEdit(deal)} className={quietButton} aria-label={`Edit ${deal.headline} at ${storeName(deal.store_slug)}`}>
                    <Pencil className="size-4" aria-hidden />
                    Edit
                  </button>
                  <button type="button" onClick={() => void remove(deal)} className={quietButton} aria-label={`Delete ${deal.headline} at ${storeName(deal.store_slug)}`}>
                    <Trash2 className="size-4" aria-hidden />
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <SignupsSection />
    </div>
  );
}

export function AdminPanel() {
  const { user, authReady: ready } = useShopper();
  const [check, setCheck] = useState<{ userId: string; admin: boolean } | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void getSupabase()
      .rpc("is_admin")
      .then(({ data }) => {
        if (active) setCheck({ userId: user.id, admin: data === true });
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (!ready) return <p>Loading…</p>;
  if (!user) return <SignInForm />;
  if (check?.userId !== user.id) return <p>Checking your account…</p>;

  if (!check.admin) {
    return (
      <div className="space-y-3 rounded-2xl bg-white p-5">
        <p className="font-bold">This account isn&apos;t an admin.</p>
        <button type="button" onClick={() => void signOut()} className={quietButton}>
          Sign out
        </button>
      </div>
    );
  }

  return <DealManager />;
}
