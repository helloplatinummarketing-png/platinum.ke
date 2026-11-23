# Prompt for Claude Code: rebuild the Platinum Marketing Agency site for Kenya with the 3D phone story

## 1. Context

**Project:** the website for Platinum Marketing Agency, our own agency.
- The current site, **platinummarketingagency.co.uk**, targets UK trades businesses in Bristol. It's built with Next.js and hosted on Vercel.
- We're rebuilding it for **Kenyan service businesses**: dentists, clinics, salons, real estate agents, hotels and Airbnbs, garages, restaurants.
- **Domain:** `.co.ke` or `.com`. Victor will confirm, so keep the domain in config.

**Who reads it:** busy Kenyan business owners, most of them on phones, often on slow or expensive data, and often opening links inside WhatsApp. They want to know one thing: "Will this bring me more customers?"

**Our quality bar** (if two conflict, the higher one wins):
1. Opens and works fast on any smartphone, from 320 px wide, including older Androids, older iPhones, Opera Mini and the browser inside WhatsApp.
2. Brings leads: a clear offer, one clear next step per page, easy contact.
3. Looks distinctive, never like a template.
4. Delivered in small steps I can check.

**My machine:**
- Windows 11, HP EliteBook 830 G8, Intel i5-1145G7, 16 GB RAM, no dedicated GPU
- PowerShell 7 (pwsh), VS Code, Git
- Projects live in `C:\Dev`, never in OneDrive or on the Desktop.

I'm still learning to code, so explain what you do in plain English.

**Files I've put in the repo for you:**
- `docs/brief.md`: Victor's full build brief (1 Nov 2026). **All page copy comes from it.**
- `docs/demo/index.html`: the approved demo of the home-page animation (a 3D phone story built with three.js r128). Use it as the **reference for the motion and the screen designs**, but rebuild it properly in the new stack.

## 2. Step 0: read first, change nothing
1. Read the existing repo: framework version, folders, components, styling, how the logo and images load, and any analytics or booking code. Read `docs/brief.md` and `docs/demo/index.html`.
2. Check whether the current code can be reworked or whether a fresh Next.js app in a new folder is cleaner. Recommend one and say why.
3. Show me a **short plan** (max 20 lines):
   - pages and routes
   - the content file structure
   - how the 3D phone is split into components
   - the fallback layers
   - what you'll reuse from the current site
4. **Wait for my OK.** Change nothing until I say go.

## 3. Requirements

### 3.1 Pages (copy from `docs/brief.md`, section 3)
1. **Home** (`/`): the 3D phone story (3.3), then services cards, how it works, social proof placeholder and the final CTA.
2. **Websites** (`/websites`): hero, what you get, the pricing table, FAQ, CTA.
3. **WhatsApp Automations** (`/whatsapp-automations`): hero, problem, the 7 automations, pricing table, FAQ, CTA.
4. **AI Visibility** (`/ai-visibility`): hero, problem, what we do (6 items), pricing table, CTA.
5. **About** (`/about`): story, team (4 people), 3 values.
6. **Contact** (`/contact`): booking embed, WhatsApp button, form, email, phone, Nairobi, Google Map.
7. **Pricing** (`/pricing`): three columns side by side, the bundle banner, CTA.

Every page ends with one clear CTA, either "Book Your Free Check" or "Get Your Free AI Check".

### 3.2 Content rules
- **Put all text, prices, contact details, team members and links in one editable content file,** for example `content/site.ts`. No copy hard-coded in components.
- **Prices** are in KSh exactly as written in the brief.
- **Honesty fixes.** Apply these and list them in your final summary:
  - **Remove** "Customers won't know it's automated". Use: "Every message sounds natural and comes from your business name."
  - "You can use your existing business number" becomes "Usually yes. We'll check your number during setup." Mark it `TODO: confirm WhatsApp coexistence in Kenya`.
  - **Tool cost line:** keep the sentence, but show the figure as `To come: updated cost` (Meta changed WhatsApp pricing in October 2026).
  - **Testimonials and stats bar:** build the sections with clearly marked "To come" placeholders. Never invent names, quotes, numbers or results.
  - **Team:** names from the brief, placeholder images, and a code comment `TODO: confirm consent for name and photo`.
  - **Contract terms:** use "No long contracts. Cancel anytime." from the brief, plus `TODO: Victor to confirm notice period`.
