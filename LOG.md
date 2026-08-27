# Running log

A working record of what's been asked, tried, and decided on this site, so
future sessions don't have to rediscover context. Same convention as
`~/Code/chair-ness/LOG.md`.

**Where things go:** durable facts that would otherwise cost a session to
rediscover (API auth, endpoint shapes, naming conventions) belong in
`CLAUDE.md`. Decisions and models belong in `connections.md`. *Progress* —
what's done, what's next — belongs here.

## 2026-08-27

**Asked:** How to interconnect and publish the writing, research, lectures, and
workshops that go with the case studies, when some lives here, some on
bjornpaedia, some in Are.na, some in git repos. Then: should each project get a
shirt, and what are the actual reasons to send people to the store.

**Found:**

- Five content types with different lifecycles and no shared address system.
  The rule that resolves most of it — *one canonical home per piece, everything
  else links* — was already written in `lectureScripts/README.md` and just
  needed extending across properties.
- **The connecting unit is the concept, not the project.** Case studies,
  channels, tiddlers, lectures, and objects are all places a concept shows up.
  This is the same idea as the 2026-07-23 atomic-tiddler note in the SAD README,
  one level up.
- **`~/Code/lectureScripts` is the biggest unrealized asset** — 17 lectures and
  workshops with a finished pitch document (`MENU.md`) published nowhere.
- **bjornpaedia doesn't need filling, it needs a canon.** 1,496 content
  tiddlers, 0 marked canonical, 17 near-duplicate clusters covering 30 tiddlers
  — and the duplication is concentrated in four *lecture* clusters
  (New Design Commons: 10 tiddlers/11,360w; Utopian Gestures: 4; Libre Designer:
  3 — a genuine two-way fork, not a draft pile; Utah Workshop: 3). Everything
  else is two-tiddler pairs.
- **The 314 tiddler tags are a type system, not a topic system** (`Source`,
  `Definition`, `Quote`, `Journal`). There's no topical vocabulary to link on,
  so the concept list has to be written rather than extracted.
- **Are.na: 518 channels** (231 closed / 173 public / 114 private), v2
  authenticated endpoints are `410 Gone`, enumeration is via
  `/v3/search?scope=my`. Full details in `CLAUDE.md`, full index in
  `arena-inventory.md`.
- **Channels have roles, and role decides placement** — `sourcing` goes in the
  making section, `bibliography` at the foot, `archive` behind a projection,
  `working` nowhere public. 3P has two channels doing different jobs; the MICA
  grad book channel holds candid stakeholder quotes and shouldn't be linked.
- **`shirt-` channels already exist and map to lectures, not case studies.**
  Eight of them. The store's catalog logic is half-built in the filing system.
- **`closed` is not a libre failure** — closed channels are publicly readable;
  only `private` blocks reading. Reasoning recorded in `connections.md`.

**Did:**

- Swept "Taken from Bruce Mau" → "Evolved from" across 12 files including the
  template.
- `case-study-3p.html` is now the reference implementation: both Are.na channels
  placed by role, inline in the prose rather than in an appendix block, each
  carrying `data-arena` for a future build-time verifier.
- Wrote `connections.md` (the model), `arena-inventory.md` (all 518 channels),
  `CLAUDE.md` (API facts).
- Wrote `~/Code/sentence-a-day/sad2021tw/scripts/canonical-audit.py` — clusters
  near-duplicate tiddler titles so survivors can be picked in one pass.
- Removed a stray untracked copy of the Are.na openapi spec from this repo;
  canonical copy stays at `~/Code/sentence-a-day/openapi`.

**Open, roughly in priority order:**

1. **Fill `role` + `concept` in `arena-inventory.md`** — only ~35 channels need
   it. Start with the 8 `shirt-` and 26 `lecture-` ones; that's the live thread.
   The 21 `project-` class briefs and most private `wjerk-` client channels can
   be marked and skipped.
2. **Pick canonical survivors for the four lecture clusters**, add
   `canonical: true`, then filter `--build static` on that field. Until this
   happens, nothing here can link at a stable bjornpaedia address.
3. **Build the `data-arena` verifier into `build.sh`** — fail the build on a
   dead channel, stamp block counts the way `page-weight.js` stamps
   `%PAGE_WEIGHT%`. Until then, no `%ARENA:...%` tokens in source.
4. **Publish lectureScripts** as `teaching.html` here (not a new subdomain).
5. Roll the 3P link pattern out to the other case studies.
6. `wjerk.shop` + `www` → 301 to `a.wjerk.shop` (Cloudflare dashboard; the `a.`
   pun is deliberate, don't move the site to the apex).
7. Three projects have nothing in the wiki at all: Solarpunk Boombox, Drawing on
   Tempered Glass, Carbon Sequestering Book. The last one's origin story — the
   conversations that fed into Climate Designers forming — is a tiddler waiting
   to happen.
8. `fetch_arena.py` still calls v2 public endpoints; migrate before they go.
9. Audit for `private` channels that should be `closed`.

**Also pending:** a proposed addition to the bjorn-voice skill — the
"name what's in it, why it exists, link it, link what came of it" pattern from
the Chair-ness projection paragraph, which is what the 3P paragraphs were
written against.
