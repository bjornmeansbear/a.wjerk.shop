#!/bin/sh
# WJERK BUILD SCRIPT
# Purpose: assemble the static site into build/ (source stays untouched),
#          fill the image list, stamp the footer year and
#          %PAGE_WEIGHT%/%SITE_WEIGHT% tokens.
# Usage: sh build.sh
#
# Cloudflare Pages project settings: build command `sh build.sh`,
# build output directory `build`, root directory `/`.

set -e
cd "$(dirname "$0")"

BUILD_DIR="build"
CURRENT_YEAR=$(date +%Y)

# ============================================================================
# STEP 1: Fresh build/ directory
# ============================================================================
rm -rf "$BUILD_DIR"
mkdir "$BUILD_DIR"

# ============================================================================
# STEP 2: Copy deployable files into build/
# ============================================================================
# case-study-template.html has unresolved {{TOKENS}} — it's a source template
# for generate-case-studies.sh, not a page to deploy.
cp *.html "$BUILD_DIR"/
rm "$BUILD_DIR/case-study-template.html"
cp style.css "$BUILD_DIR"/
cp _headers "$BUILD_DIR"/
cp favicon.ico apple-touch-icon.png "$BUILD_DIR"/
cp -R i "$BUILD_DIR"/

# ============================================================================
# STEP 2a: Fill images.html with a text list of every image file and its
# size, largest first (the %IMAGE_INDEX% token). Runs here because it needs
# the copied pages to see which page uses which image, and has to finish
# before the footer step: images.html carries a %FOOTER% token like the case
# studies do.
# ============================================================================
node image-index.js "$BUILD_DIR"

# ============================================================================
# STEP 2b: Inject the shared case-study footer (_partials/footer.html) in place
# of each page's literal %FOOTER% token. Must run before the year stamp and
# page-weight.js — the partial contains tokens those steps fill in. Fails the
# build if a case-study page is missing the token.
# ============================================================================
node inject-footer.js "$BUILD_DIR"

# ============================================================================
# STEP 3: Stamp current year into build/ footers
# ============================================================================
for f in "$BUILD_DIR"/*.html; do
  # No `sed -i`: BSD (macOS) and GNU (Cloudflare) disagree on its syntax.
  sed "s|<em class=\"currentYear\">[0-9]*</em>|<em class=\"currentYear\">${CURRENT_YEAR}</em>|g" "$f" > "$f.tmp"
  mv "$f.tmp" "$f"
done
echo "Footer year stamped: ${CURRENT_YEAR}"

# ============================================================================
# STEP 4: Compute per-page/site transfer weight and stamp %PAGE_WEIGHT% /
# %SITE_WEIGHT% tokens in build/ only — source keeps the literal tokens
# forever, so this is safe to re-run on every deploy.
# ============================================================================
node page-weight.js "$BUILD_DIR"

# ============================================================================
# STEP 5: Stamp the per-page "Elsewhere" block (Live/Shop/Essay/Research
# links) from connections.json + arena-cache.json into build/ only. Reads a
# checked-in cache — never calls Are.na itself (see arena-sync.js, run by
# hand separately). Source keeps the literal %ELSEWHERE% token forever.
# ============================================================================
node elsewhere.js "$BUILD_DIR"

# ============================================================================
# STEP 6: Flag heavy files in build/ — warns, never fails the deploy. Catches
# source art or unoptimized exports that landed somewhere the build copies
# wholesale (everything under i/ ships). Source art belongs in the private repo
# (a.wjerk.shop-private/_source-art/), never in this one.
# ============================================================================
# chairness-projection.html is a deliberately self-contained deck, opened
# rarely — exempt from the check.
HEAVY=$(find "$BUILD_DIR" -type f -size +1000k ! -name chairness-projection.html)
if [ -n "$HEAVY" ]; then
  echo "⚠ Files over 1 MB in $BUILD_DIR/:"
  echo "$HEAVY" | while read -r f; do
    printf '  %s  %s\n' "$(du -h "$f" | cut -f1)" "$f"
  done
fi
