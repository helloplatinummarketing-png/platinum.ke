"use client";

/**
 * Shows a normal link first. Only when someone taps it (and JavaScript works)
 * does it load the heavy embed (booking calendar or Google Map) in place.
 * Without JavaScript, the link simply opens the page in a new tab.
 * Saves data: nothing from Google or Calendly loads until asked for.
 */
import { useState } from "react";
import { track, type TrackEvent } from "@/lib/track";

export function ClickToLoad({
  href,
  embedSrc,
  title,
  height,
  event,
  className,
  children,
}: {
  href: string;
  embedSrc: string;
  title: string;
  height: number;
  event?: TrackEvent;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <iframe
        src={embedSrc}
        title={title}
        className="w-full rounded-xl border border-line bg-white"
        style={{ height }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (event) track(event);
        setOpen(true);
      }}
    >
      {children}
    </a>
  );
}
