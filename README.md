# Platinum Marketing Agency: Kenya website

Websites, WhatsApp automations and AI visibility for Kenyan service businesses.
Next.js 16 (App Router), Tailwind 4, three.js (home page only). Hosted on Vercel.

All copy comes from Victor's brief (`docs/brief.md`), with the honesty fixes
marked `HONESTY FIX` in `content/site.ts`. The home-page story follows the
change order `docs/platinum-change-order-photo-story.md`.

---

## 1. Run it on your computer

Open PowerShell:

```powershell
cd C:\Dev\platinum-ke
npm install          # first time only, or after pulling changes
npm run dev          # then open http://localhost:3000
```

Stop it with **Ctrl+C**. To try the real (production) build instead:

```powershell
npm run build
npm start            # http://localhost:3000
```

---

## 2. Edit the words, prices, contact details and team

**Everything visitors read is in one file: `content/site.ts`.** No component contains copy.

| To change… | Look for in `content/site.ts` |
|---|---|
| Phone, WhatsApp number, email, booking link | `contact` |
| Prices (all pages, schema and the story's price strips) | `pricing` |
| Page titles and descriptions (Google + link previews) | `seo` |
| Home page story chapters | `photoStory` (see section 6) |
| Services cards, testimonials, stats | `homeServices`, `socialProof` |
| Websites / WhatsApp / AI Visibility / About / Contact / Pricing pages | `websitesPage`, `whatsappPage`, `aiPage`, `aboutPage`, `contactPage`, `pricingPage` |
| Team members | `aboutPage.team` |
| What's still missing | `todos` at the bottom of the file |

**"To come":** any value set to `null` shows a yellow **To come** label instead of
inventing something. When Victor sends a real value, replace `null` with it, for example:

```ts
whatsappDigits: "2547XXXXXXXX",   // digits only, with 254, no "+"
```

Your editor will underline mistakes in red (the shapes are checked by `content/types.ts`).
Then run `npm run build`: if it finishes, the content is valid.

---

## 3. Change brand colours, fonts and logo

**Colours and fonts:** `app/theme.css`. Every colour on the site comes from these
variables, so changing a value there changes it everywhere. Current values are
placeholders until Platinum's brand is decided.

**Logo:** replace `public/brand/platinum-logo.png` (keep it square, about 500×500 px).
It's a placeholder until the final logo is decided.

**Web font:** the site uses the phone's own system font (nothing to download). If the
brand gets a font, add **one** with `next/font` in `app/layout.tsx` (`display: "swap"`)
and point `--font-body` / `--font-heading` in `app/theme.css` at it.

**Link-preview images** (WhatsApp, Facebook, X): made at build time by `lib/og.tsx`.

---

## 4. Contact form, booking and analytics (settings)

Settings live in **`.env.local`** on your computer and in **Vercel → Project →
Settings → Environment Variables** online. They are never committed to Git.
`.env.example` lists them all.

| Setting | What it does |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The live address, `https://www.platinummarketingagency.co.uk` |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Turns on Umami analytics (free plan, no cookies, no banner needed) |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Form option A: each enquiry becomes a row in a Google Sheet |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Form option B: each enquiry is emailed to Platinum |

The form never sends anything to the person who filled it in. Without option A or B,
the live form shows an error (on your computer it prints enquiries in the terminal).

**Form option A, Google Sheets** (free):
1. Create a Google Sheet with the headers `when, name, business, phone, email, need, source`.
2. Extensions → Apps Script, paste this, and save:
   ```js
   function doPost(e) {
     const d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSheet().appendRow([d.when, d.name, d.business, d.phone, d.email, d.need, d.source]);
     return ContentService.createTextOutput("ok");
   }
   ```
3. Deploy → New deployment → Web app → "Execute as: Me", "Who has access: Anyone" → Deploy.
4. Copy the web app URL into `GOOGLE_SHEETS_WEBHOOK_URL`.

**Booking:** put the Calendly or Cal.com link in `contact.bookingUrl` in `content/site.ts`.
The calendar only loads when someone taps "Book".

**Analytics events** (Umami): `cta-click`, `whatsapp-click` (counted by Umami from the
`data-umami-event` attribute on links), `form-submit`, `booking-open`, and
`story-ch-01` … `story-ch-06` (how far people scroll the home story).
Umami only counts visits on the live domain, never on `localhost`.

---

## 5. Tests

```powershell
npm run build        # tests run against the real build
npm test             # about 2–3 minutes, uses the Microsoft Edge on this computer
```

They check: every page works with JavaScript off at 320 px and 1280 px, every
internal link, prices match the brief, honesty fixes, no invented testimonials or UK
details, SEO tags, preview images, schema, sitemap, the contact form and spam
protection, analytics events, and every layer of the home story.
Screenshots are saved in `test-results/screens/`.

---

## 6. Home page story

The home page opens with **the Nairobi photo story**: seven chapters, each with
a real Nairobi photo, one panel of copy, and **one visual per bullet** drawn in
a light layer on top (a glowing "YOUR BUSINESS" tower, cards, labels). The tower
and light effects are illustrations, not a real building or client.

### Where things live

| What | File |
|---|---|
| All story text (chapters, bullets, visual labels, AI question, price strips) | `content/site.ts` → `photoStory` |
| Photos: alt text, sizes, photographer credits | `content/site.ts` → `photos` |
| Notes ("Real Nairobi photos…", loader text, credit wording) | `content/site.ts` → `photoNotes` |
| Photo files (desktop 2000 px + phone `-m` 1080 px) | `public/images/nairobi/` |
| Timing (when each chapter and bullet starts) | `lib/story-timing.ts` |
| The page markup (all layers) | `components/story/PhotoStory.tsx` |
| Scroll logic (lit bullets, photos, panels, line) | `components/story/StoryController.tsx` |
| The 3D light layer (tower, cards, beam, sparks) | `components/story/three/city.ts` |
| Still tower picture for Layer 2 | `public/images/nairobi/tower-lit.png` (made by `npm run tower`) |
| Styles | `app/globals.css` → "HOME PHOTO STORY" |

### The three layers

1. **No JavaScript:** chapters stack as normal sections, photo above copy, all bullets visible.
2. **Light version** (reduced motion, older or low-memory phones, Save-Data, Opera Mini,
   WhatsApp / Facebook / Instagram browsers): the story is pinned, photos cross-fade,
   bullets light up in turn, and a still picture of the lit tower is shown.
3. **Full version:** the same, plus the 3D light layer. It starts on the visitor's first
   scroll or touch (a short "Switching on the city lights…" shows), so the page opens fast.

Add `?layer=1`, `?layer=2` or `?layer=3` to the address to see a layer.

### Change a chapter's copy

Edit the chapter in `photoStory` in `content/site.ts` (`kicker`, `heading`, `body`,
`intro`, `steps`, `priceStrip`, `ctas`, `badges`). No code changes needed. Price strips
are read from the pricing tables, so change prices there.

### Change a chapter's photo

Photos are only changed with Austin's OK (no faces, no brand logos, licence checked).

1. Make two WebP files: `name.webp` (2000 px wide) and `name-m.webp` (1080 px wide).
   Keep all six phone (`-m`) photos **under 600 KB in total**, and the hero under 60 KB.
2. Put both in `public/images/nairobi/`.
3. In `content/site.ts`: add `name` to `photos` (alt text, sizes, photographer, source link),
   then set the chapter's `photo: "name"`. Add `name` to `PhotoKey` in `content/types.ts`.
4. Run `npm test`: it checks the files exist, the credits are filled in, and the size budget.

### Change the number of bullets and visuals

Each chapter's `steps` (the bullets) and `visuals` (the light-layer cards) must have
**the same count, in the same order**: bullet 1 ↔ visual 1. A test checks this.

- **Changing the words** of a bullet or visual: edit `content/site.ts` only.
- **Adding or removing a bullet:** add or remove it in `steps` *and* `visuals`. Then, in
  `components/story/three/city.ts`, check that chapter's card list and positions
  (for example `WA` and `waPos` for WhatsApp, `HOW` and `hPos` for How it works,
  `featTags` for Websites, which lights two floors per feature). The timing adjusts
  itself (`lib/story-timing.ts` divides each chapter evenly between its bullets).

### After changing the tower's look

Run `npm run build`, start the site on port 3300 (`npx next start -p 3300`), then run
`npm run tower` in a second window. It redraws `tower-lit.png` (kept under 60 KB).

### Photo credits

All six photos are free under the Unsplash License. Credits show under each chapter,
in the footer ("Photo credits") and on the About page. Details:
`docs/demo-v2/PHOTO-CREDITS.md`.

---

## 7. Deploy to Vercel (when Austin and Victor approve)

> Nothing has been deployed. These are the steps for when you're ready.
> **Vercel's free Hobby plan is for non-commercial sites only.** An agency site
> needs the **Pro** plan (or another host). Check the team's plan first.

1. **Put the code on GitHub** (a new private repo, e.g. `platinum-ke`):
   ```powershell
   cd C:\Dev\platinum-ke
   gh repo create platinum-ke --private --source . --push
   ```
2. **Create the Vercel project:** vercel.com → *Add New… → Project* → import `platinum-ke`.
   Framework: Next.js (detected). Leave the build settings as they are.
3. **Add the environment variables** (*Settings → Environment Variables*), for Production:
   `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, and the form settings from section 4.
4. **Deploy.** Vercel gives a `…vercel.app` address: check it on a real phone.
5. **Move the domain** (*Settings → Domains*): `www.platinummarketingagency.co.uk` and
   `platinummarketingagency.co.uk` are on the UK site's project (`v0-platinum-marketing-agency-j98z`).
   Remove them there, then add them to the Kenya project. The UK site then stays reachable only at its `vercel.app` address.
6. **After it's live:**
   - In Umami, check the website's domain matches the live address.
   - Test each page on <https://pagespeed.web.dev> (mobile).
   - Share a link in WhatsApp to check the preview image and title.
   - Send a test enquiry through the form and check it arrives.
   - Submit `https://<domain>/sitemap.xml` in Google Search Console.

The UK site is a separate Vercel project. Its code and deployments are not changed; only the domain moves.

---

## 8. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` / `npm start` | Production build / run it |
| `npm run lint` | Check the code for mistakes |
| `npm test` | Run all tests (build first) |
| `npm run tower` | Redraw the still tower picture (see section 6) |

## 9. Dependencies and licences

| Package | Licence | Used for |
|---|---|---|
| next, react, react-dom | MIT | The site |
| tailwindcss, @tailwindcss/turbopack | MIT | Styles |
| three | MIT | The 3D light layer on the home page |
| @fontsource/inter | OFL-1.1 | Font for the link-preview images (build time only) |
| @playwright/test | Apache-2.0 | Tests and screenshots (development only) |
| typescript, eslint, eslint-config-next, @types/* | Apache-2.0 / MIT | Development only |

Photos: Unsplash License (free for commercial use), credits in `docs/demo-v2/PHOTO-CREDITS.md`.
