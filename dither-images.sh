#!/bin/sh
# Dither homepage grid source images via dither.js (Atkinson, see dither.js
# header for why). Mirrors generate-case-studies.sh's list-and-loop pattern.
# Usage: sh dither-images.sh

cd "$(dirname "$0")" || exit 1

# source|output|width
IMAGES="
3Plogo.png|i/3Plogo-dither.png|800
i/thumb_classic_med_bjornard_kristian_spontaneouslamp3.jpg|i/spontaneous-lamp-dither.png|800
i/52467753725_83a94e0906_c.jpg|i/slash-dither.png|800
i/52467753730_bdcaaab921_z.jpg|i/slash-ontop-dither.png|800
i/51368358350_fa4e139cc3_c.jpg|i/carbon-book-dither.png|800
i/9055685895_34d9e39f20_c.jpg|i/green-acres-dither.png|800
i/51367568813_9a30354224_z.jpg|i/sustainabilitist-dither.png|800
i/14753804954_9d937267b7_c.jpg|i/contact-dither.png|800
i/7725163876_1bf73f8b73_b.jpg|i/about-dither.png|800
"

echo "$IMAGES" | while IFS='|' read -r src out width; do
  if [ -n "$src" ]; then
    node dither.js "$src" "$out" "$width"
  fi
done
