#!/bin/bash
set -e

# Read version from manifest
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')
OUTPUT="potd-v${VERSION}.zip"

# Ensure build directory exists and remove any existing output
mkdir -p build
rm -f "build/$OUTPUT"

# Package only distribution files
zip -r "build/$OUTPUT" \
  manifest.json \
  new_tab.html \
  new_tab.css \
  api.js \
  date-utils.js \
  dom-elements.js \
  event-handlers.js \
  main.js \
  media-display.js \
  state.js \
  icons/

echo "Built: build/$OUTPUT"
