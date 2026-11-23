"use client";

/**
 * Subtle page transition: a short fade when moving between pages.
 * Skipped on the first page load (so it never delays the first view) and
 * for reduced motion (globals.css turns animations off).
 */
import { useLayoutEffect, useRef } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = document.documentElement;
    // First page of the visit: remember it and don't animate
    if (!root.dataset.navigated) {
      root.dataset.navigated = "1";
      return;
    }
    ref.current?.classList.add("page-enter");
  }, []);
  return <div ref={ref}>{children}</div>;
}
