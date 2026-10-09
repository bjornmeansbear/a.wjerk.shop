#!/bin/sh
# Start a new case study page from case-study-template.html.
# Usage: sh new-case-study.sh <slug> "<Title>" "<Description>" <image-url-or-path>
# Writes case-study-<slug>.html; refuses to overwrite an existing page.
# The page still needs a row on index.html and its prev/next links.

cd "$(dirname "$0")" || exit 1

if [ $# -ne 4 ]; then
  echo "Usage: sh new-case-study.sh <slug> \"<Title>\" \"<Description>\" <image>" >&2
  exit 1
fi

slug=$1
out="case-study-$slug.html"
if [ -e "$out" ]; then
  echo "$out already exists — not overwriting." >&2
  exit 1
fi

# Escape the characters sed treats as special in a replacement (\ & |).
esc() { printf '%s' "$1" | sed 's/[\\&|]/\\&/g'; }

sed "s|{{TITLE}}|$(esc "$2")|g; s|{{DESCRIPTION}}|$(esc "$3")|g; s|{{IMAGE}}|$(esc "$4")|g" \
  case-study-template.html > "$out"
echo "Wrote $out"
