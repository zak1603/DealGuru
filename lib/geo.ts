export type Coords = { lat: number; lng: number };

/** Kilometres between two points, along the earth's surface. */
export function distanceKm(a: Coords, b: Coords) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number) {
  return km < 1 ? "under 1 km" : km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

/**
 * About 1 km of precision. Close enough to find the nearest branch, without
 * storing exactly where someone lives.
 */
export const roundCoord = (value: number) => Math.round(value * 100) / 100;

/** For people who'd rather not share their GPS location. City centres. */
export const cities: ({ name: string } & Coords)[] = [
  { name: "Bloemfontein", lat: -29.12, lng: 26.21 },
  { name: "Cape Town", lat: -33.92, lng: 18.42 },
  { name: "Durban", lat: -29.86, lng: 31.03 },
  { name: "East London", lat: -33.02, lng: 27.9 },
  { name: "George", lat: -33.96, lng: 22.46 },
  { name: "Gqeberha", lat: -33.96, lng: 25.6 },
  { name: "Johannesburg", lat: -26.2, lng: 28.05 },
  { name: "Kimberley", lat: -28.74, lng: 24.76 },
  { name: "Mbombela", lat: -25.47, lng: 30.97 },
  { name: "Pietermaritzburg", lat: -29.6, lng: 30.38 },
  { name: "Polokwane", lat: -23.9, lng: 29.45 },
  { name: "Pretoria", lat: -25.75, lng: 28.19 },
  { name: "Rustenburg", lat: -25.67, lng: 27.24 },
  { name: "Sandton", lat: -26.11, lng: 28.05 },
  { name: "Stellenbosch", lat: -33.93, lng: 18.86 },
];
