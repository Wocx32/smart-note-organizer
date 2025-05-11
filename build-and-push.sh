#!/bin/bash

# Fail on error
set -e

# Constants
GHCR_USER="wocx32"
REPO="smart-note-organizer"
VITE_API_URL="https://smartnotes.wocx.xyz"

# Login to GHCR (make sure your PAT is set in $CR_PAT)
echo "🔐 Logging in to GitHub Container Registry..."
echo $CR_PAT | docker login ghcr.io -u $GHCR_USER --password-stdin

# Build and push frontend image
echo "🔨 Building frontend image..."
docker build \
  -f ./dockerfiles/frontend.dockerfile \
  -t ghcr.io/$GHCR_USER/$REPO/frontend:latest \
  --build-arg VITE_API_URL=$VITE_API_URL \
  ./frontend

echo "📤 Pushing frontend image to GHCR..."
docker push ghcr.io/$GHCR_USER/$REPO/frontend:latest

# Build and push backend image
echo "🔨 Building backend image..."
docker build \
  -f ./dockerfiles/backend.dockerfile \
  -t ghcr.io/$GHCR_USER/$REPO/backend:latest \
  ./backend

echo "📤 Pushing backend image to GHCR..."
docker push ghcr.io/$GHCR_USER/$REPO/backend:latest

echo "✅ Build and push complete."
