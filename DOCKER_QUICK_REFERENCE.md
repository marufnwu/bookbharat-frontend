# 🐳 Docker Quick Reference - BookBharat Frontend

## 🚀 Quick Commands

```bash
# Deploy (recommended)
make deploy

# View logs
make logs

# Restart
make restart

# Stop
make down

# Clean up
make clean

# Help
make help
```

## 🏗️ Build Options

```bash
# With cache (fast)
make build

# Without cache (fixes module errors)
make build-no-cache
```

## 📊 Monitoring

```bash
# Health check
curl http://localhost:3000/api/health

# Container stats
docker stats bookbharat-frontend

# Check health status
docker inspect bookbharat-frontend | grep -A 10 Health
```

## 🐛 Common Issues

### Module not found?
```bash
make build-no-cache
make deploy
```

### Port already in use?
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Out of memory?
- Increase Docker Desktop resources to 4GB+
- Or reduce limits in docker-compose.yml

## 📝 Environment Variables

Create `.env` file:
```env
NEXT_PUBLIC_API_URL=https://v2s.bookbharat.com/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=BookBharat
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_CHAT_SUPPORT=true
```

## ✨ What's New?

- ✅ Health checks
- ✅ Resource limits
- ✅ Log rotation
- ✅ Build-time env vars
- ✅ Enhanced Makefile
- ✅ Better error handling

## 📚 Full Documentation

See `DOCKER_SETUP.md` for complete guide.