- **Contact details** (Kenya phone, WhatsApp number, email, Calendly link) are placeholders marked `To come`. Don't reuse the UK number.
- **Language:** English only. Short paragraphs. No jargon.

### 3.3 The 3D phone story (home page signature; follow the demo)
**One idea:** a 3D phone tells one customer's journey on scroll. The page copy beside it (below it on phones) changes at each stop.

**Seven stops,** each with the brief's copy and its own phone screen:
1. Hero
2. Problem
3. AI visibility
4. Website
5. WhatsApp
6. How it works
7. Final CTA

**Motion** (keep it as strong as the demo, the client specifically asked for noticeable animation):
- The phone spins in when the page loads.
- A full 360° flip at each stop, with the screen swapping while its back faces the viewer.
- **Pop-out 3D cards** that burst from the screen at each stop:
  - Problem: red cards that fall away
  - AI: the "Top Pick" card flying forward
  - Website: the site splitting into floating layers
  - WhatsApp: messages that orbit the phone
  - How it works: numbered tiles
- Customer dots that scatter during the problem stop and gather afterwards, background colour changes between stops, and a camera dive at the end.

**Build rules:**
- Draw the phone body in code (three.js `ExtrudeGeometry`) and the screens with canvas textures, as in the demo. **No heavy 3D model files and no video.**
- Use **three.js only on the home page**, loaded lazily after the first paint, plus GSAP ScrollTrigger (or the demo's scroll maths) for scroll control.
- **Phone screen text comes from the content file,** so copy changes need no code.

**Layers (required):**
- **Layer 1, no JavaScript:** all seven stops show as normal stacked sections with their copy and a **static image of each phone screen** (pre-rendered WebP, under 40 KB each). The page is fully readable and every CTA works.
- **Layer 2, a flat phone:** a CSS-only phone that swaps screens on scroll. This is for devices with no WebGL, Opera Mini, reduced motion, low memory (`deviceMemory < 4`) or Save-Data, and for the in-app browsers of WhatsApp, Facebook and Instagram.
- **Layer 3, the full 3D story:** only on capable devices.
- **Reduced motion:** no flips, no flying cards, no camera moves. Fade between screens only.
- **Small phones** (under 400 px wide): fewer pop-out cards, at most 3 per stop, and a lower pixel ratio.
- **Pause rendering** when the section is off-screen or the tab is hidden.

### 3.4 Site-wide must-haves
- A floating WhatsApp click-to-chat button on every page, using `wa.me` with a pre-filled message (bottom right, never covering a CTA).
- **Contact form:** name, business name, phone, email, and a "What do you need help with?" dropdown (Website / WhatsApp Automations / AI Visibility / All of the above / Not sure).
  - Send submissions to email, or to Google Sheets through a serverless route.
  - Add spam protection (honeypot field + rate limit).
  - **Never send anything automatically to the person who submitted the form.**
- **Booking:** a Calendly or Cal.com embed. The link stays a placeholder until Victor provides it, and loads only when someone clicks "Book".
- **Google Maps:** a light embed on the contact page that loads only when someone taps it.
- **SEO:**
  - a title and description for every page
  - alt text on every image
  - `sitemap.xml` and `robots.txt`
  - canonical URLs
  - **Open Graph and Twitter tags** with a 1200×630 preview image for each page, so links preview well in WhatsApp
- **Schema markup (JSON-LD):** `ProfessionalService`/`LocalBusiness` for Platinum (Nairobi), `Service` on each service page, `FAQPage` where there's an FAQ, and `Offer` for prices in KES.
- **Analytics:** Vercel Analytics or Plausible. Ask me which, and check the current price before suggesting a paid option. Track these events: CTA clicks, WhatsApp clicks, form submits, booking opens.
- Cookie notice only if the analytics we choose needs one.

### 3.5 Brand
- **Platinum's brand colours, fonts and final logo are not decided yet.**
  - Put every colour and font in one theme file (CSS variables + Tailwind config).
  - Use the existing `platinum-logo.png` as a clearly marked placeholder.
- The demo's colours: dark navy background, silver phone, WhatsApp green for actions, light blue accent. Treat them as placeholders.
- Use the system font stack, or **at most one** web font with `font-display: swap`.

### 3.6 Performance budget (mobile)
- Lighthouse mobile scores: Performance **80+**; Accessibility, Best Practices and SEO **95+**.
- First load under **200 KB of JavaScript** before three.js. Load three.js only on the home page, after first paint.
- Images in WebP/AVIF with explicit sizes, and lazy-loaded below the fold.

## 4. Rules
- Stack: **Next.js** (App Router, static export where possible), **Tailwind**, **GSAP**, and **three.js only on the home page**. Deploy target: Vercel.
- Follow the existing code patterns where the current repo is kept. Keep changes isolated.
- **Ask before deleting** or renaming any existing file, page or route. The UK pages stay available until I say otherwise.
- **No secrets in code.** Form and API keys go in `.env.local` (git-ignored), with a `.env.example`.
- **Licences:** use only code and assets that are free for commercial use. List every new dependency with its licence.
- **Don't deploy.** Give me the deploy steps and wait for me.
- Windows paths and PowerShell commands only. Give full paths and say what I should see.

## 5. Build order (stop at each ⏸ and show me)
1. Project setup, theme file, content file filled from the brief, layout, header and footer, WhatsApp float button. ⏸
2. All 7 pages as **Layer 1**: plain HTML/CSS, every section, all copy, working navigation, works with JavaScript off. ⏸ Show me at 320 px and 1280 px.
3. Contact form, booking placeholder, map, SEO tags, schema, sitemap, analytics. ⏸
4. **Layer 2:** the flat CSS phone story on the home page.
5. **Layer 3:** the 3D phone story matching the demo, plus the reduced-motion and small-phone rules. ⏸ Show me a screen recording or screenshots of each stop, and Lighthouse mobile scores.
6. Polish: page transitions (subtle), hover states, Open Graph images.

## 6. Tests, README, commits, summary
- **Tests:**
  - content file types
  - every page renders with JavaScript off
  - the form validates and blocks spam
  - every internal link works
  - schema validates (Schema.org validator)
- **Run Lighthouse mobile** on every page and report the scores.
- **Pre-launch checklist:** report each item as pass, fail or not tested:
  1. real low-cost Android, iPhone, and 320 px
  2. JavaScript off, reduced motion, slow 3G
  3. Lighthouse targets
  4. every link, button, form and WhatsApp link works, and submissions arrive
  5. WhatsApp link preview shows the right image, title and description
  6. no placeholder or "To come" text left (unless approved)
  7. spelling, prices and numbers match the brief
  8. SEO, schema, sitemap and analytics in place
  9. every claim is true (no invented stats or testimonials)
  10. Victor or I have approved the final version
- **README:**
  - how to run it locally
  - how to edit the content file
  - how to change brand colours
  - how to update the phone screens
  - deploy steps for Vercel
- **Commits:** small ones, one per build step.
- **Final summary:**
  - what works
  - what you tested
  - what you couldn't test
  - every "To come" placeholder left, as a list for Victor
  - the honesty fixes made to the brief
  - where our site is still weaker than the best agency sites, and what would close the gap
