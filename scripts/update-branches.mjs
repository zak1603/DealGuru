// Refreshes public/branches.json with South African store locations from
// OpenStreetMap. Run it with: node scripts/update-branches.mjs
//
// Store locations © OpenStreetMap contributors, available under the Open
// Database Licence (https://www.openstreetmap.org/copyright). OpenStreetMap is
// community-mapped, so some branches may be missing.

import { writeFileSync } from "node:fs";

/** Which mapped shops belong to each store in data/stores.ts, by OpenStreetMap brand or name. */
const STORES = {
  woolworths: { wikidata: ["Q8033997"], brand: /^Woolworths$/i, name: /^Woolworths( Food)?\b/i },
  "dis-chem": { wikidata: ["Q97274558"], brand: /^Dis-Chem$/i, name: /^Dis-Chem\b/i },
  makro: { wikidata: ["Q704606"], brand: /^Makro$/i, name: /^Makro\b/i },
  game: { wikidata: ["Q126811048", "Q129263113"], brand: /^Game$/i, name: /^Game$/i },
  builders: {
    wikidata: ["Q116819137"],
    brand: /^Builders( Warehouse| Express| Superstore)?$/i,
    name: /^Builders (Warehouse|Express|Superstore)\b/i,
  },
  hificorp: { wikidata: ["Q130331336"], brand: /^HiFi ?Corp$/i, name: /^HiFi ?Corp\b/i },
  incredible: {
    wikidata: ["Q130377046"],
    brand: /^Incredible( Connection)?$/i,
    name: /^Incredible( Connection)?\b/i,
  },
};

// Cafés and restaurants inside stores aren't separate places to shop.
const SKIP = new Set(["cafe", "restaurant", "fast_food", "alcohol"]);
const MERGE_WITHIN_KM = 0.3;

const query = `
[out:json][timeout:180];
area["ISO3166-1"="ZA"][admin_level=2]->.za;
(
  nwr(area.za)["brand"~"Woolworths|Dis-Chem|Makro|^Game$|Builders|HiFi ?Corp|Incredible",i];
  nwr(area.za)["name"~"^(Woolworths|Dis-Chem|Makro|Game|Builders|HiFi ?Corp|Incredible)",i]["shop"];
);
out center tags;`;

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad;
  const dLng = (b[1] - a[1]) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

function storeFor(tags) {
  if (SKIP.has(tags.amenity) || SKIP.has(tags.shop)) return null;
  for (const [slug, rule] of Object.entries(STORES)) {
    if (rule.wikidata.includes(tags["brand:wikidata"])) return slug;
    if (tags.brand && rule.brand.test(tags.brand)) return slug;
    if (!tags.brand && tags.name && tags.shop && rule.name.test(tags.name)) return slug;
  }
  return null;
}

const response = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    "user-agent": "DealGuru/1.0 (store locator data refresh)",
  },
  body: "data=" + encodeURIComponent(query),
  signal: AbortSignal.timeout(240_000),
});
if (!response.ok) throw new Error(`OpenStreetMap request failed: HTTP ${response.status}`);
const { elements } = await response.json();

const branches = Object.fromEntries(Object.keys(STORES).map((slug) => [slug, []]));
for (const element of elements) {
  const tags = element.tags ?? {};
  const slug = storeFor(tags);
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (!slug || lat === undefined || lng === undefined) continue;

  const point = [Number(lat.toFixed(4)), Number(lng.toFixed(4))];
  // The same branch is often mapped twice, e.g. as a building and a point.
  if (branches[slug].some((existing) => distanceKm(existing, point) < MERGE_WITHIN_KM)) continue;

  const area = tags.branch || tags["addr:suburb"] || tags["addr:city"];
  branches[slug].push(area ? [...point, String(area).slice(0, 40)] : point);
}

const output = {
  attribution: "Store locations © OpenStreetMap contributors (ODbL)",
  updated: new Date().toISOString().slice(0, 10),
  branches,
};
writeFileSync(new URL("../public/branches.json", import.meta.url), JSON.stringify(output));
for (const [slug, list] of Object.entries(branches)) console.log(slug.padEnd(12), list.length);
