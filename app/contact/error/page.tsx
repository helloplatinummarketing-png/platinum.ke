import type { Metadata } from "next";
import Link from "next/link";
import { contact, contactPage as p } from "@/content/site";
import { whatsappHref } from "@/lib/format";

// Shown if the form fails with JavaScript off. Not for search engines.
// Gives the real WhatsApp and email, so an enquiry is never a dead end.
export const metadata: Metadata = { title: "Message not sent | Platinum Marketing Agency", robots: { index: false } };

export default function ContactErrorPage() {
  return (
    <section className="container-page py-20 text-center sm:py-28">
      <h1 className="mx-auto max-w-2xl text-2xl font-extrabold [overflow-wrap:anywhere] sm:text-3xl">{p.form.error}</h1>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {contact.whatsappDigits && (
          <a href={whatsappHref(contact)} className="btn btn-primary" data-umami-event="whatsapp-click">
            {p.whatsappButton}
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="btn btn-ghost">
            {p.emailButton}
          </a>
        )}
        <Link href="/contact" className="btn btn-ghost">
          {p.form.tryAgain}
        </Link>
      </div>
    </section>
  );
}
