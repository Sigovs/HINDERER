# Hinderer Motor Company — static site

Static HTML/CSS build of the approved Figma prototype
(`rVcU822PQHDphMoBEqrrGz`, frame `2:11 — index`). No build step, no framework —
vanilla HTML / CSS / JS. Serve with `npx serve .` or `python -m http.server`.

Full structure, the four-page scope ladder and the copy-a-page procedure are in
[README.md](README.md) — read it before adding a page or touching a variant.

---

## ⛔ Design DNA — read before any visual work

Before any design, layout, CSS, typography, colour or motion change here, read
and obey **`/Users/alex/Desktop/WORK/design_dna/TASTE.md`**.

It is the entry point: the two-tier model (invariants never yield, dialects yield
for a stated reason), the Design Read procedure, the Critique Panel, EXPLORE vs.
BUILD, and the dialect index. Skills load on demand from it —
`academic-composition`, `anti-patterns`, `spacing-taste`, `typography-taste`,
`color-taste`, `dimensionality`, `motion-judgment`, `motion-taste`.

Silent violations are the failure mode. Anything that breaks the DNA for a real
external constraint gets named in the report under *Known compromises*; close
calls under *Judgment calls*.

---

## Project-specific rules

- **[DS.html](DS.html) is the contract — read it before touching a component.**
  It is rendered by the site's own stylesheets, so it cannot drift: tokens,
  ramps, rhythm, motion, every component, the five rules a change has to keep,
  and an honest list of what the system does not have. If a change makes DS.html
  wrong, the change is not finished.
- **`index.html` is the sterile master.** Every new page is a copy of it, loading
  the same four stylesheets in the same order. The section blocks inside `<main>`
  are what gets replaced; the header, footer and lightbox are kept verbatim.
- **Tokens first.** Colour, type, space, radius and motion values live in
  [assets/css/tokens.css](assets/css/tokens.css). Below that file there is
  **no raw value at all** — no hex, no `rgb(31 29 25 / .5)`, no `37px`, no
  `line-height: 1.45`. Alpha comes from a channel token
  (`rgb(var(--bg-rgb) / 0.55)`), never from a new colour. A token nothing uses
  gets deleted, not kept for later.
- **Three voices, and the serif has exactly one role.** Oswald announces, Inter
  Tight informs, Playfair values — and Playfair appears on `.vehicle__price`
  and nowhere else. A section wanting a second rank under its title uses
  `.section-sub`, like every other section.
- `ASSETS DO NOT COPY TO GIT/` is the client hand-off folder and stays out of git.
