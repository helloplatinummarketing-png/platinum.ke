/**
 * POST /api/contact: receives the contact form.
 *
 * Works two ways:
 *  - JavaScript on: the form sends JSON and gets JSON back.
 *  - JavaScript off: a normal form post, answered with a redirect to
 *    /contact/thanks or /contact/error.
 *
 * Where submissions go (set in .env.local or Vercel, never in code):
 *  - GOOGLE_SHEETS_WEBHOOK_URL: a Google Apps Script web app that adds a row
 *  - RESEND_API_KEY + CONTACT_TO_EMAIL (+ CONTACT_FROM_EMAIL): an email to Platinum
 * Either or both. NOTHING is ever sent to the person who filled in the form.
 */
import { NextResponse, type NextRequest } from "next/server";
import { rateLimited, validateContact, type ContactInput } from "@/lib/contact";

async function readBody(req: NextRequest): Promise<{ raw: Record<string, unknown>; isJson: boolean }> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return { raw: typeof body === "object" && body ? body : {}, isJson: true };
  }
  const form = await req.formData().catch(() => null);
  return { raw: form ? Object.fromEntries(form.entries()) : {}, isJson: false };
}

async function deliver(d: ContactInput): Promise<boolean> {
  const sent: Promise<boolean>[] = [];
  const when = new Date().toISOString();

  const sheet = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (sheet) {
    sent.push(
      fetch(sheet, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...d, when, source: "website" }),
      }).then((r) => r.ok),
    );
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (key && to) {
    sent.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL ?? "Website <onboarding@resend.dev>",
          to: [to], // Platinum only. Never the person who filled in the form.
          subject: `New enquiry: ${d.business} (${d.need})`,
          text: [
            `Name: ${d.name}`,
            `Business: ${d.business}`,
            `Phone: ${d.phone}`,
            `Email: ${d.email}`,
            `Needs help with: ${d.need}`,
            `Sent: ${when}`,
          ].join("\n"),
        }),
      }).then((r) => r.ok),
    );
  }

  if (sent.length === 0) {
    // Nothing set up yet. In development, show it in the terminal so the form can be tested.
    if (process.env.NODE_ENV !== "production") {
      console.log("[contact form] (no delivery set up yet)", d);
      return true;
    }
    console.error("[contact form] No delivery configured: set GOOGLE_SHEETS_WEBHOOK_URL or RESEND_API_KEY + CONTACT_TO_EMAIL");
    return false;
  }

  const results = await Promise.allSettled(sent);
  return results.some((r) => r.status === "fulfilled" && r.value);
}

function reply(req: NextRequest, isJson: boolean, status: number, body: Record<string, unknown>) {
  if (isJson) return NextResponse.json(body, { status });
  const page = status < 300 ? "/contact/thanks" : "/contact/error";
  return NextResponse.redirect(new URL(page, req.url), 303);
}

export async function POST(req: NextRequest) {
  const { raw, isJson } = await readBody(req);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (rateLimited(ip)) return reply(req, isJson, 429, { ok: false, error: "rate_limited" });

  const result = validateContact(raw);
  if (!result.ok) return reply(req, isJson, 400, { ok: false, errors: result.errors });

  // Spam trap filled in: pretend it worked, send nothing.
  if (result.spam) return reply(req, isJson, 200, { ok: true });

  const delivered = await deliver(result.data);
  return delivered ? reply(req, isJson, 200, { ok: true }) : reply(req, isJson, 502, { ok: false, error: "delivery_failed" });
}
