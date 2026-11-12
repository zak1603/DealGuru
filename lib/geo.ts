export type SavedLocation = { label: string; lat: number; lng: number };

/** [latitude, longitude, area name if known] */
export type BranchPoint = [number, number, string?];

export type BranchFile = {
  attribution: string;
  updated: string;
  branches: Record<string, BranchPoint[]>;
};

export type Nearest = { km: number; area?: string };

export const CITIES: SavedLocation[] = [
  { label: "Johannesburg", lat: -26.2, lng: 28.05 },
  { label: "Cape Town", lat: -33.92, lng: 18.42 },
  { label: "Durban", lat: -29.86, lng: 31.02 },
  { label: "Pretoria", lat: -25.75, lng: 28.19 },
  { label: "Gqeberha", lat: -33.96, lng: 25.6 },
  { label: "Bloemfontein", lat: -29.12, lng: 26.21 },
  { label: "East London", lat: -33.02, lng: 27.91 },
  { label: "Pietermaritzburg", lat: -29.6, lng: 30.38 },
  { label: "Polokwane", lat: -23.9, lng: 29.45 },
  { label: "Mbombela", lat: -25.47, lng: 30.97 },
  { label: "Kimberley", lat: -28.74, lng: 24.77 },
  { label: "Rustenburg", lat: -25.67, lng: 27.24 },
  { label: "George", lat: -33.96, lng: 22.46 },
];

/** Two decimal places is roughly 1 km, close enough to sort stores without pinpointing a home. */
export const roundCoordinate = (value: number) => Math.round(value * 100) / 100;

export function isSavedLocation(value: unknown): value is SavedLocation {
  if (typeof value !== "object" || value === null) return false;
  const { label, lat, lng } = value as Record<string, unknown>;
  return (
    typeof label === "string" &&
    typeof lat === "number" &&
    typeof lng === "number" &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export function nearestBranch(location: SavedLocation, points: BranchPoint[]): Nearest | null {
  let best: Nearest | null = null;
  for (const [lat, lng, area] of points) {
    const km = distanceKm(location.lat, location.lng, lat, lng);
    if (!best || km < best.km) best = { km, area };
  }
  return best;
}

export const formatKm = (km: number) => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`);
