import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

/**
 * PLACEHOLDER LOGO: public/brand/platinum-logo.png (final logo not decided).
 * The file has a white background, so it sits on a light tile.
 */
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline" aria-label={`${site.name}, home`}>
      <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white">
        <Image src="/brand/platinum-logo.png" alt="" width={40} height={40} priority />
      </span>
      {/* Wordmark hidden under 360px wide so the header fits on the smallest phones */}
      <span className="leading-tight max-[359px]:sr-only">
        <span className="block text-sm font-extrabold tracking-[0.12em]">PLATINUM</span>
        <span className="block text-[11px] text-muted">Marketing Agency</span>
      </span>
    </Link>
  );
}
