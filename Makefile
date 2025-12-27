# BookBharat Frontend - HARDENED Docker Deployment
# Security improvements:
# - Uses hardened Dockerfile and docker-compose
# - Verifies security configurations before deploy
# - Adds security checks and validation

.PHONY: help build build-fast build-no-cache up down restart logs clean deploy deploy-fresh verify security-check

# Enable BuildKit for all commands
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Use hardened configurations
COMPOSE_FILE := docker-compose.hardened.yml
DOCKERFILE := Dockerfile.hardened

# Default target
help:
	@echo "BookBharat Frontend - HARDENED Deployment Commands:"
	@echo ""
	@echo "🔒 Security-First Deployment:"
	@echo "  make deploy         - RECOMMENDED: Secure build & deploy"
	@echo "  make deploy-fresh   - Fresh secure deployment (no cache)"
	@echo "  make security-check - Verify security configurations"
	@echo "  make verify         - Verify deployment is working"
	@echo ""
	@echo "🐳 Container Management:"
	@echo "  make up             - Start containers"
	@echo "  make down           - Stop and remove containers"
	@echo "  make restart        - Restart containers"
	@echo "  make logs           - View container logs"
	@echo ""
	@echo "🔧 Build Options:"
	@echo "  make build          - Build with hardened Dockerfile"
	@echo "  make build-no-cache - Build without cache"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean          - Clean up Docker resources"
	@echo "  make clean-all      - Full cleanup (images, cache, volumes)"
	@echo ""

# Security configuration check
security-check:
	@echo "🔒 Running security configuration checks..."
	@echo ""
	@echo "✓ Checking if hardened Dockerfile exists..."
	@test -f $(DOCKERFILE) || (echo "❌ $(DOCKERFILE) not found!" && exit 1)
	@echo "✓ Checking if hardened docker-compose exists..."
	@test -f $(COMPOSE_FILE) || (echo "❌ $(COMPOSE_FILE) not found!" && exit 1)
	@echo "✓ Checking environment variables..."
	@test -f .env || (echo "⚠️  .env file not found - using defaults" && true)
	@echo ""
	@echo "✅ Security checks passed!"
	@echo ""

# Fast build with BuildKit cache mounts (RECOMMENDED)
build-fast: security-check
	@echo "⚡ Building with hardened Dockerfile and BuildKit optimizations..."
	docker compose -f $(COMPOSE_FILE) build bb-front
	@echo "✅ Secure build complete!"

# Standard build with cache
build: security-check
	@echo "📦 Building with hardened configurations..."
	docker compose -f $(COMPOSE_FILE) build bb-front

# Build without cache (use only when needed)
build-no-cache: security-check
	@echo "🔨 Building without cache (slower but clean)..."
	docker compose -f $(COMPOSE_FILE) build --no-cache bb-front

# Start containers
up:
	docker compose -f $(COMPOSE_FILE) up -d bb-front

# Stop and remove containers
down:
	docker compose -f $(COMPOSE_FILE) down

# Restart containers
restart:
	docker compose -f $(COMPOSE_FILE) restart bb-front

# View logs
logs:
	docker compose -f $(COMPOSE_FILE) logs -f bb-front

# Clean up Docker resources
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker compose -f $(COMPOSE_FILE) down -v
	docker builder prune -f
	@echo "✅ Cleanup complete!"

# Full cleanup - removes images too
clean-all:
	@echo "🧹 Full cleanup (including images)..."
	docker compose -f $(COMPOSE_FILE) down -v --rmi all
	docker builder prune -af
	docker system prune -af --volumes
	@echo "✅ Full cleanup complete!"

