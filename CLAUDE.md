# CLAUDE.md

Guidance for Claude Code working in this repo. For what the site *is* and how it
builds, read `README` first, then `SPEC.md` (aspirational, not current) and
`methodology.md` (how the footer stats are calculated).

This file is for facts that cost a session to rediscover.

## Are.na API

The site links out to Are.na research channels, and `connections.md` /
`arena-inventory.md` track them. Everything below was established 2026-08-27.

**Use v3. v2 is being wound down.** Every authenticated v2 endpoint now returns
`410 Gone` ("Please migrate to the v3 API" — see are.na/editorial/on-our-api,
May 2026). Public v2 reads still work today but should not be relied on.

**Auth:** `Authorization: Bearer $ARENA_ACCESS_TOKEN`, from `.env` (gitignored,
line 2 — never commit it, never echo the value). `X-AUTH-TOKEN` and
`?access_token=` both return 401. Kristian's user id is **7771**.

**Spec:** `~/Code/sentence-a-day/openapi` — OpenAPI 3.1 YAML, 41 paths. Parse it
with `yaml.safe_load`; don't guess endpoints, and don't copy it into this repo
(there was a stray untracked copy here, removed 2026-08-27).

**Public reads need no auth at all:**

```
GET /v3/channels/{slug}
GET /v3/channels/{slug}/contents?per=100&page=N
```

A `closed` channel is publicly readable — closed only means others can't *add*
to it. Only `private` blocks reading. See `connections.md` for why closed is the
right default rather than a libre failure.

**Listing your own channels — the non-obvious one.** There is no
`/v3/users/{id}/channels`; that path 404s, and `/v3/channels` is POST-only.
Use search:

```
GET /v3/search?query=*&type=Channel&scope=my&per=100&page=N
```

Paginate on `meta.next_page`. Returns 518 channels as of 2026-08-27
(231 closed / 173 public / 114 private). Each result carries
`counts: {blocks, channels, contents, collaborators}` — search results do *not*
include a `length` field, so read block counts from `counts.contents`.

**Slug prefixes are semantic**, not decorative:

| prefix | n | meaning |
|---|---|---|
| `wjerk-` | 40 | client and studio work, mostly private |
| `lecture-` | 26 | research behind a talk |
| `shirt-` | 8 | shirt designs, mostly derived from lectures |
| `project-` | 21 | **class briefs 2020–22**, not portfolio projects |
| `mm-` | 43 | numbered series |
| (none) | 367 | personal projects + everything pre-convention |

Personal projects never took a prefix — `chair-ness`, `spontaneous-lamp`,
`3p-people-processing-plastic`. Guessing `wjerk-chair-ness` will fail.

**Mirroring:** `python3 ~/Code/chair-ness/scripts/fetch_arena.py --channel SLUG
--out ~/Code/SLUG`. Already parameterized, no edits needed. ⚠ It calls **v2**
public endpoints — still working, but it will need migrating to v3 when those go.

**In-page links** carry `data-arena="slug"` (see `case-study-3p.html`) as the
hook for a future build-time verifier that checks the channel still resolves and
stamps its block count, the way `page-weight.js` stamps `%PAGE_WEIGHT%`. Not
built yet — don't put `%ARENA:...%` tokens in source until it is, or they'll
ship literally.

## Related repos

- `~/Code/sentence-a-day` — TiddlyWiki source for bjornpaedia.wjerk.shop; also
  holds the Are.na openapi spec
- `~/Code/bjornpaedia` — the published static export (deploy target, not source)
- `~/Code/lectureScripts` — 17 lectures and workshops, unpublished
- `~/Code/chair-ness` — Are.na mirror + the projection slideshow source
