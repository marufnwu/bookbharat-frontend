#!/bin/bash

# Fast Docker Build Script with BuildKit
# This script builds the Docker image with optimizations enabled

set -e

echo "🚀 Building BookBharat Frontend with BuildKit optimizations..."
echo ""

# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Check if docker-compose or docker compose is available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Error: Neither 'docker-compose' nor 'docker compose' is available"
    exit 1
fi

# Build with BuildKit
echo "📦 Building image..."
$DOCKER_COMPOSE build --progress=plain

echo ""
echo "✅ Build complete!"
echo ""
echo "To run the container:"
echo "  $DOCKER_COMPOSE up -d"
echo ""
echo "To view logs:"
echo "  $DOCKER_COMPOSE logs -f bb-front"
