import type { Metadata } from "next";
import Link from "next/link";
import { contactPage as p } from "@/content/site";

// Shown if the form fails with JavaScript off. Not for search engines.
export const metadata: Metadata = { title: "Message not sent | Platinum Marketing Agency", robots: { index: false } };

export default function ContactErrorPage() {
  return (
    <section className="container-page py-20 text-center sm:py-28">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{p.form.error}</h1>
      <p className="mt-4 text-muted">{p.form.fixErrors}</p>
      <Link href="/contact" className="btn btn-primary mt-8">
        {p.form.tryAgain}
      </Link>
    </section>
  );
}
