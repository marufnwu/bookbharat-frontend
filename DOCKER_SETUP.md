# 🐳 Docker Setup - BookBharat Frontend

Complete guide for building and deploying the BookBharat frontend with Docker.

---

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Improvements Made](#improvements-made)
- [Configuration](#configuration)
- [Commands](#commands)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## 🚀 Quick Start

### 1. Build and Deploy
```bash
make deploy
```

### 2. View Logs
```bash
make logs
```

### 3. Stop
```bash
make down
```

---

## ✨ Improvements Made

### Dockerfile Enhancements

#### 1. **Build-time Environment Variables**
```dockerfile
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
# ... etc
```
- Environment variables are now baked into the build
- Ensures consistent configuration across environments

#### 2. **Health Check**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', ...)"
```
- Automatic health monitoring
- Container automatically restarts if unhealthy
- Works with orchestrators (Docker Swarm, Kubernetes)

#### 3. **Telemetry Disabled**
```dockerfile
ENV NEXT_TELEMETRY_DISABLED=1
```
- Disables Next.js telemetry for privacy and faster builds

#### 4. **Proper .next Directory Permissions**
```dockerfile
RUN mkdir .next
RUN chown nextjs:nodejs .next
```
- Prevents permission issues with Next.js cache

---

### docker-compose.yml Enhancements

#### 1. **Environment Variable Defaults**
```yaml
NEXT_PUBLIC_API_URL: "${NEXT_PUBLIC_API_URL:-https://v2s.bookbharat.com/api/v1}"
```
- Uses `.env` file if present
- Falls back to sensible defaults
- Easy to override for different environments

#### 2. **Container Name**
```yaml
container_name: bookbharat-frontend
```
- Easy to identify in `docker ps`
- Consistent naming across deployments

#### 3. **Health Check**
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "..."]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```
- Monitors application health
- Automatic restarts on failures
- 40s grace period for startup

#### 4. **Resource Limits**
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```
- Prevents resource exhaustion
- Ensures minimum resources available
- **Adjust based on your server specs**

#### 5. **Logging Configuration**
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```
- Logs automatically rotate
- Maximum 30MB disk usage (3 files × 10MB)
- Prevents disk fill-up

---

### Makefile Enhancements

New commands available:

```bash
make help            # Show all available commands
make build           # Build with cache
make build-no-cache  # Build without cache (fixes module errors)
make up              # Start containers
make down            # Stop containers
make restart         # Restart containers
make logs            # View logs (follow mode)
make clean           # Clean up Docker resources
make deploy          # Build (no cache) and deploy
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://v2s.bookbharat.com/api/v1

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://bookbharat.com
NEXT_PUBLIC_SITE_NAME=BookBharat

# Feature Flags
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_CHAT_SUPPORT=true

# Node Environment
NODE_ENV=production
```

### Production vs Development

**Production (default):**
```bash
make deploy
```

**Development with local API:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📝 Commands

### Build Commands

```bash
# Build with cache (fast, but may have stale files)
make build
docker compose build bb-front

# Build without cache (recommended after code changes)
make build-no-cache
docker compose build --no-cache bb-front

# Build with specific platform (for M1/M2 Macs)
docker compose build --platform linux/amd64 bb-front
```

### Run Commands

```bash
# Start in background
make up
docker compose up -d bb-front

# Start with logs visible
docker compose up bb-front

# Start and rebuild
docker compose up -d --build bb-front
```

### Monitoring Commands

```bash
# View logs (follow)
make logs
docker compose logs -f bb-front

# View last 100 lines
docker compose logs --tail=100 bb-front

# Check container status
docker compose ps

# Check health status
docker inspect bookbharat-frontend | grep -A 10 Health
```

### Maintenance Commands

```bash
# Restart container
make restart
docker compose restart bb-front

# Stop container
make down
docker compose down

# Stop and remove volumes
docker compose down -v

# Clean up everything
make clean
```

---

## 🐛 Troubleshooting

### Problem: Module not found errors

**Symptom:**
```
Module not found: Can't resolve '@/components/layout/Header'
```

**Solution:**
```bash
# Build without cache
make build-no-cache
make deploy
```

**Why:** Docker was using cached layers from before files were added.

---

### Problem: Container keeps restarting

**Check health:**
```bash
docker compose ps
docker compose logs bb-front
```

**Common causes:**
1. Port 3000 already in use
2. Build failed but container started anyway
3. Missing environment variables

**Solution:**
```bash
# Check what's using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux

# Rebuild
make clean
make deploy
```

---

### Problem: Out of memory during build

**Increase Docker resources:**
- Docker Desktop → Settings → Resources
- Increase Memory to at least 4GB
- Increase Swap to 2GB

**Or use resource limits:**
Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 1G  # Reduce if needed
```

---

### Problem: Slow builds

**Use BuildKit (faster builds):**
```bash
# Linux/Mac
DOCKER_BUILDKIT=1 docker compose build

# Windows PowerShell
$env:DOCKER_BUILDKIT=1
docker compose build
```

**Or enable permanently:**
Add to `~/.docker/config.json`:
```json
{
  "features": {
    "buildkit": true
  }
}
```

---

## 🚀 Production Deployment

### Option 1: Single Server (Docker Compose)

```bash
# On production server
git clone <repository>
cd bookbharat-frontend

# Create production .env
cat > .env << EOF
NEXT_PUBLIC_API_URL=https://v2s.bookbharat.com/api/v1
NEXT_PUBLIC_SITE_URL=https://bookbharat.com
NEXT_PUBLIC_SITE_NAME=BookBharat
NODE_ENV=production
EOF

# Deploy
make deploy

# Enable auto-restart on server reboot
docker update --restart=always bookbharat-frontend
```

### Option 2: Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml bookbharat

# Scale
docker service scale bookbharat_bb-front=3
```

### Option 3: Kubernetes

Convert to Kubernetes:
```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.30.0/kompose-linux-amd64 -o kompose
chmod +x kompose

# Convert
./kompose convert

# Deploy
kubectl apply -f .
```

---

## 📊 Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-12T00:00:00.000Z",
  "service": "bookbharat-frontend"
}
```

### Container Stats

```bash
# Real-time stats
docker stats bookbharat-frontend

# One-time check
docker compose exec bb-front top
```

### Logs

```bash
# Follow logs
make logs

# Last 100 lines
docker compose logs --tail=100 bb-front

# Logs since timestamp
docker compose logs --since 2024-10-12T10:00:00 bb-front
```

---

## 🔒 Security Best Practices

### 1. **Run as Non-Root**
✅ Already implemented:
```dockerfile
USER nextjs
```

### 2. **Minimal Base Image**
✅ Using Alpine (5MB base):
```dockerfile
FROM node:20-alpine
```

### 3. **Multi-Stage Build**
✅ Reduces final image size:
- Only production files included
- No dev dependencies
- No source files

### 4. **Environment Variables**
⚠️ Never commit `.env` files to git:
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

---

## 📦 Image Size Optimization

Current setup produces small images (~150-200MB):

```bash
# Check image size
docker images bb-front

# Further reduce (optional)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest bb-front:latest
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker compose build --no-cache bb-front
      
      - name: Run tests
        run: docker compose run bb-front npm test
      
      - name: Deploy
        run: |
          docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASSWORD }}
          docker push bb-front:latest
```

---

## 📚 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## ✅ Summary

**What's Been Improved:**
- ✅ Build-time environment variables
- ✅ Health checks (Dockerfile + docker-compose)
- ✅ Resource limits
- ✅ Log rotation
- ✅ Enhanced Makefile with 8 commands
- ✅ Health check API endpoint
- ✅ Proper permissions
- ✅ Telemetry disabled
- ✅ Container naming
- ✅ Comprehensive documentation

**Next Steps:**
1. Run `make deploy` to build and start
2. Check health: `curl http://localhost:3000/api/health`
3. Monitor logs: `make logs`

**Need help?** Check the [Troubleshooting](#troubleshooting) section above.

