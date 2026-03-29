#!/bin/sh
# Calculate total size of all locally-served files and stamp it into index.html.
# Set year automatically and compute page size before deploying: sh build.sh

# Change to the directory where this script is located
cd "$(dirname "$0")" || exit 1

# Determine current year and stamp it into index.html
CURRENT_YEAR=$(date +%Y)

# Determine file set to include in page size metric.
# Add more local files here (e.g. local images) as required.
# FILES=$(find . -name "*.html" -o -name "*.css" -o -name "*.png" | grep -v case-study-template.html | tr '\n' ' ')

BYTES=0
for f in index.html style.css 3Plogo.png; do
  if [ -f "$f" ]; then
    # macOS stat format; for Linux use: stat -c %s "$f"
    FILE_SIZE=$(stat -f %z "$f" 2>/dev/null || stat -c %s "$f" 2>/dev/null || echo 0)
    BYTES=$((BYTES + FILE_SIZE))
  else
    echo "Warning: $f is missing; skipping size calculation for that file." >&2
  fi
done

KB=$(awk "BEGIN {printf \"%.0f\", $BYTES/1024}")

# Replace the page size line in the footer.
# This matches the full “Estimated page size: xxx KB” text.
sed -i '' "s|Estimated page size: [0-9]* [Kk][Bb]|Estimated page size: ${KB} KB|g" index.html

# Replace the year in the footer.
# This updates the .currentYear em to the current year.
sed -i '' "s|<em class=\"currentYear\">[0-9]*</em>|<em class=\"currentYear\">${CURRENT_YEAR}</em>|g" index.html


echo "Page size stamped: ${KB} kb"
echo "Footer year updated: ${CURRENT_YEAR}"
