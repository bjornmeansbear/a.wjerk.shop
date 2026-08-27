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
| `chair-ness` | 454 | closed | ? | 2026-08-27 | archive | ? |
| `3p-people-processing-plastic` | 124 | public | ? | 2026-07-25 | bibliography | ? |
| `wjerk-precious-plastics` | 115 | closed | 2019-06-25 | 2026-02-17 | sourcing | ? |
| `wjerk-grad-book-2020` | 340 | closed | 2020-04-17 | 2026-08-27 | working ⚠ | ? |
| `a-new-design-commons` | 93 | public | ? | 2026-06-03 | ? | ? |
| `bauerden` | 10 | closed | ? | 2026-08-18 | ? | ? |
| `spontaneous-lamp` | 6 | closed | ? | 2026-08-24 | moodboard? | ? |

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

| case study | concepts | are.na | canonical tiddler |
|---|---|---|---|
| Chair-ness | ? | `chair-ness` ✓ | ? |
| Solarpunk Boombox | ? | ? | — (nothing in wiki) |
| 3P: People Processing Plastic | ? | `wjerk-precious-plastics` ✓ (sourcing, 2019)<br>`3p-people-processing-plastic` ✓ (bibliography) | ? |
| Spontaneous Lamp | ? | `spontaneous-lamp` ✓ | ? |
| MICA Graduate Admissions | ? | `wjerk-grad-book-2020` ✓ (working, 2020) ⚠ don't link | ? |
| A Carbon Sequestering Book | ? | ? | — (nothing in wiki) |
| Green Acres → EcoVention Europe | ? | ? | ? |
| The Sustainabilitist Principles | ? | ? | ? |
| The Libre Designer | ? | `a-new-design-commons`? | ? (2-way fork, see audit) |
| Drawing on Tempered Glass | ? | ? | — (nothing in wiki) |

---

## Objects → concepts

Things at stuff.wjerk.shop. An object is an edge off a concept like any other,
but it's the only one that costs material, so it gets a gate:

**The wear test — would a stranger wear this if they'd never heard of Wjerk?**
Yes → it's a publication, the object carries the argument. No → it's a business
card you're charging for. Only the first kind gets made.

| object | status | concept | carries what | case study |
|---|---|---|---|---|
| Chair-ness patch | live | ? | the idealized form itself — a semiotic claim you can wear | Chair-ness ✓ linked |
| Spontaneous Lamp instructions | proposed | ? | how to build one, printed on the thing. CC BY-SA | Spontaneous Lamp |
| Sustainabilitist principle | proposed | ? | one aphorism per shirt — they were book plates, print is native | Sustainabilitist Principles |
| 3P resin-code chart | maybe | ? | the codes themselves, or a shirt whose printing demonstrates the process | 3P |

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

The list to normalize toward, once the columns above are populated. Keep it
short — eight to twelve. Candidates from existing tiddler tags and repeated
themes, none of them decided:

- open source / libre / F-LOS
- the commons & the public domain
- circular materials
- substrate & materiality
- semiotics
- speculative futures
- sustainabilitist principles
- design education
- climate

Existing tag collisions to resolve while you're in there:
`NewDesignCommons` (27 tiddlers) vs `NDC00` (24) — same idea, two tags.
