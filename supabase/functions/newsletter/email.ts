// The welcome and weekly emails. Plain functions with no Deno or Node APIs, so
// they can be previewed outside Supabase.

export const SITE = "https://dealguru.netlify.app";

export type Deal = {
  id: string;
  store_name: string;
  headline: string;
  description: string;
  code: string | null;
  expires: string | null;
  note: string | null;
};

const INK = "#16130e";
const PAPER = "#f3f1ea";
const MARIGOLD = "#ffb81c";
const SPRINGBOK = "#007749";
const FONT = "Arial, Helvetica, sans-serif";
const DISPLAY = "'Arial Black', 'Arial Narrow', Arial, sans-serif";

const dayLabel = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});

export const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

/** The same "Ends 30 Nov 2026" or note the deal shows on the site. */
export function endsLabel(deal: Deal) {
  if (deal.note) return deal.note;
  if (deal.expires) return `Ends ${dayLabel.format(Date.parse(`${deal.expires}T23:59:59.999+02:00`))}`;
  return "";
}

function dealBlock(deal: Deal) {
  const ends = endsLabel(deal);
  const link = `${SITE}/api/redirect/${encodeURIComponent(deal.id)}`;
  return `
<tr><td style="padding:0 0 14px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;border:1px solid #e3ded2;">
    <tr><td style="padding:18px 20px 6px 20px;font-family:${FONT};font-size:13px;font-weight:bold;color:#5d574c;text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(deal.store_name)}</td></tr>
    <tr><td style="padding:0 20px;font-family:${DISPLAY};font-size:28px;line-height:1.1;font-weight:900;color:${INK};text-transform:uppercase;">${escapeHtml(deal.headline)}</td></tr>
    <tr><td style="padding:8px 20px 0 20px;font-family:${FONT};font-size:16px;line-height:1.5;color:${INK};">${escapeHtml(deal.description)}</td></tr>
    ${ends ? `<tr><td style="padding:6px 20px 0 20px;font-family:${FONT};font-size:14px;font-weight:bold;color:${SPRINGBOK};">${escapeHtml(ends)}</td></tr>` : ""}
    ${
      deal.code
        ? `<tr><td style="padding:10px 20px 0 20px;font-family:${FONT};font-size:14px;color:${INK};">Code: <span style="display:inline-block;padding:4px 10px;border:2px dashed ${INK};border-radius:6px;font-weight:bold;font-family:'Courier New',monospace;font-size:16px;">${escapeHtml(deal.code)}</span></td></tr>`
        : ""
    }
    <tr><td style="padding:14px 20px 18px 20px;">
      <a href="${link}" style="display:inline-block;background:${SPRINGBOK};color:#ffffff;font-family:${FONT};font-size:15px;font-weight:bold;text-decoration:none;padding:11px 18px;border-radius:9px;">Yebo, grab it &rarr;</a>
    </td></tr>
  </table>
</td></tr>`;
}

function layout(options: { preheader: string; intro: string; deals: Deal[]; footer: string }) {
  const deals = options.deals.length
    ? options.deals.map(dealBlock).join("")
    : `<tr><td style="padding:0 0 14px 0;font-family:${FONT};font-size:16px;color:${INK};">New deals land every week. Keep an eye on your inbox.</td></tr>`;
  return `<!DOCTYPE html>
<html lang="en-ZA">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Deal Guru</title></head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
      <tr><td style="background:${SPRINGBOK};border-radius:16px 16px 0 0;padding:22px 24px;">
        <div style="font-family:${FONT};font-size:15px;font-weight:bold;color:#ffffff;">Howzit, Mzansi!</div>
        <div style="font-family:${DISPLAY};font-size:40px;line-height:1;font-weight:900;color:${MARIGOLD};text-transform:uppercase;padding-top:4px;">Deal Guru</div>
      </td></tr>
      <tr><td style="height:8px;background:${MARIGOLD};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:22px 0 16px 0;font-family:${FONT};font-size:17px;line-height:1.5;color:${INK};">${options.intro}</td></tr>
      ${deals}
      <tr><td align="center" style="padding:6px 0 22px 0;">
        <a href="${SITE}" style="font-family:${FONT};font-size:16px;font-weight:bold;color:${SPRINGBOK};">See every deal on Deal Guru &rarr;</a>
      </td></tr>
      <tr><td style="border-top:1px solid #d8d2c4;padding:16px 0 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:#5d574c;">
        Deal Guru may earn a commission when you buy through these links, at no extra cost to you. Offers are set by each store and can change without notice, so check the price before you buy.<br><br>
        ${options.footer}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const storesIn = (deals: Deal[]) => [...new Set(deals.map((deal) => deal.store_name))];

function storeList(deals: Deal[]) {
  const stores = storesIn(deals).slice(0, 3);
  if (stores.length === 0) return "";
  return stores.length === 1 ? stores[0] : `${stores.slice(0, -1).join(", ")} and ${stores[stores.length - 1]}`;
}

export function welcomeEmail(options: { firstName: string | null; deals: Deal[]; unsubscribeUrl: string }) {
  const hello = options.firstName ? `Welcome, ${escapeHtml(options.firstName)}!` : "Welcome to Deal Guru!";
  return {
    subject: "Welcome to Deal Guru! Here are today's lekker deals",
    html: layout({
      preheader: options.deals.length ? `Deals from ${storeList(options.deals)} and more, picked for you.` : "Your first weekly deals email arrives on Thursday.",
      intro: `<strong>${hello}</strong> Thanks for joining. Every Thursday morning we'll send you the newest deals from South Africa's favourite stores. To get you started, here's what's on right now:`,
      deals: options.deals,
      footer: `You're getting this because you ticked "Email me the latest deals" when you joined Deal Guru. <a href="${escapeHtml(options.unsubscribeUrl)}" style="color:#5d574c;">Unsubscribe</a>.`,
    }),
  };
}

export function weeklyEmail(options: { deals: Deal[]; dateLabel: string }) {
  const [top] = options.deals;
  return {
    subject: top ? `This week's lekker deals: ${top.headline} at ${top.store_name} and more` : "This week's lekker deals",
    preheader: `Fresh deals from ${storeList(options.deals)}.`,
    html: layout({
      preheader: `Fresh deals from ${storeList(options.deals)}.`,
      intro: `<strong>Here are this week's lekker deals</strong>, newest first, for ${escapeHtml(options.dateLabel)}.`,
      deals: options.deals,
      // Brevo replaces {{ unsubscribe }} with each subscriber's own unsubscribe link.
      footer: `You're getting this because you ticked "Email me the latest deals" on Deal Guru. <a href="{{ unsubscribe }}" style="color:#5d574c;">Unsubscribe</a>.`,
    }),
  };
}
