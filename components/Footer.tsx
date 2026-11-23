import Link from "next/link";
import { contact, footer, nav, photoNotes, site } from "@/content/site";
import { whatsappHref } from "@/lib/format";
import { Logo } from "./Logo";
import { ToCome } from "./ToCome";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">{footer.blurb}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="mb-3 text-sm font-bold">Pages</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <li>
              <Link href="/" className="text-muted hover:text-ink">
                Home
              </Link>
            </li>
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-sm font-bold">Contact</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              WhatsApp:{" "}
              {contact.whatsappDigits ? (
                <a href={whatsappHref(contact)} className="hover:text-ink">
                  Chat with us
                </a>
              ) : (
                <ToCome />
              )}
            </li>
            <li>
              Phone:{" "}
              {contact.phoneDisplay && contact.phoneDigits ? (
                <a href={`tel:+${contact.phoneDigits}`} className="hover:text-ink">
                  {contact.phoneDisplay}
                </a>
              ) : (
                <ToCome />
              )}
            </li>
            <li>
              Email:{" "}
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="[overflow-wrap:anywhere] hover:text-ink">
                  {contact.email}
                </a>
              ) : (
                <ToCome />
              )}
            </li>
            <li>{contact.location}</li>
          </ul>
        </div>
      </div>
      {/* pb-28: room under the last line so the floating WhatsApp button never covers it */}
      <div className="container-page border-t border-line pt-6 pb-28 text-xs text-muted">
        <p>
          {footer.copyright}. {site.tagline}
        </p>
        <p className="mt-2">
          <Link href="/about#photo-credits" className="underline-offset-2 hover:underline">
            {photoNotes.creditsHeading}
          </Link>
          : {photoNotes.creditsIntro}
        </p>
      </div>
    </footer>
  );
}
