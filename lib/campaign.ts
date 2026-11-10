/** Update these each year. Black Friday runs through Cyber Monday, in South African time. */
export const blackFriday = {
  year: 2026,
  dates: "27–30 November",
  startsAt: Date.parse("2026-11-27T00:00:00+02:00"),
  endsAt: Date.parse("2026-12-01T00:00:00+02:00"),
};

export function isBlackFridayOver(now = Date.now()) {
  return now >= blackFriday.endsAt;
}
