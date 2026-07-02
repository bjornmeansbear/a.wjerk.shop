# a.wjerk.shop — Low-Energy Portfolio Site Spec

**Status:** In progress — site is live at https://a.wjerk.shop/ (~858 KB total, system fonts, lazy loading already in place)
**Repo:** GitHub (existing)
**Stack:** Raw hand written HTML, CSS, JS + Cloudflare Pages hosting
**Last updated:** 2026-07-02

---

## 1. Purpose & Design Philosophy

Portfolio / design case study site for Wjerk, a climate design studio. The site must *demonstrate* the studio's argument, not just state it: sustainability, accessibility, and design quality as one system rather than competing constraints.

**Reference point:** [Low-Tech Magazine's solar site](https://solar.lowtechmagazine.com/) — radical page-weight reduction via dithered images, static generation, and making the constraint aesthetically legible.

**Core principle:** *Worst case is available, best case is default.* Many image variants exist at build time; any given visitor transfers only the smallest slice that serves them. Storage is nearly free energy-wise — **data transfer is what costs**. Optimize for bytes-over-the-wire per visit, not total assets on disk.

**Convergence thesis:** Low-energy and accessible architectures are the same architecture. Semantic HTML, text-first content, minimal JS, honest structure — lightest possible site *and* best screen-reader experience. Neither is a layer added later.

---

## 2. Decisions Made (and why)

| Decision | Rationale |
|---|---|
| **Dithered images for homepage tiles + big accent images on case study pages** | LTM-style Bayer/Floyd-Steinberg dithering gets 1600px images to ~30–100 KB. Aesthetic is on-brand (zine/brutalist, matches Wjerk's Boot Boyz Biz-adjacent store direction). Used where *mood* matters more than color fidelity. |
| **AVIF + `srcset` for actual project images** | Case studies need color-accurate work. AVIF at q45–50 ≈ 60–120 KB at 1600px (8–10× smaller than JPEG). `srcset` means phones pull ~800px/~30 KB variants; big files sit untouched unless requested. `<picture>` with WebP/JPEG fallback. |
| **Static prerender, zero/minimal JS** | `export const prerender = true` in SvelteKit → no server compute per request, no hydration payload. Any interactivity (e.g., dither→color toggle) is a plain `<a>` or a few lines of vanilla JS. |
| **Dark theme as default, light as opt-in** | True-black backgrounds save measurable energy on OLED (most phones). Respect `prefers-color-scheme` for the opt-out. |
| **System fonts** | Already in place. Zero webfont transfer. Keep it. |
| **Visible page-weight stat in footer** | LTM pattern. Makes the sustainability claim falsifiable and keeps future-me honest. Already present — make it per-page and accurate. |

---

## 3. Image Pipeline (build-time)

For each source image, generate:

1. **Dithered variant** (homepage tiles, accent images): limited palette, ordered or Floyd-Steinberg dither, PNG. Tools: `didder` CLI or ImageMagick `-ordered-dither o8x8,8`.
2. **AVIF ladder** (project images): e.g., 480 / 800 / 1200 / 1600px at q45–50.
3. **WebP fallback ladder** at same widths.
4. **JPEG fallback** (single mid-size) for ancient browsers.

Markup requirements:
- `<picture>` + `srcset` + `sizes` on all project images
- Explicit `width` / `height` attributes on every `<img>` (no CLS)
- `loading="lazy"` below the fold; `fetchpriority="high"` on the one LCP image per page
- Dither-first / full-color-on-demand pattern for accent imagery: full-color file only transfers on explicit user request

Delivery:
- Long-lived immutable cache headers via Cloudflare (hashed filenames)
- Consider `Save-Data` / `prefers-reduced-data` handling (see §4)

---

## 4. Adaptive Layers (user-preference media queries)

Let visitors' own settings drive page weight and presentation:

- **`prefers-reduced-data` / `Save-Data` header** → serve dithered variants only; suppress full-color option entirely
- **`prefers-color-scheme`** → dark (true black) default; light on request
- **`prefers-reduced-motion`** → no transitions/animation (there should be almost none anyway)
- **`prefers-contrast: more`** → bump muted tones from AA to AAA
- **`content-visibility: auto`** on below-fold sections → skip client-side render work

Implement as CSS custom-property layers so each preference swaps a small set of tokens rather than duplicating styles.

---

## 5. Accessibility Requirements (standing, not a final pass)

Minimum bar: **WCAG AA**, checked as decisions are made. Preferred references: [The A11y Project](https://www.a11yproject.com/), [WCAG](https://www.wcag.com/), [ADA web guidance](https://www.ada.gov/resources/web-guidance/).

- Semantic structure: one `<h1>` per page, honest heading hierarchy, `<main>`/`<nav>`/`<figure>`/`<figcaption>` landmarks
- Skip link; deliberately *designed* visible focus states (thick focus ring suits the brutalist aesthetic — make it a feature)
- **Compute contrast ratios — never eyeball.** Limited palette (3–4 colors) means every text/bg pair gets verified once. Muted/subtle tones are the likely failures; check those first.
- **Alt text is load-bearing:** dithered images are low-fidelity, so descriptions carry more meaning for *everyone*. Treat captions as content (LTM-style).
- Text-first case studies: lead with the argument, images as evidence. Page must read coherently with images blocked.
- Fully keyboard-navigable; works with JS disabled (progressive enhancement throughout)
- Touch targets ≥ 44px; mobile-first layout

---

## 6. Non-Goals

- **No JS framework runtime shipped to the client** — SvelteKit is a build tool here, not a client dependency
- **No analytics scripts / third-party embeds** — weight, privacy, and energy all say no
- **No webfonts** — system stack only
- **No image CDN service dependency** — variants generated at build, served static from Cloudflare Pages (keeps the pipeline inspectable and portable)
- **Not the merch store** — that's a separate FourthWall project; this site may link to it but doesn't share infrastructure

---

## 7. Acceptance Criteria

- [ ] Typical mobile case-study visit transfers ≤ ~150 KB of imagery
- [ ] Homepage total transfer under ~300 KB on first visit (target; measure and adjust)
- [ ] Every text/background pair passes WCAG AA (documented ratios)
- [ ] Site fully navigable by keyboard alone; skip link works
- [ ] Site reads coherently with images disabled and with JS disabled
- [ ] Zero CLS from images (all have explicit dimensions)
- [ ] Dark default renders true black; light mode honors `prefers-color-scheme: light`
- [ ] `prefers-reduced-data` visitors receive only dithered imagery
- [ ] Footer page-weight stat reflects actual per-page transfer
- [ ] Repeat visits transfer ~0 bytes of imagery (immutable cache verified)

---

## 8. Open Questions

- Dither style: ordered (Bayer — more LTM-signature, gridded) vs. Floyd-Steinberg (softer)? Per-image or one global choice? **(design call)**
- Palette for dithered images: pure B&W, or a limited Wjerk brand palette? **(design call)**
- Dither→color toggle mechanics: plain link to full image, or inline swap with a few lines of JS? **(build call — prefer the link if it feels okay)**
- Page-weight stat: hand-computed at build time, or measured? Build-time script preferred. **(build call)**
- Does `Save-Data` header handling need a Cloudflare Worker/Pages Function, or can it stay purely client-side via `prefers-reduced-data`? Note: a Function reintroduces per-request compute — weigh against benefit. **(build call)**

---

## 9. Background / Provenance

Thinking developed in conversation, July 2026. Sequence: started from admiration of Low-Tech Magazine's solar site → question of "smallest possible site with big portfolio images" → resolved via the *variants-exist-but-don't-transfer* model (srcset, lazy loading, dither-first) → split imagery strategy (dither for mood, AVIF for work) → recognition that low-energy and accessible design converge on the same semantic, text-first, minimal-JS architecture → adaptive layers driven by user-preference media queries so visitors' own settings determine weight.

The site is itself a Wjerk case study: the constraint made visible and made good-looking.
