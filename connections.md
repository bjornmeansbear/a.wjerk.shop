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

Slugs are NOT predictable from project names (`wjerk-precious-plastics` is 3P's
build research), and the `wjerk-` prefix is not a rule — 14 guessed variants
(`wjerk-chair-ness`, `wjerk-boombox`, `wjerk-grad-book-2021`…) all returned
nothing. Collect by hand or get a token.

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
