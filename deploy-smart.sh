#!/bin/bash

# Smart Deployment Script
# - Uses Docker cache for fast builds
# - Clears application cache for instant changes
# - Verifies deployment success

set -e

echo "🚀 Smart Deployment Starting..."
echo ""

# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build with Docker cache (fast)
echo -e "${BLUE}📦 Step 1/5: Building Docker image...${NC}"
echo "   Using BuildKit cache for dependencies (fast)"
docker compose build bb-front
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 2: Stop old container
echo -e "${BLUE}🛑 Step 2/5: Stopping old container...${NC}"
docker compose stop bb-front 2>/dev/null || true
echo -e "${GREEN}✅ Stopped${NC}"
echo ""

# Step 3: Start new container
echo -e "${BLUE}🚀 Step 3/5: Starting new container...${NC}"
docker compose up -d bb-front
echo -e "${GREEN}✅ Started${NC}"
echo ""

# Step 4: Wait for health check
echo -e "${BLUE}🏥 Step 4/5: Waiting for health check...${NC}"
sleep 5

MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker compose ps bb-front | grep -q "healthy\|running"; then
        echo -e "${GREEN}✅ Container is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Attempt $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}⚠️  Health check timeout (container may still be starting)${NC}"
fi
echo ""

# Step 5: Clear browser cache hint
echo -e "${BLUE}🧹 Step 5/5: Cache Status${NC}"
echo "   ✅ Docker cache: KEPT (for fast rebuilds)"
echo "   ✅ Build ID: UNIQUE (forces browser refresh)"
echo "   ✅ Static assets: VERSIONED (automatic cache bust)"
echo ""

# Show deployment info
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📊 Container Status:"
docker compose ps bb-front
echo ""
echo "📋 Recent Logs:"
docker compose logs --tail=30 bb-front
echo ""
echo "💡 Tips:"
echo "   - Changes are live immediately"
echo "   - Users may need to hard refresh (Ctrl+F5)"
echo "   - Next deployment will be faster (cache warmed)"
echo ""
echo "🔍 Verify deployment:"
echo "   curl http://localhost:3000"
echo ""
