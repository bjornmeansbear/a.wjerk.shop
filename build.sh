#!/bin/sh
# WJERK BUILD SCRIPT
# Purpose: assemble the static site into build/ (source stays untouched),
#          stamp the footer year and %PAGE_WEIGHT%/%SITE_WEIGHT% tokens.
# Usage: sh build.sh
#
# Cloudflare Pages project settings: build command `sh build.sh`,
# build output directory `build`, root directory `/`.

cd "$(dirname "$0")" || exit 1

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
cp 3Plogo.png "$BUILD_DIR"/
cp -R i "$BUILD_DIR"/

# ============================================================================
# STEP 3: Stamp current year into build/ footers
# ============================================================================
for f in "$BUILD_DIR"/*.html; do
  sed -i '' "s|<em class=\"currentYear\">[0-9]*</em>|<em class=\"currentYear\">${CURRENT_YEAR}</em>|g" "$f"
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
