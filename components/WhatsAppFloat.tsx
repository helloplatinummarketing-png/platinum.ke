import { contact, whatsappFloat } from "@/content/site";
import { whatsappHref } from "@/lib/format";

/**
 * Floating WhatsApp button, bottom right, on every page.
 * Plain link: works with no JavaScript. The footer ends with extra bottom
 * padding so, when scrolled to the end, this button never covers text.
 * Page sections keep CTAs left-aligned or centred, away from this corner.
 * Until the number is set in content/site.ts it links to /contact.
 */
export function WhatsAppFloat() {
  const hasNumber = Boolean(contact.whatsappDigits);
  return (
    <a
      href={whatsappHref(contact)}
      className="fixed bottom-4 right-4 z-50 grid size-14 place-items-center rounded-full bg-wa text-wa-ink shadow-[0_6px_20px_rgb(0_0_0/0.45)] sm:bottom-6 sm:right-6"
      aria-label={hasNumber ? whatsappFloat.label : whatsappFloat.labelNoNumber}
      data-track="whatsapp-click"
      {...(hasNumber ? { target: "_blank", rel: "noopener" } : {})}
    >
      {/* Simple chat-bubble icon (drawn here, no icon library) */}
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
        <path d="M16 3C8.8 3 3 8.6 3 15.5c0 2.6.8 5 2.3 7L4 29l6.7-1.8c1.6.8 3.4 1.3 5.3 1.3 7.2 0 13-5.6 13-12.5S23.2 3 16 3zm0 22.8c-1.7 0-3.3-.4-4.7-1.2l-.4-.2-4 1 1-3.8-.3-.4c-1.3-1.7-2-3.6-2-5.7C5.6 9.9 10.3 5.4 16 5.4s10.4 4.5 10.4 10.1S21.7 25.8 16 25.8zm5.7-7.6c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.4c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
      </svg>
    </a>
  );
}
