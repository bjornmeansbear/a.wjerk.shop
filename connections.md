# Connections

Working file. Hand-collected map of what exists where, across the Wjerk
properties. Becomes `connections.json` once it's filled in — the build stamps
an "Elsewhere" block onto each page from it and checks the links still resolve.

The unit that connects things is the **concept**, not the project. A project
draws on concepts; a concept has a canonical tiddler, a research channel, and
maybe a lecture and an object.

Fill in what you know, leave `?` where you don't, delete rows that aren't real.

    ✓ = confirmed via API      ? = unknown        — = doesn't exist / n/a

---

## Are.na channels

Confirmed (block count, visibility, last touched):

| slug | blocks | vis | created | updated | role | about which concept? |
|---|---|---|---|---|---|---|
| `chair-ness` | 454 | closed | ? | 2026-08-27 | archive | semiotics |
| `3p-people-processing-plastic` | 124 | public | ? | 2026-07-25 | bibliography | circular materials |
| `wjerk-precious-plastics` | 115 | closed | 2019-06-25 | 2026-02-17 | sourcing | circular materials |
| `wjerk-grad-book-2020` | 340 | closed | 2020-04-17 | 2026-08-27 | working ⚠ | design education |
| `a-new-design-commons` | 93 | public | ? | 2026-06-03 | bibliography | the commons & the public domain |
| `bauerden` | 10 | closed | ? | 2026-08-18 | ? | ? |
| `spontaneous-lamp` | 6 | closed | ? | 2026-08-24 | moodboard? | circular materials |
| `cape-pure-content` | 29 | public | 2018-02-12 | 2023-05-16 | bibliography | open source / libre / F-LOS; circular materials; the commons & the public domain; speculative futures |
| `flosd-free-libre-open-design` | 874 | public | 2017-12-15 | 2026-08-27 | sourcing | open source / libre / F-LOS |
| `the-sustainabilitist` | 2957 | public | 2018-01-10 | 2026-08-16 | bibliography | sustainabilitist principles |
| `carbon-capture-sequester-whatever-reduce-carbon` | 137 | closed | 2019-06-25 | 2026-06-17 | bibliography? | climate |
| `libre-designer-book` | 119 | public | 2018-05-28 | 2026-08-05 | ? — "a later thing," relation to The Libre Designer still unresolved | ? |
| `adhocism-lls8uosznfq` | 4 | private | 2026-05-19 | 2026-08-20 | moodboard? (unconfirmed — matches Solarpunk Boombox's "Ad hocism as method" section) | speculative futures? |

role — what the channel is *for*, not what media it holds. A project can have
several, sequenced over time:

- `sourcing` — how the thing got built. Technical specs, suppliers, build
  videos. Answers "how do I make one." → links from the making section
- `bibliography` — the discourse around it. Related work, criticism, podcasts.
  → becomes a "further reading" block
- `archive` — visual reference library, big. → wants a projection or a gallery
- `working` — the design process itself: stakeholder notes, constraints,
  decisions, material research. Your best evidence — and the most likely to
  contain things that shouldn't be public. Default `publish: false`
- `moodboard` — thin, visual, pre-project. → probably stays unlinked

⚠ = contains material that needs a read-through before any public link.
`wjerk-grad-book-2020` holds candid quotes about MICA programs from 2020
stakeholder interviews. Good evidence, bad public link — lift the findings
into the case study prose instead.

`created` dates when the project actually started, independent of when it got
written up. Worth capturing — it's often better provenance than the prose.

### Visibility: keep them closed (decided 2026-08-27)

Are.na's three settings are not a libre spectrum:

- **open** — anyone can *add* blocks
- **closed** — anyone can *view*, only you add
- **private** — nobody can view

Libre is about reading, taking, and forking. `closed` already provides all
three — the `wjerk-precious-plastics` contents pull fine with no account and no
token. Switching a channel to `open` grants a reader zero new freedoms and
grants strangers write access to the research. That's an editorial decision, not
an access one, and the original reason for closing them stands: controlled
research, nothing appearing in it unnoticed.

Open source doesn't mean anyone can push to main.

Where the commitment actually applies:

- **`private` channels fail the principle** — they block reading. Audit for
  these; none of the seven found so far are private
- **Mirroring is the real libre move.** Are.na has no license field and could
  change terms or disappear. A local git mirror under CC BY-SA survives all of
  that. `~/Code/chair-ness` is the model. Depending on a vendor's permission
  model to carry a libre commitment is renting your principles — the same
  argument The Libre Designer makes about tools
- Each mirror is one command:
  `python3 ~/Code/chair-ness/scripts/fetch_arena.py --channel SLUG --out ~/Code/SLUG`

**Superseded 2026-08-27** — all 518 channels are now indexed in
`arena-inventory.md`, pulled with a token via `/v3/search?type=Channel&scope=my`.
No hand collection needed.

The prefixes turned out to be semantic, not decorative:

- `wjerk-` (40) — **client and studio work**, mostly private
- `lecture-` (26) · `workshop-` (1) — research behind a talk
- `shirt-` (8) — objects, mostly derived from lectures
- `project-` (21) — **class briefs from 2020–22**, not portfolio projects
- unprefixed — personal projects (`chair-ness`, `spontaneous-lamp`,
  `3p-people-processing-plastic`)

That's why guessing `wjerk-chair-ness` failed: the `wjerk-` namespace is for
client work, and the personal projects never took a prefix.

Note on the API: v2's authenticated endpoints return **410 Gone** — Are.na is
winding v2 down (are.na/editorial/on-our-api, May 2026). v3 works, `Authorization:
Bearer` only, spec at `~/Code/sentence-a-day/openapi`. Public channel reads still
need no auth at all.

Everything else — add rows as you go:

| slug | role | about which concept? |
|---|---|---|
|  |  |  |
|  |  |  |
|  |  |  |

Note: listing your own channels needs an Are.na personal access token
(are.na/settings/applications). Reading a channel by name doesn't. Make one and
this table can fill and verify itself.

---

## Case studies → concepts

Which ideas does each project actually rest on? Names can be rough — we'll
normalize them into one vocabulary after.

| case study | concepts | are.na | canonical tiddler | live |
|---|---|---|---|---|
| Chair-ness | semiotics | `chair-ness` ✓ (archive) | `Chair-ness.tid` | — |
| Solarpunk Boombox | speculative futures | `adhocism-lls8uosznfq`? (unconfirmed, private, 4 blocks) | — (nothing in wiki) | — |
| 3P: People Processing Plastic | circular materials | `wjerk-precious-plastics` ✓ (sourcing, 2019)<br>`3p-people-processing-plastic` ✓ (bibliography) | `3p_ People Processing Plastic.tid` | — |
| Spontaneous Lamp | circular materials | `spontaneous-lamp` ✓ (moodboard) | `Spontaneous Lamps.tid` | — |
| MICA Graduate Admissions | design education | `wjerk-grad-book-2020` ✓ (working, 2020) ⚠ don't link publicly — provenance only | — (nothing in wiki) | — |
| A Carbon Sequestering Book | climate | `carbon-capture-sequester-whatever-reduce-carbon` ✓ (bibliography?) | — (nothing in wiki) | — |
| Green Acres → EcoVention Europe | substrate & materiality | — (none found) | `Green Acres.tid` + `Ecovention Europe.tid` | — |
| The Sustainabilitist Principles | sustainabilitist principles | `the-sustainabilitist` ✓ (bibliography — "the principles in action," exemplars + further research) | `The Sustainabilitist Principles.tid` | `https://www.thesustainabilitist.com/` |
| The Libre Designer | open source / libre / F-LOS | `flosd-free-libre-open-design` ✓ (sourcing). `libre-designer-book` also related, role TBD. `a-new-design-commons` is a related but distinct concept ("the libre designer is the character, the new design commons is the studio") — see its own row above | none yet — the two dated "Libre Designer" tiddlers are July 2020 workshop-logistics notes, not the manifesto itself | — |
| CAPE | open source / libre / F-LOS; circular materials; the commons & the public domain; speculative futures | `cape-pure-content` ✓ (bibliography) | `CAPE.tid` (also `Content is King.tid`, `From Indesign to Pure Content.tid`) | — |
| Drawing on Tempered Glass | — (none obviously fits) | — (none found) | — (nothing in wiki) | — |
| Wjeather | substrate & materiality; open source / libre / F-LOS; semiotics | — (none found) | — (nothing in wiki) | `https://wjeather.wjerk.shop/` |

---

## Objects → concepts

Things at stuff.wjerk.shop. An object is an edge off a concept like any other,
but it's the only one that costs material, so it gets a gate:

**The wear test — would a stranger wear this if they'd never heard of Wjerk?**
Yes → it's a publication, the object carries the argument. No → it's a business
card you're charging for. Only the first kind gets made.

| object | status | concept | carries what | case study |
|---|---|---|---|---|
| Chair-ness patch | live | semiotics | the idealized form itself — a semiotic claim you can wear | Chair-ness ✓ linked |
| Spontaneous Lamp instructions | proposed | circular materials | how to build one, printed on the thing. CC BY-SA | Spontaneous Lamp |
| Sustainabilitist principle | proposed | sustainabilitist principles | one aphorism per shirt — they were book plates, print is native | Sustainabilitist Principles |
| 3P shirt | live | circular materials | the 3P logo on front, an abstract explanation of the process on back | 3P ✓ linked |
| 3P resin-code chart | maybe | circular materials | the codes themselves, or a shirt whose printing demonstrates the process | 3P |

role — what the object *does*:

- `instrument` — it's usable. The lamp instructions: wearing it makes you able
  to build the thing. The strongest kind
- `signal` — a position you can wear into a room. The chair-ness patch
- `edition` — a series from one concept. One principle per shirt

Ruled out (2026-08-27): Carbon Sequestering Book, MICA Admissions, Green Acres →
EcoVention, Drawing on Tempered Glass. Client work and speculation don't fit on
a body.

### Reciprocity

Every product links to its case study; every case study links its object with a line naming what it *is*, never a generic "shop" button. "The instructions, printed on a shirt" beats "Buy merch."

### The standing statement (store landing page, write once)

Not a sales pitch — the same register as `methodology.md`. What it says:

1. The object is the publication, not a souvenir of one
2. Everything else here is free and CC BY-SA — the thinking has no paywall.
   The shirt costs money because cotton costs cotton
3. It funds the free part
4. Print-on-demand, nothing made that nobody wanted — with the real cost
   (shipping, blank quality) disclosed alongside

Not to be used: "support an independent designer" (inert), "sustainable merch" (the most greenwashed phrase in retail, and the practice argues against it). Sustainability is the disclosure here, never the pitch — same as the page-weight number in the footer.

---

## Lectures & workshops → concepts

From `~/Code/lectureScripts/MENU.md`. Same question: what concept, what channel.

| # | title | concepts | are.na |
|---|---|---|---|
| W1 | Make It Mean Something | ? | ? |
| W2 | Drawdown Diptychs | ? | ? |
| W3 | The Libre Designer | ? | ? |
| W4 | The Sustainabilitist Principles | ? | ? |
| W5 | Design the Future Today | ? | ? |
| W6 | Structured Creativity | ? | ? |
| W7 | Form, Content, Context | ? | ? |
| W8 | Spontaneous Lamp | ? | `spontaneous-lamp`? |
| L9 | What Is Sustainable Graphic Design? | ? | ? |
| L10 | A New Design Commons | ? | `a-new-design-commons` ✓ |
| L11 | Climate Design | ? | ? |
| L12 | These Gestures Are Undoubtedly Utopian | ? | ? |
| L13 | Signs Signaling on Substrates | ? | ? |
| L14 | BauErden | ? | `bauerden` ✓ |
| L15 | Being Professional? | ? | ? |
| L16 | Design Thinking, and What's Wrong With It | ? | ? |
| L17 | Ethnographic Research for Designers | ? | ? |

---

## Concept vocabulary

**Settled 2026-09-14.** Every candidate below ended up with a real case study
or object attached to it while filling in the tables above — none unused, none
needed adding. Nine terms, within the eight-to-twelve target:

- open source / libre / F-LOS — The Libre Designer, CAPE
- the commons & the public domain — CAPE, and *A New Design Commons* as its
  own related-but-distinct idea off The Libre Designer
- circular materials — 3P, Spontaneous Lamp, CAPE
- substrate & materiality — Green Acres → Ecovention Europe, Wjeather
- semiotics — Chair-ness, Wjeather
- speculative futures — Solarpunk Boombox, CAPE
- sustainabilitist principles — The Sustainabilitist Principles
- design education — MICA Graduate Admissions
- climate — A Carbon Sequestering Book

Not every project rests on exactly one — CAPE alone touches four. That's fine;
the model was always many-to-many.

Still open, deferred (not on the critical path for the Elsewhere block):
`NewDesignCommons` (27 tiddlers) vs `NDC00` (24) tag collision in the wiki —
same idea, two tags, needs a wiki-side merge, not a connections.md decision.
