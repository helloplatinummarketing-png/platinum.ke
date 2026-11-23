# Platinum Marketing Agency: Kenya website

Websites, WhatsApp automations and AI visibility for Kenyan service businesses.
Built with Next.js, Tailwind and three.js (home page only). Hosted on Vercel.

> The full README (editing content, brand colours, deploying) comes in build step 6.

## Run it on your computer

```powershell
cd C:\Dev\platinum-ke
npm install          # first time only
npm run dev          # then open http://localhost:3000
```

To test the real (production) build: `npm run build`, then `npm start`.
Run all tests: `npm run build`, then `npm test`.

## Home page story

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
