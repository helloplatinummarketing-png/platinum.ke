"use client";

/**
 * Listens once for clicks on any link marked data-track="…" (CTA buttons,
 * WhatsApp buttons) and sends an analytics event. Links work normally
 * whether or not this runs.
 */
import { useEffect } from "react";
import { track, type TrackEvent } from "@/lib/track";

export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("a[data-track]");
      if (!el) return;
      const event = el.dataset.track as TrackEvent;
      if (event === "cta-click" || event === "whatsapp-click") {
        track(event, { label: (el.textContent ?? "").trim().slice(0, 60), page: location.pathname });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
