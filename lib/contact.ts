/**
 * Contact form rules, shared by the server route (app/api/contact) and tests.
 * No library needed: the form only has five fields.
 */
import { contactPage } from "@/content/site";

export type ContactInput = {
  name: string;
  business: string;
  phone: string;
  email: string;
  need: string;
};

export type ContactResult =
  | { ok: true; data: ContactInput; spam: boolean }
  | { ok: false; errors: Partial<Record<keyof ContactInput, string>> };

const clean = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ") // no control characters
    .trim()
    .slice(0, max);

export function validateContact(raw: Record<string, unknown>): ContactResult {
  // Spam trap: real people never see the "website" field, bots fill it in.
  const spam = clean(raw.website, 200).length > 0;

  const data: ContactInput = {
    name: clean(raw.name, 100),
    business: clean(raw.business, 120),
    phone: clean(raw.phone, 30),
    email: clean(raw.email, 160).toLowerCase(),
    need: clean(raw.need, 60),
  };

  const errors: Partial<Record<keyof ContactInput, string>> = {};
  if (data.name.length < 2) errors.name = "Please enter your name.";
  if (data.business.length < 2) errors.business = "Please enter your business name.";
  // Kenyan and international numbers: 7-15 digits, allowing +, spaces, dashes, brackets
  const digits = data.phone.replace(/\D/g, "");
  if (!/^[+\d\s()-]+$/.test(data.phone) || digits.length < 7 || digits.length > 15)
    errors.phone = "Please enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = "Please enter a valid email address.";
  if (!contactPage.form.needOptions.includes(data.need)) errors.need = "Please choose an option.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data, spam };
}

/**
 * Simple rate limit: at most `limit` submissions per IP per window.
 * Lives in server memory, so on Vercel it resets when the server restarts
 * and isn't shared between servers. Good enough for a small site together
 * with the spam trap; upgrade to a shared store if spam becomes a problem.
 */
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, limit = 5, windowMs = 10 * 60_000, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory small
  return recent.length > limit;
}
