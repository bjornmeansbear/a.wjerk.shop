# Updating the chair-ness projection

`chairness-projection.html` is **generated** by another repo. Do not edit it
here — the next build overwrites it.

Source: `~/Code/chair-ness` (private, github.com/bjornmeansbear/chair-ness)

## The whole update

```sh
cd ~/Code/chair-ness
python3 scripts/fetch_arena.py                    # pull new blocks from are.na
python3 scripts/fetch_vitra_detail.py             # museum metadata + captions
python3 scripts/build_slideshow.py --ambient --hotlink \
  --home-url case-study-chairness.html
cp slideshow-ambient-web.html ~/Code/a.wjerk.shop/chairness-projection.html
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

## What the file contains

Self-contained: six OFL typefaces are base64-embedded, and the images are
fetched from are.na at view time. **No `fonts/` folder or image directory is
needed in this repo** — the single HTML file is the whole deployment.

About 320 KB of markup, pulling roughly 12 MB of images from are.na.

Note that `page-weight.js` does not follow external URLs, so the footer will
report this page at around 14 KB — its compressed markup — and not the images.
That understates it by a lot. Worth knowing if the transparency line ever gets
audited.

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
--image-ms 900              # slower chair cuts (default 600)
--chairs-between-text 5     # more frequent quotes (default 7)
--max-tilt 4                # calmer card rotation (default 7)
--text-max-seconds 12       # shorter dwell on long quotes (default 16)
```

`python3 scripts/pacing.py` in the chair-ness repo reports how long a loop runs
and whether images have to repeat to fit every quote.
