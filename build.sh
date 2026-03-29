#!/bin/sh
# Calculate total size of all locally-served files and stamp it into index.html.
# Set year automatically and compute page size before deploying: sh build.sh

# Change to the directory where this script is located
cd "$(dirname "$0")" || exit 1

# Determine current year and stamp it into index.html
CURRENT_YEAR=$(date +%Y)

# Determine file set to include in page size metric.
# Add more local files here (e.g. local images) as required.
# FILES=$(find . -name "*.html" -o -name "*.css" -o -name "*.png" | grep -v case-study-template.html | grep -v case-studies.html | tr '\n' ' ')

# Calculate base load (index.html + assets)
BASE_BYTES=0
for f in index.html style.css 3Plogo.png; do
  if [ -f "$f" ]; then
    # macOS stat format; for Linux use: stat -c %s "$f"
    FILE_SIZE=$(stat -f %z "$f" 2>/dev/null || stat -c %s "$f" 2>/dev/null || echo 0)
    BASE_BYTES=$((BASE_BYTES + FILE_SIZE))
  else
    echo "Warning: $f is missing; skipping size calculation for that file." >&2
  fi
done

BASE_KB=$(awk "BEGIN {printf \"%.0f\", $BASE_BYTES/1024}")

# Calculate total load (all HTML files + assets)
TOTAL_BYTES=0
for f in index.html style.css 3Plogo.png case-study-*.html; do
  if [ -f "$f" ]; then
    FILE_SIZE=$(stat -f %z "$f" 2>/dev/null || stat -c %s "$f" 2>/dev/null || echo 0)
    TOTAL_BYTES=$((TOTAL_BYTES + FILE_SIZE))
  fi
done

TOTAL_KB=$(awk "BEGIN {printf \"%.0f\", $TOTAL_BYTES/1024}")

# Replace the page size line in the footer with both base and total.
# Format: "Base: X KB | Full site: Y KB" (using # as sed delimiter to avoid conflicts with |)
sed -i '' "s#Base: [0-9]* KB | Full site: [0-9]* KB#Base: ${BASE_KB} KB | Full site: ${TOTAL_KB} KB#g" index.html

# Replace the year in the footer.
# This updates the .currentYear em to the current year.
sed -i '' "s|<em class=\"currentYear\">[0-9]*</em>|<em class=\"currentYear\">${CURRENT_YEAR}</em>|g" index.html


echo "Page sizes stamped: Base ${BASE_KB} KB | Full site ${TOTAL_KB} KB"
echo "Footer year updated: ${CURRENT_YEAR}"
