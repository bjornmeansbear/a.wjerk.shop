# a.wjerk.shop — Energy & Carbon Methodology

How this site's footer stats and offset ledger are calculated, what the
assumptions are, and where the numbers come from. Written down so the claims
stay falsifiable and future-me stays honest.

**Last updated:** 2026-07-02

---

## 1. Page weight

Computed at build time by `scripts/page-weight.js` (post-build pass, output
in `build/page-weight-manifest.json`).

**What "weight" means here:** estimated *transfer* size of a typical
default-path visit — brotli-compressed text assets + raw binary sizes, one
srcset candidate per image chosen for an 800px viewport (mobile-first),
lazy-loaded images included (a full read of the page, not just the fold).

**What it doesn't capture:** HTTP header overhead, third-party requests
(there are none by design), variance in CDN compression level, and visitors
who tap through to full-color images (opt-in weight, deliberately excluded
from the default number).

---

## 2. Bytes → energy

Model: **Sustainable Web Design (SWD)** family — energy per GB transferred,
apportioned across data center, network, and end-user device.

Published coefficients range roughly **0.05–0.8 kWh/GB** depending on model
boundary and vintage; newer, tighter models trend low.

**Coefficient used here: 0.1 kWh/GB** — a defensible middle-low value.
This is an *assumption*, stated openly, not a measurement. If the SWD model
updates (v4+ apportions differently), update this number and note the change
below in the changelog.

Worked example at current scale:

```
858 KB/visit × 1,000 visits/mo ≈ 0.86 GB/mo
0.86 GB × 0.1 kWh/GB          ≈ 86 Wh/mo
iPhone battery ≈ 15 Wh        → ≈ 6 phone charges per month
```

The footer stat's plain-language equivalent ("serving this site for a month
≈ charging a phone six times") derives from this chain.

---

## 3. Energy → carbon (the offset ledger)

```
monthly gCO₂ = GB transferred (Cloudflare analytics)
             × kWh/GB coefficient (0.1)
             × grid carbon intensity (gCO₂/kWh)
```

- **Grid intensity:** use regional live/annual data from electricityMap
  (or similar). US average ≈ 370 gCO₂/kWh as a fallback. The honest choice
  is a *consumption-weighted guess about where visitors are*, which is
  unknowable precisely — state the number used and move on.
- Track cumulatively; offset the running balance until the solar server
  exists (§5).

---

## 4. What Cloudflare already covers (and what it doesn't)

Cloudflare commits to matching 100% of its global energy use with renewable
energy purchases, and Pages sites carry Green Web Foundation certification.

**The asterisk:** this is *annual matching via Energy Attribute
Certificates* (RECs and equivalents), not 24/7 carbon-free power. Some hours
in some locations still run on fossil grids; Cloudflare's own CTO has
acknowledged not all of their ~200+ data center locations physically use
renewable power. Matching ≠ zero-carbon electrons.

Sources:
- Cloudflare: "Committed to Building a Greener Internet"
  (blog.cloudflare.com/cloudflare-committed-to-building-a-greener-internet/)
- Cloudflare Impact page (cloudflare.com/impact/)
- Data Center Knowledge analysis of the REC-based approach
  (datacenterknowledge.com, "Will Cloudflare's Zero-Carbon Pledge Make a
  Real Impact?")
- SDxCentral interview with Cloudflare CTO John Graham-Cumming
  (sdxcentral.com, "Cloudflare Sets Sights On Carbon-Free Legacy")

**Accounting decision for this ledger:** treat the data-center share as
*accounted for* by Cloudflare's matching, but keep **network transit and
visitor devices** fully on our side of the ledger. Under SWD-style
apportionment those are the majority of transfer energy anyway, so this
barely reduces our number — which is the honest direction to err.

---

## 5. The solar server endgame

Target: self-hosted static site on solar, à la Low-Tech Magazine
(solar.lowtechmagazine.com — runs an entire magazine on a ~50 W panel).

Key finding from the math: at ~86 Wh/mo of transfer energy, the panel is
trivial (1–2 W of generation covers it). **The real cost is idle draw** —
a Raspberry Pi at 2–3 W continuous ≈ 1.5–2.2 kWh/mo, i.e. ~20–25× the
transfer energy. For a small static site, the always-on hardware dominates,
not the traffic.

Design implications for the eventual build:
- Optimize for idle watts first (SBC choice, disable radios, spin-down)
- Battery sized for uptime tolerance, not traffic (LTM accepts downtime as
  part of the design — worth considering as an honest, legible constraint)
- Until then: Cloudflare Pages + the §3 ledger + purchased offsets is the
  bridge

---

## Changelog

- **2026-07-02** — Initial methodology. Coefficient 0.1 kWh/GB; US-average
  grid intensity fallback 370 gCO₂/kWh; Cloudflare data-center share treated
  as matched, transit + devices kept on our ledger.
