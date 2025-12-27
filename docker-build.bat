@echo off
REM Fast Docker Build Script with BuildKit for Windows

echo.
echo 🚀 Building BookBharat Frontend with BuildKit optimizations...
echo.

REM Enable BuildKit for faster builds
set DOCKER_BUILDKIT=1
set COMPOSE_DOCKER_CLI_BUILD=1

REM Build with BuildKit
echo 📦 Building image...
docker-compose build --progress=plain

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed!
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Build complete!
echo.
echo To run the container:
echo   docker-compose up -d
echo.
echo To view logs:
echo   docker-compose logs -f bb-front
echo.
