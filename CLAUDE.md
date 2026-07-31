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

- **`index.html` is the sterile master.** Every new page is a copy of it. The
  three numbered pages are cumulative scope layers (`variant-a/b/c.css`) —
  regenerate them with `node tools/build-variants.mjs`, never hand-edit three
  files.
- **Tokens first.** Colour, type, space, radius and motion values live in
  [assets/css/tokens.css](assets/css/tokens.css). No magic numbers in
  `main.css`; nothing variant-specific in `tokens.css`, `main.css` or `main.js`.
- **`index3.html` is a REDESIGN** — its macro needs re-approval before it ships.
  `index.html`, `index1.html`, `index2.html` are REFRESH mandate.
- `ASSETS DO NOT COPY TO GIT/` is the client hand-off folder and stays out of git.
