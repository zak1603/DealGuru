/** Headline text whose letters drop in one by one. Words never break mid-word. */
export function AnimatedWord({ text }: { text: string }) {
  let letterIndex = 0;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(" ").map((word, wordIndex) => (
          <span key={wordIndex}>
            {wordIndex > 0 && " "}
            <span className="inline-block whitespace-nowrap">
              {[...word].map((letter, index) => (
                <span
                  key={index}
                  className="inline-block animate-letter motion-reduce:animate-none"
                  style={{ animationDelay: `${letterIndex++ * 40}ms` }}
                >
                  {letter}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}
