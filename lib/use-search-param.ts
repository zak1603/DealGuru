"use client";

import { useSearchParams } from "next/navigation";

/**
 * Reads ?name=value from the page's address, and updates when a link changes it.
 * Wrap the component that uses it in <Suspense>, so the rest of the page can still be prerendered.
 */
export function useSearchParam(name: string) {
  return useSearchParams().get(name);
}
