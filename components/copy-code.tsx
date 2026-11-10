"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return; // Clipboard blocked. The code is still on screen to type by hand.
    }
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-lg border-2 border-dashed border-ink/35 px-3 py-2.5 font-mono text-sm font-semibold transition-colors hover:border-ink hover:bg-marigold/25"
    >
      <span className="truncate">{code}</span>
      {copied ? (
        <Check className="size-4 shrink-0" aria-hidden />
      ) : (
        <Copy className="size-4 shrink-0" aria-hidden />
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : "Copy code"}
      </span>
    </button>
  );
}
