#!/bin/bash

# Create placeholder PNG images for all missing images
DIR="/home/claude/reputationsdefender/public/images"

create_placeholder() {
  local filename=$1
  local width=${2:-1200}
  local height=${3:-800}
  
  # Create a simple single-color PNG placeholder
  # Using ImageMagick if available, otherwise create a basic format
  if command -v convert &> /dev/null; then
    convert -size "${width}x${height}" xc:#e8e8e8 "$DIR/$filename"
  else
    # Fallback: create a minimal valid JPEG
    printf '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00' > "$DIR/$filename"
  fi
}

# Create placeholders for all images
touch "$DIR/logo-source.png"
touch "$DIR/home-office-woman.jpg"
touch "$DIR/typing-search.jpg"
touch "$DIR/privacy-padlock.jpg"
touch "$DIR/relieved-man-call.jpg"
touch "$DIR/search-visibility-illustration.png"
touch "$DIR/shield-privacy-illustration.png"
touch "$DIR/business-owner-reviews.jpg"
touch "$DIR/content-removal-illustration.png"
touch "$DIR/senior-man-tablet.jpg"
touch "$DIR/data-broker-optout-illustration.png"
touch "$DIR/team-office.jpg"
touch "$DIR/reviews-illustration.png"
touch "$DIR/phone-privacy-closeup.jpg"
touch "$DIR/hero-banner-woman.jpg"

echo "Placeholder files created"
