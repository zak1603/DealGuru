const dayLabel = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});

// Dates in the data files are South African days.
export const startOfDay = (day: string) => Date.parse(`${day}T00:00:00.000+02:00`);
export const endOfDay = (day: string) => Date.parse(`${day}T23:59:59.999+02:00`);
export const formatDay = (day: string) => dayLabel.format(endOfDay(day));

export function assertDay(value: string, label: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(endOfDay(value))) {
    throw new Error(`${label} must look like 2026-12-31`);
  }
}

export function assertHttpUrl(value: string, label: string) {
  if (!URL.canParse(value) || !/^https?:$/.test(new URL(value).protocol)) {
    throw new Error(`${label} must be a full link starting with http:// or https://`);
  }
}
