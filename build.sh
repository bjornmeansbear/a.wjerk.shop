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
# STEP 2: Update footer in index.html with current year
# ============================================================================
# Use `sed` to find and replace the currentYear span in the HTML
# Pattern matches: <em class="currentYear">2025</em> (any 4-digit year)
# Replaces it with: <em class="currentYear">2026</em> (or whatever current year is)
# The 'g' flag means "global" - replace all occurrences
sed -i '' "s|<em class=\"currentYear\">[0-9]*</em>|<em class=\"currentYear\">${CURRENT_YEAR}</em>|g" index.html

echo "Footer year updated: ${CURRENT_YEAR}"

# ============================================================================
# STEP 3: Compute per-page/site transfer weight and stamp it into every
# footer's %PAGE_WEIGHT% / %SITE_WEIGHT% tokens (see page-weight.js)
# ============================================================================
node page-weight.js .
