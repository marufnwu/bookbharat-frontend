# BookBharat Frontend - Docker Commands

.PHONY: help build build-no-cache up down restart logs clean deploy

# Default target
help:
	@echo "BookBharat Frontend - Available Commands:"
	@echo ""
	@echo "  make build          - Build Docker image (uses cache)"
	@echo "  make build-no-cache - Build Docker image without cache (fixes module errors)"
	@echo "  make up             - Start containers"
	@echo "  make down           - Stop and remove containers"
	@echo "  make restart        - Restart containers"
	@echo "  make logs           - View container logs"
	@echo "  make clean          - Clean up Docker resources"
	@echo "  make deploy         - Build and deploy (no cache)"
	@echo ""

# Build with cache
build:
	docker compose build bb-front

# Build without cache (recommended when files are added/removed)
build-no-cache:
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
	docker compose down -v
	docker builder prune -f

# Deploy: build without cache and start
deploy:
	@echo "Building without cache to ensure all files are included..."
	docker compose build --no-cache bb-front
	@echo "Starting container..."
	docker compose up -d bb-front
	@echo "Deployment complete! Logs:"
	docker compose logs --tail=50 bb-front
