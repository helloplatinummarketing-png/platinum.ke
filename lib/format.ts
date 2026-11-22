import type { Contact, Ksh } from "@/content/types";

/** 80000 -> "KSh 80,000"; with plus -> "KSh 250,000+" */
export function ksh(price: Ksh): string {
  return `KSh ${price.kes.toLocaleString("en-US")}${price.plus ? "+" : ""}`;
}

/** 5000 -> "KSh 5,000/month" */
export function kshMonthly(price: Ksh): string {
  return `${ksh(price)}/month`;
}

/**
 * WhatsApp click-to-chat link with a pre-filled message.
 * Until the number is set in content/site.ts, falls back to the contact page.
 */
export function whatsappHref(c: Contact, message = c.whatsappMessage): string {
  if (!c.whatsappDigits) return "/contact";
  return `https://wa.me/${c.whatsappDigits}?text=${encodeURIComponent(message)}`;
}
