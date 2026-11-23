import { photoNotes, photos } from "@/content/site";
import type { PhotoKey } from "@/content/types";

/** "Photo: Mustafa Omar / Unsplash", linking to the photo's Unsplash page. */
export function PhotoCredit({ photo, className = "" }: { photo: PhotoKey; className?: string }) {
  const p = photos[photo];
  return (
    <span className={className}>
      {photoNotes.creditPrefix}{" "}
      <a href={p.sourceUrl} rel="noopener" target="_blank" className="underline underline-offset-2">
        {p.photographer} {photoNotes.creditSuffix}
      </a>
    </span>
  );
}
