// Downloads the location of every South African branch of the stores in
// data/stores.ts from OpenStreetMap, into public/branches.json.
// Runs before every build. If the download fails, the build carries on with
// the branches from last time, so a hiccup at OpenStreetMap never takes the site down.

import { readFile, writeFile } from "node:fs/promises";

const OUTPUT = new URL("../public/branches.json", import.meta.url);
const ENDPOINT = "https://overpass-api.de/api/interpreter";

let stores;
try {
  ({ stores } = await import("../data/stores.ts"));
} catch (error) {
  // Needs Node 22.18 or later, which .nvmrc asks Netlify for.
  console.warn(`Couldn't read data/stores.ts (${error.message}). Skipping the branch download.`);
  process.exit(0);
}
const physical = stores.filter((store) => store.branchNames?.length);

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const allNames = physical.flatMap((store) => store.branchNames).map(escape).join("|");

// Shops in South Africa whose brand or name starts with one of the branch names.
const query = `[out:json][timeout:120];
area["ISO3166-1"="ZA"][admin_level=2]->.za;
(
  nwr["shop"]["brand"~"^(${allNames})",i](area.za);
  nwr["shop"]["name"~"^(${allNames})",i](area.za);
);
out center tags;`;

/** "Game" matches "Game Menlyn" and "Game", but not "Games Workshop". */
function startsWithWord(text, prefix) {
  if (!text?.toLowerCase().startsWith(prefix.toLowerCase())) return false;
  return !/[\p{L}\p{N}]/u.test(text.charAt(prefix.length));
}

function storeFor(tags) {
  // Longest names first, so "Builders Warehouse" wins over "Builders".
  const candidates = physical
    .flatMap((store) => store.branchNames.map((name) => ({ store, name })))
    .sort((a, b) => b.name.length - a.name.length);
  return (
    candidates.find(({ name }) => startsWithWord(tags.brand, name)) ??
    candidates.find(({ name }) => startsWithWord(tags.name, name))
  )?.store;
}

const round = (n) => Math.round(n * 10_000) / 10_000;

async function download() {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "DealGuru-site-build" },
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(150_000),
  });
  if (!response.ok) throw new Error(`OpenStreetMap answered ${response.status}`);
  const { elements } = await response.json();

  /** @type {Record<string, [number, number, string][]>} */
  const result = Object.fromEntries(physical.map((store) => [store.slug, []]));

  for (const element of elements) {
    const lat = element.lat ?? element.center?.lat;
    const lng = element.lon ?? element.center?.lon;
    const store = storeFor(element.tags ?? {});
    if (lat === undefined || lng === undefined || !store) continue;

    const list = result[store.slug];
    // The same shop is sometimes mapped twice, as a point and as a building. Keep one.
    if (list.some(([a, b]) => Math.abs(a - lat) < 0.001 && Math.abs(b - lng) < 0.001)) continue;

    const tags = element.tags;
    const place = tags["addr:suburb"] ?? tags["addr:city"];
    const name = tags.name ?? store.name;
    list.push([round(lat), round(lng), place && !name.includes(place) ? `${name}, ${place}` : name]);
  }

  return result;
}

try {
  const branches = await download();
  const total = Object.values(branches).reduce((sum, list) => sum + list.length, 0);
  if (total === 0) throw new Error("no branches came back");
  await writeFile(
    OUTPUT,
    JSON.stringify({ updated: new Date().toISOString().slice(0, 10), stores: branches }) + "\n",
  );
  const counts = Object.entries(branches).map(([slug, list]) => `${slug} ${list.length}`);
  console.log(`Branches downloaded: ${counts.join(", ")}`);
} catch (error) {
  const previous = await readFile(OUTPUT, "utf8").catch(() => null);
  console.warn(
    `Couldn't download branches (${error.message}). ` +
      (previous ? "Using the ones from last time." : "Deals won't show distances yet."),
  );
}
