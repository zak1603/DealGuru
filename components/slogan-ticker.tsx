const SLOGANS = [
  "Local is lekker",
  "Sharp sharp",
  "Yebo!",
  "Ayoba savings",
  "Eish, those prices!",
  "Deals now-now, not just now",
  "Mzansi's favourite stores",
];

/** Repeated so the strip stays full on very wide screens and loops without a jump. */
const REPEATED = Array.from({ length: 6 }, () => SLOGANS).flat();

export function SloganTicker() {
  return (
    <div aria-hidden className="overflow-hidden bg-marigold py-1.5 text-ink">
      <div
        data-ticker
        className="flex w-max animate-ticker hover:[animation-play-state:paused] motion-reduce:animate-none"
      >
        {REPEATED.map((slogan, index) => (
          <span key={index} className="display flex items-center text-lg whitespace-nowrap">
            {slogan}
            <span className="mx-4 text-springbok">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
