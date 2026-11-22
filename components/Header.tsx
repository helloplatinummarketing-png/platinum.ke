import Link from "next/link";
import { cta, nav } from "@/content/site";
import { Logo } from "./Logo";

/**
 * Site header. The phone menu uses <details>, so it opens and closes
 * with no JavaScript at all (works in Opera Mini and with JS off).
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-sm">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted no-underline hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={cta.headerShort.href} className="btn btn-primary min-h-10 whitespace-nowrap px-4 py-2 text-sm max-[359px]:px-3">
            {cta.headerShort.label}
          </Link>

          <details className="group relative lg:hidden">
            <summary
              className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-line [&::-webkit-details-marker]:hidden"
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="group-open:hidden"
                />
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="hidden group-open:block"
                />
              </svg>
            </summary>
            <nav
              aria-label="Main"
              className="absolute right-0 top-13 w-64 rounded-card border border-line bg-surface p-2 shadow-2xl"
            >
              <ul>
                <li>
                  <Link href="/" className="block rounded-lg px-3 py-3 no-underline hover:bg-surface-2">
                    Home
                  </Link>
                </li>
                {nav.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block rounded-lg px-3 py-3 no-underline hover:bg-surface-2">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
