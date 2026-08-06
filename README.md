# Hinderer Motor Company — static site

Static HTML/CSS build of the approved Figma prototype
(`rVcU822PQHDphMoBEqrrGz`, frame `2:11 — index`).
No build step: open `index.html`, or serve the folder with any static server.

```
npx serve .          # or: python -m http.server
```

---

## Pages

| File | What it is |
|---|---|
| `index.html` | The home page, and the master every other page is copied from |
| `inventory.html` | The search-results page — facets, sort, twelve cards, empty state |
| `vehicle.html` | The detail page — gallery, spec panel, tabs, enquiry form |
| `build.html` | The configurator — nine option groups, running quotation, estimate form |
| `who_we_are_team.html` | The company page — the story the home page carried in `#about`, and the founder's film behind a facade rather than an embed |
| `DS.html` | **The design system, rendered by the site's own stylesheets.** Tokens, ramps, rhythm, motion and every component, plus the rules a change has to keep and an honest list of what the system does not have yet. `noindex`. Read it before adding a page. |

The three numbered scope-ladder pages (`index1–3`) and the `variant-a/b/c.css`
layers they loaded were the exploration that produced the current build. The
direction is chosen, so they are gone — along with `tools/build-variants.mjs`,
which existed only to regenerate them, and the pinned trade-in sequence in
`main.js`, whose CSS lived in `variant-c.css` and whose only markup hook was on
`index3.html`. The remaining pages are the real site.

## Tree

```
.
├─ index.html                  ← the master page. Copy this for every new page.
├─ DS.html                     ← the design system, live. noindex.
├─ assets/
│  ├─ css/                     ← loaded in this order, always:
│  │  ├─ tokens.css            ← 1. every value in the system. Edit here first.
│  │  ├─ system.css            ← 2. reset, layout primitives, a11y utilities
│  │  ├─ main.css              ← 3. components, in the order the page uses them
│  │  ├─ display-oswald.css    ← 4. the display voice, applied last
│  │  └─ ds.css                ← dresses DS.html only. No token, no site component.
│  ├─ js/
│  │  └─ main.js               ← header state, mobile nav, inventory rail, filters,
│  │                             saved counter, reviews carousel, lightbox, reveals
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
5. Put `section--below-header` on the FIRST section. The header is fixed, so
   without it the page opens 84px underneath its own navigation. Only the home
   page is exempt, because the hero carries its own clearance.
6. Drop the hero `preload` links unless the new page has a hero of its own.
7. Make the nav's in-page anchors absolute (`index.html#build`), and move
   `aria-current="page"` onto this page's nav item.
8. Update `<title>`, `<meta name="description">` and the `#main` heading.

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
| Gallery films ×2 | `assets/video/gallery-01.mp4`, `gallery-02.mp4` | Those two tiles render as plain photographs. The lightbox is built and wired; a play affordance with no film behind it is a control that lies, so it is not offered until the films exist. |
| Real inventory | — | **All card copy is placeholder.** Titles, prices, mileage and stock numbers stand in for the real feed, and one photograph stands in for all eight cards. |
| Compressed section images | `assets/img/` | `Nationwide White Glove Delivery.jpg` (2.0 MB) and `Finance Center Get Pre-Approved.png` (1.7 MB) ship uncompressed. |
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
