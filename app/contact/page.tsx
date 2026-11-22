import { Section } from "@/components/blocks";
import { ClickToLoad } from "@/components/ClickToLoad";
import { FormEnhancer } from "@/components/FormEnhancer";
import { Icon } from "@/components/Icon";
import { ToCome } from "@/components/ToCome";
import { contact, contactPage as p } from "@/content/site";
import { whatsappHref } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("contact");

const field =
  "mt-1 block w-full rounded-xl border border-white/20 bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-muted/70";

/**
 * Contact page. Works with no JavaScript:
 * - the form is a normal HTML form posting to /api/contact; FormEnhancer
 *   makes it send in place when JavaScript works
 * - booking and map are links; ClickToLoad swaps in the embed only on tap
 */
export default function ContactPage() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery)}` as const;
  return (
    <>
      <section className="border-b border-line">
        <div className="container-page py-14 sm:py-20">
          <p className="kicker">Contact</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">{p.heading}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted sm:text-xl">{p.sub}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Booking + WhatsApp + details */}
          <div className="space-y-6">
            <div id="book" className="rounded-card border border-wa/40 bg-surface p-6">
              <h2 className="text-2xl font-extrabold">{p.bookingHeading}</h2>
              <div className="mt-4">
                {contact.bookingUrl ? (
                  <ClickToLoad
                    href={contact.bookingUrl}
                    embedSrc={contact.bookingUrl}
                    title={p.bookingTitle}
                    height={680}
                    event="booking-open"
                    className="btn btn-primary"
                  >
                    <Icon name="calendar" size={20} /> {p.bookingButton}
                  </ClickToLoad>
                ) : (
                  <p>
                    <ToCome what="booking link" />
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-card border border-line bg-surface p-6">
              <h2 className="text-2xl font-extrabold">{p.whatsappHeading}</h2>
              <div className="mt-4">
                {contact.whatsappDigits ? (
                  <a
                    href={whatsappHref(contact)}
                    className="btn btn-primary"
                    data-track="whatsapp-click"
                    target="_blank"
                    rel="noopener"
                  >
                    <Icon name="message" size={20} /> {p.whatsappButton}
                  </a>
                ) : (
                  <p>
                    <ToCome what="WhatsApp number" />
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-card border border-line bg-surface p-6">
              <h2 className="text-2xl font-extrabold">{p.detailsHeading}</h2>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm text-muted">Email</dt>
                  <dd>
                    {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : <ToCome />}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Phone</dt>
                  <dd>
                    {contact.phoneDisplay && contact.phoneDigits ? (
                      <a href={`tel:+${contact.phoneDigits}`}>{contact.phoneDisplay}</a>
                    ) : (
                      <ToCome />
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Location</dt>
                  <dd>
                    {contact.location}
                    <span className="block text-sm text-muted">{contact.locationNote}</span>
                  </dd>
                </div>
              </dl>
              <div className="mt-5">
                <ClickToLoad
                  href={mapsUrl}
                  embedSrc={`https://www.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed`}
                  title={p.mapTitle}
                  height={300}
                  className="inline-flex min-h-11 items-center gap-2 font-bold text-accent"
                >
                  <Icon name="map" size={20} /> {p.mapButton}
                  <span className="text-xs font-normal text-muted">({p.mapNote})</span>
                </ClickToLoad>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold">{p.formHeading}</h2>
            <form id="contact-form" action="/api/contact" method="post" className="mt-6 grid gap-4">
              <label className="block">
                <span className="font-semibold">{p.form.name}</span>
                <input name="name" required autoComplete="name" className={field} />
              </label>
              <label className="block">
                <span className="font-semibold">{p.form.business}</span>
                <input name="business" required autoComplete="organization" className={field} />
              </label>
              <label className="block">
                <span className="font-semibold">{p.form.phone}</span>
                <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" className={field} />
              </label>
              <label className="block">
                <span className="font-semibold">{p.form.email}</span>
                <input name="email" type="email" required autoComplete="email" className={field} />
              </label>
              <label className="block">
                <span className="font-semibold">{p.form.need}</span>
                <select name="need" required defaultValue="" className={field}>
                  <option value="" disabled>
                    Choose one
                  </option>
                  {p.form.needOptions.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
              {/* Spam trap: hidden from people, bots fill it in. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
                <label>
                  Leave this empty
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <button type="submit" className="btn btn-primary mt-2 w-full disabled:opacity-60 sm:w-auto">
                {p.form.submit}
              </button>
              <FormEnhancer
                formId="contact-form"
                messages={{
                  sending: p.form.sending,
                  success: p.form.success,
                  error: p.form.error,
                  tooMany: p.form.tooMany,
                  fixErrors: p.form.fixErrors,
                }}
              />
              <p className="text-sm text-muted">{p.form.privacy}</p>
            </form>
          </div>
        </div>
      </Section>
    </>
  );
}
