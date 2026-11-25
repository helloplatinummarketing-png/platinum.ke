# Platinum Kenya website: handover and final summary

**Date:** 23 November 2026 · **Built by:** Austin, with Claude Code · **Status:** live at https://www.platinummarketingagency.co.uk since 26 Nov 2026
**Code:** `C:\Dev\platinum-ke` (Git, one commit per build step) · **Review files:** `C:\Dev\platinum-review\`

---

## 1. What works

- **7 pages:** Home, Websites, WhatsApp Automations, AI Visibility, Pricing, About, Contact. All copy from Victor's brief, in one file (`content/site.ts`). Every page ends with one CTA.
- **Home page: the Nairobi photo story** (change order of 23 Nov). Seven chapters, real Nairobi photos, a glowing "YOUR BUSINESS" tower drawn on top, one visual per bullet, linked to the text by the same scroll position. Three layers:
  1. **No JavaScript:** chapters stack, photo above copy.
  2. **Light version** (reduced motion, older phones, Save-Data, Opera Mini, WhatsApp/Facebook/Instagram browsers): pinned story, photo cross-fades, bullets light up, still tower picture.
  3. **Full version:** the 3D light layer starts on the first scroll or touch, with a short "Switching on the city lights…".
- **Contact form:** checks every field, hidden spam trap, max 5 sends per 10 minutes per connection, delivers to Google Sheets and/or email. Never emails the person who filled it in. Works with and without JavaScript.
- **Booking and Google Map:** load only when tapped.
- **WhatsApp button** on every page (`wa.me` with a pre-filled message, once the number is set).
- **SEO:** title, description, canonical and link-preview tags (WhatsApp/Facebook/X) with a 1200×630 image on every page; `sitemap.xml`; `robots.txt`.
- **Schema (JSON-LD):** ProfessionalService (Nairobi), Service with KSh offers on each service page, FAQPage. 0 errors in the Schema.org validator.
- **Analytics:** Umami Cloud (free plan, no cookies, so no cookie banner). Tracks CTA clicks, WhatsApp clicks, form sends, booking opens, and how far people scroll the home story (`story-ch-01` … `06`).
- **Polish:** subtle fade between pages, hover and focus states.

## 2. What was tested

- **121 automated tests**, all passing (`npm test`):
  - every page with JavaScript off at 320 px and 1280 px
  - internal links
  - prices against the brief
  - honesty fixes; no invented testimonials, stats or UK details
  - SEO tags and preview images
  - schema, sitemap and robots
  - form rules, spam trap, rate limit, no-JavaScript form flow
  - analytics events
  - each home-story layer, including:
    - the bullet and its visual change at the same scroll point
    - nothing off-screen at 320 px
    - photo sizes per screen width
    - pausing when off-screen
    - three.js only on the home page, after first paint
  - page fade only between pages
- **Lighthouse (mobile, local production build, laptop on battery):**

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home | 80 (83–87 in other runs) | 100 | 100 | 100 |
| Websites | 86 | 100 | 100 | 100 |
| WhatsApp Automations | 89 | 100 | 100 | 100 |
| AI Visibility | 90 | 100 | 100 | 100 |
| Pricing | 88 | 100 | 100 | 100 |
| About | 86 | 100 | 100 | 100 |
| Contact | 89 | 100 | 100 | 100 |

- **Data on phones:** about 180 KB of JavaScript before three.js; photos 570 KB in total (hero 50 KB first); still tower 51 KB.

## 3. What couldn't be tested

- **Real devices:** a low-cost Android, an iPhone, and the real WhatsApp/Facebook/Instagram in-app browsers (tested with emulation only); 30 fps on a mid-range Android.
- **Real slow 3G** (Lighthouse simulates slow 4G only).
- **Lighthouse on Google's servers** ([PageSpeed Insights](https://pagespeed.web.dev)): needs the live site.
- **Form delivery:** no Google Sheet or email is set up yet, so no enquiry has actually arrived anywhere.
- **The link preview inside WhatsApp itself,** and **Umami events in the dashboard:** both need the live domain.

## 4. Pre-launch checklist

| # | Check | Result |
|---|---|---|
| 1 | Real low-cost Android, iPhone, and 320 px | **Not tested** on real phones · 320 px **pass** (emulated) |
| 2 | JavaScript off, reduced motion, slow 3G | JS off **pass** · reduced motion **pass** · slow 3G **not tested** |
| 3 | Lighthouse targets (Perf 80+, others 95+) | **Pass** locally (80–90 / 100 / 100 / 100); confirm on PageSpeed Insights after deploy |
| 4 | Every link, button, form and WhatsApp link works; submissions arrive | Links and form checks **pass** · WhatsApp number **fail** (to come) · submissions arriving **not tested** (no delivery set up) |
| 5 | WhatsApp link preview shows the right image, title, description | Tags and images **pass** · real WhatsApp preview **not tested** (needs live site) |
| 6 | No placeholder or "To come" text left | **Fail**, on purpose: see section 5 |
| 7 | Spelling, prices and numbers match the brief | Prices **pass** (automated) · spelling **not tested** by a person |
| 8 | SEO, schema, sitemap and analytics in place | **Pass** (analytics live check after deploy) |
| 9 | Every claim is true | No invented stats or testimonials **pass** · service promises need Victor's check: see section 7 |
| 10 | Victor or Austin approved the final version | **Not yet** |

## 5. "To come": what Victor needs to send

**Settled on 23 Nov (Austin), number changed 26 Nov:** the site uses the Kenyan number **+254 185 587 728**, the previous site's
email (**helloplatinummarketing@gmail.com**) and domain (**www.platinummarketingagency.co.uk**).

1. **Brand:** colours, fonts and final logo (placeholders now)
2. **Confirm +254 185 587 728 is on WhatsApp** (the WhatsApp buttons use it)
3. **Calendly / Cal.com booking link**
4. **WhatsApp tool cost per month** (Meta changed pricing in October 2026)
5. **Confirm** customers can keep their existing WhatsApp number in Kenya
6. **Notice period** for "Cancel anytime"
7. **What "Repeat Business Follow-Up" does** (in the WhatsApp Growth package)
8. **Which AI Visibility tier** is included in WhatsApp Full System
9. **No-Show Recovery:** real numbers, or keep "Many rebook straight away"
10. **Reply time** to show after the contact form (now "We'll be in touch soon")
11. **3 real testimonials** (with the clients' OK)
12. **Real numbers** for the stats bar (businesses served, leads, reviews)
13. **Team:** a one-line bio and a photo for Victor, Austin, Samara and Ann, **plus each person's OK** to show their name and photo
14. **Form delivery:** Google Sheet or email set-up (README section 4)
15. **Vercel plan:** the free Hobby plan doesn't allow commercial sites, so Pro (or another host) is needed

## 6. Honesty fixes made to the brief

- **Removed** "Customers won't know it's automated." Now: "Every message sounds natural and comes from your business name."
- "You can use your existing business number" became "Usually yes. We'll check your number during setup." (marked to confirm)
- **Tool cost:** the sentence stays, but the figure shows "To come" (Meta pricing changed).
- "Most rebook on the spot" became "Many rebook straight away" (no data yet).
- "Your Google Business Profile is **the #1** thing AI looks at" became "**one of the main** things AI looks at."
- **Testimonials and stats:** sections built with "To come"; nothing invented.
- **Team:** names from the brief, placeholder photos, consent marked to confirm.
- "No long contracts. Cancel anytime." kept, with the notice period marked to confirm.
- **UK details removed:** the UK phone number and Bristol don't appear anywhere.
- **Example businesses** ("Your Clinic", "Your Business ★ 4.9", "KSh 2,500 (example)") are labelled as illustrations, and the glowing tower is labelled as an illustration, not a real building.

## 7. Service promises Victor should confirm are true

The brief's copy makes promises the site states as fact. They're fine **if the systems really do this**:

- Missed-call reply "within 30 seconds"; enquiry reply "within 60 seconds", by WhatsApp **and** email
- Reminders "48 hours before and 2 hours before"; no-show message "within 30 minutes"
- "You see everything in one inbox" and "a dashboard showing every lead, every reply, every follow-up"
- The AI audit covers "ChatGPT, Google Gemini, Claude, Perplexity, Siri"
- Build times: Starter 1–2 weeks, Growth 2–3 weeks, Premium 3–5 weeks
- "We work **exclusively** with Kenyan service businesses" (the UK site still exists)

## 8. Where the site is still weaker than the best agency sites, and what would close the gap

| Gap | What would close it |
|---|---|
| **No proof yet:** no case studies, results, testimonials or client logos | 2–3 short case studies (before/after numbers, a quote, a photo), the first real testimonials, and a "Recent work" strip on the home page |
| **Brand not decided:** placeholder logo, colours and system font | A finished logo and palette, applied through `app/theme.css` in minutes |
| **No portfolio:** the Websites page describes the service but shows no sites | 3–4 screenshots or live links of sites Platinum has built |
| **Trust signals are thin** | Registered business name, Google Business Profile with reviews, a real Kenyan phone number on every page, response-time promise |
| **WhatsApp automation is only described** | A "try it" button: message Platinum's number and get the real automated reply. This is the strongest proof possible |
| **English only** | A Swahili version of the key pages (the Premium package itself offers English/Swahili) |
| **No content for search and AI** | A short FAQ or blog per service and area ("best dentist website Westlands"), as Platinum sells to clients. Practise what we preach |
| **No live testing on real devices yet** | One afternoon with a low-cost Android on mobile data before launch |

## 9. Deploying

**Live since 26 Nov 2026.** Vercel team "Platinum marketing", project `platinum-ke`, deployed from
`C:\Dev\platinum-ke` with the Vercel CLI (`npx vercel deploy --prod --scope platinummarketing`),
signed in as the team Owner. Domains `www.platinummarketingagency.co.uk` and the bare domain are on
this project; neither was attached to the UK project at the time.

GitHub is **not** connected to the Vercel project yet (Victor's Vercel account has no GitHub login),
so pushing to GitHub does not deploy. The team is on the Hobby plan, which is for non-commercial use only.
