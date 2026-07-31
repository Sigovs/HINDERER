# Hinderer Motor Company — static site

Static HTML/CSS build of the approved Figma prototype
(`rVcU822PQHDphMoBEqrrGz`, frame `2:11 — index`).
No build step: open `index.html`, or serve the folder with any static server.

```
npx serve .          # or: python -m http.server
```

---

## The four pages

`index.html` is the faithful build of the approved Figma. The three numbered
pages are the plan's three scope levels, **cumulative** — each loads the layer
below it, so the diff between them is legible instead of buried in copy-paste.

| File | Layer | What it adds | Mandate |
|---|---|---|---|
| `index.html` | base | The Figma as approved, with invariant repairs only | REFRESH |
| `index1.html` | + `variant-a.css` | Stock search · engine/gearbox on the card · hours + directions · a real footer · trade-in photo committed · the cutout grounded · every gallery tile captioned · one decision per section | REFRESH |
| `index2.html` | + `variant-b.css` | **The spine.** One spec-plate system running through card → build options → trade-in → delivery, so identity no longer rests only on the photography. Build becomes the page's culmination with its own ground and the primary action | REFRESH |
| `index3.html` | + `variant-c.css` | **The rhythm rebuild.** One ground, three container languages instead of seven, one alignment rule, and the three consecutive 50/50 bands replaced by three different structures | **REDESIGN — needs the macro re-approved** |

Pick one, then the others get deleted along with the variant CSS they own.
Nothing in `tokens.css`, `main.css` or `main.js` is variant-specific.

The three pages are regenerated from `index.html` by
`tools/build-variants.mjs` — if `index.html` changes and you want the
variants to follow, re-run it rather than hand-editing three files.

## Tree

```
.
├─ index.html                  ← the master page. Copy this for every new page.
├─ assets/
│  ├─ css/
│  │  ├─ tokens.css            ← colour, type, space, radius, motion. Edit here first.
│  │  └─ main.css              ← layout + components, in the order the page uses them
│  ├─ js/
│  │  └─ main.js               ← header state, mobile nav, inventory rail, lightbox, reveal hook
│  ├─ img/                     ← photography exported from Figma
│  ├─ icons/                   ← SVG glyphs exported from Figma
│  ├─ video/                   ← .gitignored, see “Pending assets”
│  └─ fonts/                   ← self-hosted faces, if/when Degular is licensed
├─ .gitignore
└─ ASSETS DO NOT COPY TO GIT/  ← client hand-off folder, ignored by git
```

## Copying `index.html` for a new page

`index.html` is the sterile master. To make `inventory.html`, `build.html`, …:

1. Copy the file.
2. Keep everything between `<!-- SITE HEADER -->` and `</header>` verbatim; move
   `aria-current="page"` onto the nav item for that page.
3. Keep `<!-- SITE FOOTER -->` and the video-lightbox block verbatim.
4. Replace only the numbered `<section>` blocks inside `<main>`.
5. Update `<title>`, `<meta name="description">` and the `#main` heading.

Every section is self-contained and numbered in both `index.html` and
`main.css`, so a section can be lifted into another page without pulling
unrelated CSS with it.

## Rules the build holds to

- **No raw values.** Every colour, space, size, radius and duration comes from
  `tokens.css`. If a value is not on a scale, the scale gets a documented
  addition — it does not get a one-off number.
- **14px floor.** No text that carries information is set below `--text-xs`
  (0.875rem). The Figma's 13px card labels and its near-invisible step numerals
  are raised to the floor.
- **Contrast is measured, not assumed.** Ratios are recorded beside each ink
  token in `tokens.css`. Copper `#a86537` clears AA only as large text, so
  `--accent-ink` `#c8813f` (5.34:1) exists for anything under 24px.
- **Legibility over photography is fixed at the background layer** — scrims and
  gradients, never text shadows.
- **Reduced motion is a first-class path.** Content is only ever hidden by
  script, and only when motion is allowed; with JS off or motion suppressed the
  page is complete.
