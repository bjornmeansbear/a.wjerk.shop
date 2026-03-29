#!/bin/sh
# WJERK BUILD SCRIPT
# Purpose: Calculate site file sizes and auto-update footer with transparency metrics and year
# Usage: sh build.sh (run this before deploying to ensure accurate metadata)

# Change to the directory where this script is located
# This ensures the script works no matter where it's called from
cd "$(dirname "$0")" || exit 1

# ============================================================================
# STEP 1: Get current year for footer
# ============================================================================
# Extract the current year using the `date` command and store in CURRENT_YEAR variable
CURRENT_YEAR=$(date +%Y)

# ============================================================================
# STEP 2: Calculate BASE LOAD (what visitors download when they land on index.html)
# ============================================================================
# Initialize BASE_BYTES counter to 0
BASE_BYTES=0

# Loop through each essential file that loads on initial page visit
# This includes: landing page HTML, styles, and one logo image
for f in index.html style.css 3Plogo.png; do
  # Check if file exists (to avoid errors if a file is missing)
  if [ -f "$f" ]; then
    # Get file size in bytes using `stat` command
    # macOS uses `stat -f %z`, Linux uses `stat -c %s`
    # Use 2>/dev/null to suppress errors, default to 0 if file read fails
    FILE_SIZE=$(stat -f %z "$f" 2>/dev/null || stat -c %s "$f" 2>/dev/null || echo 0)
    
    # Add this file's size to running total
    BASE_BYTES=$((BASE_BYTES + FILE_SIZE))
  else
    # Warn user if a file is missing (but continue anyway)
    echo "Warning: $f is missing; skipping size calculation for that file." >&2
  fi
done

# Convert total bytes to kilobytes, rounded to nearest whole number
# Uses `awk` to do floating-point math and printf for formatting
BASE_KB=$(awk "BEGIN {printf \"%.0f\", $BASE_BYTES/1024}")

# ============================================================================
# STEP 3: Calculate TOTAL LOAD (what visitors download if they read all case studies)
# ============================================================================
# Initialize TOTAL_BYTES counter to 0
TOTAL_BYTES=0

# Loop through all HTML files plus core assets
# case-study-*.html matches all case study files with wildcard pattern
for f in index.html style.css 3Plogo.png case-study-*.html; do
  # Check if file exists
  if [ -f "$f" ]; then
    # Get file size in bytes (macOS or Linux compatible)
    FILE_SIZE=$(stat -f %z "$f" 2>/dev/null || stat -c %s "$f" 2>/dev/null || echo 0)
    
    # Add this file's size to running total
    TOTAL_BYTES=$((TOTAL_BYTES + FILE_SIZE))
  fi
done

# Convert total bytes to kilobytes, rounded to nearest whole number
TOTAL_KB=$(awk "BEGIN {printf \"%.0f\", $TOTAL_BYTES/1024}")

# ============================================================================
# STEP 4: Update footer in index.html with size metrics
# ============================================================================
# Use `sed` (stream editor) to find and replace text in the HTML file
# The '-i' flag edits the file in-place (modifies the original file)
# The '' means create no backup file (macOS requires this)
# Use # as delimiter instead of | to avoid conflicts with the pipe character in the pattern
# This replaces the format: "Base: X KB | Full site: Y KB" with calculated values
sed -i '' "s#Base: [0-9]* KB | Full site: [0-9]* KB#Base: ${BASE_KB} KB | Full site: ${TOTAL_KB} KB#g" index.html

# ============================================================================
# STEP 5: Update footer in index.html with current year
# ============================================================================
# Use `sed` to find and replace the currentYear span in the HTML
# Pattern matches: <em class="currentYear">2025</em> (any 4-digit year)
# Replaces it with: <em class="currentYear">2026</em> (or whatever current year is)
# The 'g' flag means "global" - replace all occurrences
sed -i '' "s|<em class=\"currentYear\">[0-9]*</em>|<em class=\"currentYear\">${CURRENT_YEAR}</em>|g" index.html

# ============================================================================
# STEP 6: Print summary to terminal so user knows what happened
# ============================================================================
# Show user what file sizes were stamped (base vs. full site comparison)
echo "Page sizes stamped: Base ${BASE_KB} KB | Full site ${TOTAL_KB} KB"

# Show user what year was stamped into the footer
echo "Footer year updated: ${CURRENT_YEAR}"
