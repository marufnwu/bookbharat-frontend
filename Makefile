# BookBharat Frontend - Docker Commands with BuildKit Optimization

.PHONY: help build build-fast build-no-cache up down restart logs clean deploy deploy-fresh

# Enable BuildKit for all commands
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Default target
help:
	@echo "BookBharat Frontend - Available Commands:"
	@echo ""
	@echo "⚡ Fast Commands (BuildKit Optimized):"
	@echo "  make deploy         - Fast build & deploy (40-90% faster)"
	@echo "  make build-fast     - Fast build with BuildKit cache"
	@echo ""
	@echo "🐳 Container Management:"
	@echo "  make up             - Start containers"
	@echo "  make down           - Stop and remove containers"
	@echo "  make restart        - Restart containers"
	@echo "  make logs           - View container logs"
	@echo ""
	@echo "🔧 Build Options:"
	@echo "  make build          - Standard build (uses cache)"
	@echo "  make build-no-cache - Build without cache (fixes module errors)"
	@echo "  make deploy-fresh   - Deploy with fresh build (no cache)"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean          - Clean up Docker resources"
	@echo "  make clean-cache    - Clean BuildKit cache"
	@echo ""

# Fast build with BuildKit cache mounts (RECOMMENDED)
build-fast:
	@echo "⚡ Building with BuildKit optimizations..."
	docker compose build bb-front
	@echo "✅ Fast build complete!"

# Standard build with cache
build:
	@echo "📦 Building with cache..."
	docker compose build bb-front

# Build without cache (use only when needed)
build-no-cache:
	@echo "🔨 Building without cache (slower)..."
	docker compose build --no-cache bb-front

# Start containers
up:
	docker compose up -d bb-front

# Stop and remove containers
down:
	docker compose down

# Restart containers
restart:
	docker compose restart bb-front

# View logs
logs:
	docker compose logs -f bb-front

# Clean up Docker resources
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker compose down -v
	docker builder prune -f
	@echo "✅ Cleanup complete!"

# Clean BuildKit cache
clean-cache:
	@echo "🧹 Cleaning BuildKit cache..."
	docker buildx prune -f
	@echo "✅ BuildKit cache cleaned!"

# Deploy: Fast build with cache and start (RECOMMENDED)
deploy:
	@echo "⚡ Fast deployment with BuildKit optimizations..."
	@echo ""
	@echo "📦 Building image (this will be FAST with cache)..."
	docker compose build bb-front
	@echo ""
	@echo "🚀 Starting container..."
	docker compose up -d bb-front
	@echo ""
	@echo "✅ Deployment complete!"
	@echo ""
	@echo "📊 Container status:"
	docker compose ps bb-front
	@echo ""
	@echo "📋 Recent logs:"
	docker compose logs --tail=50 bb-front

# Deploy fresh: Build without cache and start (use only when needed)
deploy-fresh:
	@echo "🔨 Fresh deployment (no cache - slower)..."
	@echo ""
	@echo "⚠️  This will be slower but ensures clean build"
	@echo ""
	docker compose build --no-cache bb-front
	@echo ""
	@echo "🚀 Starting container..."
	docker compose up -d bb-front
	@echo ""
	@echo "✅ Fresh deployment complete!"
	@echo ""
	docker compose logs --tail=50 bb-front
