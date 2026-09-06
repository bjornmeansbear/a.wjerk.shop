# Updating the chair-ness projection

`chairness-projection.html` is **generated** by another repo. Do not edit it
here — the next build overwrites it.

Source: `~/Code/chair-ness` (private, github.com/bjornmeansbear/chair-ness)

This page is the **deck** build: one slide at a time, cross-faded, chairs and
quotes interleaved in a single sequence. The repo can also build an *ambient*
version — chairs hard-cutting underneath with quote panels surfacing over the
top — which is what this page used to be. The deck reads calmer; the ambient
one was too much. See "The ambient alternative" below if you want it back.

## The whole update

```sh
cd ~/Code/chair-ness
python3 scripts/fetch_arena.py                    # pull new blocks from are.na
python3 scripts/fetch_vitra_detail.py             # museum metadata + captions
python3 scripts/build_slideshow.py --hotlink \
  --home-url case-study-chairness.html
cp slideshow-web.html ~/Code/a.wjerk.shop/chairness-projection.html
```

Then commit here as usual. `build.sh` copies every root `.html` into the
deploy, so nothing in the build needs changing.

Skip the two fetches if you have not added anything to are.na since last time.

## Why the flags matter

- `--hotlink` points the images at the are.na-hosted originals instead of
  local files. Without it the page references `images/…` paths that do not
  exist on this site, and every slide is blank.
- `--home-url case-study-chairness.html` adds the "← Chair-ness" link back to
  the case study. Without it the page is a dead end.

Note there is no `--ambient` here. That flag is what picks the other mode.

## What the file contains

Self-contained: six OFL typefaces are base64-embedded, and the images are
fetched from are.na at view time. **No `fonts/` folder or image directory is
needed in this repo** — the single HTML file is the whole deployment.

About 375 KB of markup, pulling roughly **33 MB** of images from are.na
(measured 2026-09-06 with a browser `Accept`, so WebP where are.na offers it).

Of that, **11 MB is two animated GIFs**. are.na's resizer only handles still
images — a GIF block's `image_url` falls through to the unresized original on
`d2w9rnfcy7mm78.cloudfront.net`, so two files carry a third of the page while
the other 300 average 73 KB each. Worth knowing before adding more GIFs: each
one costs roughly what seventy photographs cost.

Note that `page-weight.js` does not follow external URLs, so the footer reports
this page at **188 KB** — its own markup — and not the images. That understates
the real transfer by roughly 33 MB. Worth knowing if the transparency line ever
gets audited.

Almost all of that 188 KB is the six embedded typefaces: 219 KB of base64 is
~160 KB of woff2, and woff2 is already compressed, so it does not shrink again
in transit. The markup around it is a few KB. `--no-embed-fonts` is the lever
if that number ever needs to come down — the page then needs the fonts served
alongside it, which is why the deployment is a single file today.

## Adding chairs

Save images into the are.na channel as **Image blocks, not Link blocks**. A
Link block only ever yields a screenshot of the page, which is useless here.
Give each one a title; the caption comes from the block's title and
description, so nothing needs editing in the chair-ness repo.

Images saved straight off a `collection.design-museum.de` object page are
captioned automatically from the museum's own record — save it and leave the
title alone.

## Tuning

```sh
--image-seconds 4.5         # faster chair changes (default 5)
--text-max-seconds 12       # shorter dwell on long quotes (default 16)
--text-min-seconds 5        # shorter floor on short quotes (default 6)
--images-per-quote 4        # quotes come round more often (default 5)
```

Chairs hold a flat `--image-seconds` each. Quotes are timed by length instead —
a base beat plus reading time, clamped between `--text-min-seconds` and
`--text-max-seconds` — so a long passage is not rushed and a short one does not
strand.

`python3 scripts/pacing.py` in the chair-ness repo reports how long a loop runs
and whether images have to repeat to fit every quote.

## The ambient alternative

The other mode, if this one ever wants replacing:

```sh
python3 scripts/build_slideshow.py --ambient --hotlink \
  --home-url case-study-chairness.html
cp slideshow-ambient-web.html ~/Code/a.wjerk.shop/chairness-projection.html
```

Its own knobs: `--image-ms` (chair cut, default 600), `--chairs-between-text`
(default 7), `--max-tilt` (card rotation, default 7).
