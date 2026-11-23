# Change order for Claude Code: replace the 3D phone story with the Nairobi photo story

## 1. Context (read this first)
You are already building the Platinum Marketing Agency Kenya site from **`docs/platinum-kenya-site-prompt.md`** (the original prompt).

**This file changes only the home-page animation and the copy linked to it.** Everything else in the original prompt still applies:
- quality bar
- pages
- content file
- honesty fixes
- brand placeholders
- layers
- SEO and schema
- rules
- tests
- checklist
- "don't deploy"

Where this file and the original disagree, **this file wins**.

**New reference files I've added to the repo:**
- `docs/demo-v2/index.html` and `docs/demo-v2/photo-story.js`: the **approved** demo (real Nairobi photos plus a three.js light layer). Copy its motion and timing; rebuild it properly in our stack.
- `docs/demo-v2/img/*.webp`: the 6 optimised photos, each in a desktop version (2000 px) and a mobile version (`-m`, 1080 px).
- `docs/demo-v2/PHOTO-CREDITS.md`: photographers, source links and licence notes.

The old reference `docs/demo/index.html` (the phone story) is **retired**. Don't delete it; just stop using it.

## 2. Step 0: check where you are, change nothing
1. List what you've already built, grouped by build step from the original prompt (steps 1–6), and say which steps are finished.
2. Read `docs/demo-v2/` in full.
3. Show me a **short change plan** (max 15 lines):
   - which existing files or components are affected by this change order
   - what you'll **keep**
   - what you'll **replace**
   - what becomes **unused** (for example the phone component, its screen textures, and the phone-screen images for Layer 1)
4. **Don't delete any unused file yet.** List them and ask me.
5. **Wait for my OK.**

## 3. What changes

### 3.1 Replace original section 3.3 ("The 3D phone story") with "The Nairobi photo story"
**One idea:** real photos of Nairobi tell the story, and a light layer drawn on top shows what Platinum does. A glowing glass tower labelled **"YOUR BUSINESS"** rises, lights up and attracts customers. The tower is an illustration, never a real building.

**Seven chapters** with the same timing as the demo. Each has one photo, one panel of copy, and **one visual per bullet**:

| Ch | Photo file | Light layer | Copy behaviour |
|---|---|---|---|
| 00 Hero | `nw` | warm light dots drift up | hero copy, unchanged |
| 01 Problem | `problem` (photo dimmed slightly) | white dots stream *past*; then per bullet: ① card "Search: 'dentist near me' / No website found for you" ② red rings + "3 missed calls / Nobody replied" ③ "AI: 'Try Other Clinic' / Your competitor wins" | the 3 pain-point bullets light up one at a time |
| 02 Websites | `aerial` | the tower rises; **each of 6 features lights 2 floors** and shows a label beside them | 6-item feature list (3.2), lit in turn |
| 03 WhatsApp | `trails` | dots turn green and pour into the tower; the crown and "YOUR BUSINESS" sign switch on; one card per automation | 4 automations (3.2), lit in turn |
| 04 AI visibility | `dusk` | a beam sweeps the skyline, then locks on the tower; an "AI TOP PICK · Your Business ★ 4.9" card; rings pulse from the base | the question **types itself out** in the panel; the answer appears with the lock; then 4 reason chips light in turn |
| 05 How it works | `kicc` | 3 numbered tiles appear beside the tower | 3 steps lit in turn |
| 06 Close | `kicc` | gold sparks rise from the roof | final CTA, unchanged |

