#!/bin/sh
# Calculate total size of all locally-served files and stamp it into index.html.
# Run this before deploying: sh build.sh

BYTES=$(cat index.html style.css 3Plogo.png | wc -c)
KB=$(echo "$BYTES / 1024" | bc)

# Replace the page size line in the footer
sed -i '' "s|Page size: [0-9]* kb|Page size: ${KB} kb|" index.html

echo "Page size stamped: ${KB} kb"