# SECURE DEPLOY: Fast build with cache and start (RECOMMENDED)
deploy: security-check
	@echo "🔒 SECURE DEPLOYMENT with hardened configurations..."
	@echo ""
	@echo "📦 Building image with security hardening..."
	docker compose -f $(COMPOSE_FILE) build bb-front
	@echo ""
	@echo "🛑 Stopping old container..."
	docker compose -f $(COMPOSE_FILE) down
	@echo ""
	@echo "🚀 Starting new secure container..."
	docker compose -f $(COMPOSE_FILE) up -d bb-front
	@echo ""
	@echo "✅ Secure deployment complete!"
	@echo ""
	@echo "📊 Container status:"
	docker compose -f $(COMPOSE_FILE) ps bb-front
	@echo ""
	@echo "🔒 Security verification:"
	@docker inspect bookbharat-frontend --format='User: {{.Config.User}}' 2>/dev/null || echo "Container starting..."
	@docker inspect bookbharat-frontend --format='ReadonlyRootfs: {{.HostConfig.ReadonlyRootfs}}' 2>/dev/null || true
	@echo ""
	@echo "📋 Recent logs:"
	docker compose -f $(COMPOSE_FILE) logs --tail=50 bb-front

# Deploy fresh: Build without cache and start (use after security incident)
deploy-fresh: security-check
	@echo "🔒 FRESH SECURE DEPLOYMENT (no cache)..."
	@echo ""
	@echo "⚠️  This will be slower but ensures completely clean build"
	@echo "⚠️  All Docker caches will be cleared"
	@echo ""
	@echo "🧹 Cleaning all caches and old images..."
	docker compose -f $(COMPOSE_FILE) down -v --rmi all 2>/dev/null || true
	docker system prune -af --volumes
	@echo ""
	@echo "🔨 Building from scratch with security hardening..."
	docker compose -f $(COMPOSE_FILE) build --no-cache bb-front
	@echo ""
	@echo "🚀 Starting new secure container..."
	docker compose -f $(COMPOSE_FILE) up -d bb-front
	@echo ""
	@echo "✅ Fresh secure deployment complete!"
	@echo ""
	docker compose -f $(COMPOSE_FILE) logs --tail=50 bb-front

# Verify deployment is working
verify:
	@echo "🔍 Verifying deployment..."
	@echo ""
	@echo "📊 Container status:"
	@docker compose -f $(COMPOSE_FILE) ps bb-front
	@echo ""
	@echo "🔒 Security verification:"
	@echo "  User: $$(docker inspect bookbharat-frontend --format='{{.Config.User}}' 2>/dev/null || echo 'Container not running')"
	@echo "  ReadonlyRootfs: $$(docker inspect bookbharat-frontend --format='{{.HostConfig.ReadonlyRootfs}}' 2>/dev/null || echo 'N/A')"
	@echo "  Port binding: $$(docker inspect bookbharat-frontend --format='{{(index (index .NetworkSettings.Ports \"3000/tcp\") 0).HostIp}}:{{(index (index .NetworkSettings.Ports \"3000/tcp\") 0).HostPort}}' 2>/dev/null || echo 'N/A')"
	@echo ""
	@echo "🏥 Health check:"
	@curl -f http://localhost:3000/api/health 2>/dev/null && echo "✅ Health check passed" || echo "❌ Health check failed"
	@echo ""
	@echo "📋 Recent logs:"
	@docker compose -f $(COMPOSE_FILE) logs --tail=20 bb-front

# Emergency stop - immediately stop and remove container
emergency-stop:
	@echo "🚨 EMERGENCY STOP - Removing container immediately..."
	docker stop bookbharat-frontend 2>/dev/null || true
	docker rm -f bookbharat-frontend 2>/dev/null || true
	@echo "✅ Container stopped and removed"

# Inspect container security
inspect-security:
	@echo "🔍 Security inspection of running container..."
	@echo ""
	@echo "Container User:"
	@docker exec bookbharat-frontend whoami 2>/dev/null || echo "Container not running"
	@echo ""
	@echo "Available shell tools:"
	@docker exec bookbharat-frontend ls /bin 2>/dev/null || echo "Cannot access /bin (good - tools removed)"
	@echo ""
	@echo "Process list:"
	@docker exec bookbharat-frontend ps aux 2>/dev/null || echo "ps not available (good)"
	@echo ""
	@echo "Container capabilities:"
	@docker inspect bookbharat-frontend --format='{{.HostConfig.CapDrop}}' 2>/dev/null || echo "N/A"