**Linking rules** (the main point of this change):
- **One scroll position drives both the text and the visual.** As the reader scrolls, the active bullet gets the class `on` and earlier ones get `done` (green tick). Its visual appears at the same time. Don't use separate timers.
- **Desktop only:** a dashed leader line (SVG) from the active bullet to its visual, as in the demo's `drawLead`.
- **Phones:** show only the **active** visual, so cards never pile up. Keep every card inside the screen width and away from the "YOUR BUSINESS" sign (use the demo's mobile positions).

**Photos:**
- Cross-fade between chapters.
- Gentle zoom only: scale 1.02 → 1.07.
- Light filters only (the demo's `FILTER` values).
- Shade only behind the text panel (left side on desktop, bottom on phones). **Don't darken the whole photo.**
- Show a small photo credit per chapter (`Photo: Name / Unsplash`).
- Show a small note: "Real Nairobi photos · light effects and the glowing tower are illustrations".

### 3.2 Copy changes (add these to the content file, not to components)
- **Websites chapter:** intro line "Watch it go up, floor by floor:", then these features:
  - Mobile-friendly design
  - Fast on Kenyan data
  - Shows up on Google
  - Ready for AI search
  - WhatsApp click-to-chat
  - Google Maps + contact form

  Keep the price strip "Starter website · KSh 80,000".
- **WhatsApp chapter:**
  - **Missed call?** A WhatsApp reply in 30 seconds
  - **Appointment reminders** that cut no-shows
  - **Review requests** after every job
  - **Payment reminders** with an M-Pesa link

  Keep the price strip "Starter automations · KSh 30,000 setup".
- **AI chapter:**
  - question: "Who is the best dentist in Westlands?"
  - answer: "Top pick: **Your Business** ★ 4.9, open now, books on WhatsApp."
  - chips: Google Business Profile, Directory listings, Fresh reviews, FAQ + schema on your site

  Keep the price strip "AI Starter · KSh 25,000 setup".
- **How it works headline:** "Three steps to the brightest building on the street".
- **Example labels:** "Your Business", "★ 4.9", "Westlands dentist" and "KSh 2,500" are examples. Keep "(example)" on the M-Pesa card, and keep the draft note that example businesses aren't real.

### 3.3 Images
- Copy the 12 files from `docs/demo-v2/img/` to `public/images/nairobi/`.
- Serve the `-m` versions below 760 px wide, through `<picture>`/`srcset` or the loader logic in the demo.
- Load the hero photo first and the rest after first paint.
- Add the credits from `PHOTO-CREDITS.md` to the content file. Show them in the chapter credit and on an `/about` or footer "Photo credits" line.
- **Don't** replace, re-crop or add photos without asking me. **Don't** add any photo with identifiable faces or brand logos.

### 3.4 Layer changes (replace the Layer 1 and 2 text in original section 3.3)
- **Layer 1 (no JavaScript):** the seven chapters stack as normal sections. Each shows its photo (mobile size, `loading="lazy"` except the hero) above the copy, with all bullets visible. No canvas and no leader lines.
- **Layer 2** (no WebGL, Opera Mini, reduced motion, low memory, Save-Data, in-app browsers of WhatsApp, Facebook and Instagram): the photos cross-fade with CSS as you scroll, and the bullets still light up in turn using IntersectionObserver. There's no 3D tower; show a **static PNG of the lit tower** (render one from the demo, under 60 KB) over the photo instead.
- **Layer 3:** the full photo story from the demo.
- **Reduced motion:** no zoom, no flying cards, no beam sweep. The photos fade, bullets light instantly, and the tower is shown fully lit.

### 3.5 Performance budget (adds to original section 3.6)
- Photos on phones: **≤ 600 KB total**, with only the hero (≤ 60 KB) in the first load.
- three.js: home page only, loaded after first paint, **with no other 3D libraries**.
- Keep 60 fps on a mid-range Android, or drop to 30 fps rendering on phones.
- Pause rendering when the section is off-screen or the tab is hidden.

### 3.6 Analytics
- Use **Umami Cloud**, as I told you earlier: script loaded with `defer`, ID from `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, events tracked with `data-umami-event`.
- Add one event per chapter reached on the home page (`story-ch-01` … `story-ch-06`), so the monthly report shows how far people scroll.

## 4. What does NOT change
- All other pages, routes, the content-file structure, the forms, booking, map, SEO, schema, sitemap and Open Graph tags.
- The honesty fixes from the original prompt, the "To come" placeholders, and the brand theme file.
- The rules: ask before deleting, no secrets, licences listed, don't deploy, PowerShell commands with full paths.

## 5. Build order for this change (stop at each ⏸)
1. Step 0 plan. ⏸
2. Copy and images: add the copy to the content file, add the photos and credits, and build **Layer 1** for the home page. ⏸ Show me at 320 px and 1280 px.
3. **Layer 2** (CSS cross-fade + IntersectionObserver bullets + static tower).
4. **Layer 3** (the photo story with three.js), matching the demo, plus the reduced-motion and phone rules. ⏸ Show me screenshots of every chapter at 390 px and 1280 px, the Lighthouse mobile score for the home page, and the photo total in KB.
5. Remove the unused phone-story code **only after I say yes**.

## 6. Tests and summary
- **Tests:**
  - each chapter's bullet count matches its number of visuals
  - the active bullet and its visual change at the same scroll point
  - nothing renders off-screen at 320 px
  - the page works with JavaScript off
- **Update the README section** "Home page story": how to change a chapter's photo, copy, or the number of bullets and visuals.
- **Small commits.** Start each message with `story:`.
- **Final summary:**
  - what changed
  - what you tested
  - what you couldn't test
  - photo KB totals
  - any copy that still says "To come"