- **No horizontal page scroll at any width, including 320px.** Horizontal
  scrolling exists only inside the inventory rail.

## Pending assets

| What | Where it goes | Note |
|---|---|---|
| Gallery films ×2 | `assets/video/gallery-01.mp4`, `gallery-02.mp4` | Those two tiles currently render as plain captioned photographs. Put the paths back on `video:` in the `GAL` array in `tools/build-variants.mjs` and the play glyph and the lightbox return. A play affordance with no film behind it is a control that lies, so it is not offered until the films exist. |
| Real inventory | — | **All card copy is placeholder.** Titles, prices, mileage, engines and stock numbers stand in for the real feed; only the photograph is final, and it is the same photograph on all five cards. |
| `Degular` webfont | `assets/fonts/` | The licensed face the headlines were drawn in. Drop an `@font-face` block in and put it first in `--font-display`; no markup changes. |

## Video

`assets/video/_src/` holds the camera master and is gitignored. The two files
the page actually loads are encoded from it:

```
ffmpeg -i "_src/Who we are_.MOV" -map 0:v:0 -map 0:a:0 \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 25 -preset slow -r 30 \
  -vf scale=1920:-2 -c:a aac -b:a 128k -movflags +faststart about-us.mp4

ffmpeg -i "_src/Who we are_.MOV" -map 0:v:0 -map 0:a:0 \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -r 30 -vf scale=1600:-2 \
  -c:a libopus -b:a 96k about-us.webm
```

The master is 29 MB of 60 fps, 23 Mbit phone footage — fine as a master, not
as a web asset. `-movflags +faststart` is what lets playback begin before the
file has finished downloading, and `-map` drops the camera's metadata streams.

The poster is a still cut from the film itself:

```
ffmpeg -ss 5.2 -i "_src/Who we are_.MOV" -frames:v 1 -vf scale=1600:-2 -q:v 3 \
  ../img/whoweare-poster.jpg
```

5.2 s is the frame where the roadster is centred in front of the courthouse.
A poster taken from somewhere else misrepresents what pressing play will show.


## The pinned trade-in sequence (index3 only)

The four trade-in steps are a sequence in the content itself, so the stage
pins, the plates arrive one at a time, and the next section rides up over it.

It is switched on by `html.scrolly`, which `main.js` adds only when all three
hold: motion is allowed, the window is at least 62rem wide AND 780px tall, and
the script actually ran. Miss any one and the section renders exactly as it
does on index1 — nothing hidden, nothing lost.

Two things it is worth knowing before editing this:

- **Do not put `overflow: hidden` (or `clip`) on any ancestor of the stage.**
  A non-visible overflow makes that element the sticky containing block and
  the pin silently stops working. That is why `html`/`body` no longer carry
  an `overflow-x` guard and why the clip lives on `.trade__stage` rather than
  on `.trade`.
- **The reveal is driven by both a scroll listener and an IntersectionObserver.**
  One driver was not enough: some environments never deliver scroll events for
  programmatic scrolling. Both call the same idempotent paint.

Verified over the DevTools protocol with real wheel input at 1400×900:

```
p=0.03 → 0000     p=0.34 → 1110
p=0.20 → 1100     p=0.55 → 1111 + record + action
```

## Images

Every photograph was exported from Figma at 4096px and re-encoded for the web
(`sharp-cli`, JPEG q82, longest edge ≤1920). Originals are kept in `.orig/`,
which is not referenced by the page — delete the folder once you are happy.

`build-cobra.png` stays PNG because it is a cutout with a real alpha channel.
It is the only asset over 1 MB.

**This mattered, not just for weight:** the 14.5 MB Figma export of that cutout
did not decode reliably in Chrome and rendered as a fragment a few hundred
pixels wide. If an image ever appears mysteriously small, check its file size
first.

Next step when there is time: ship AVIF/WebP through `<picture>`. Every `<img>`
already carries explicit `width`/`height`, so adding sources will not shift
layout.
