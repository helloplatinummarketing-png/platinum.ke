import type { Metadata } from "next";
import Link from "next/link";
import { contactPage as p } from "@/content/site";

// Shown after sending the form with JavaScript off. Not for search engines.
export const metadata: Metadata = { title: "Thank you | Platinum Marketing Agency", robots: { index: false } };

export default function ThanksPage() {
  return (
    <section className="container-page py-20 text-center sm:py-28">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{p.form.success}</h1>
      <Link href="/" className="btn btn-primary mt-8">
        {p.form.backHome}
      </Link>
    </section>
  );
}
