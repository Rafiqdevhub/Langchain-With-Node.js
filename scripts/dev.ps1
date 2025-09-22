# Development startup script for Codify Backend with PostgreSQL
# This script starts the application in development mode with local PostgreSQL

Write-Host "🚀 Starting Codify Backend in Development Mode" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if .env.development exists
if (!(Test-Path .env.development)) {
    Write-Host "❌ Error: .env.development file not found!" -ForegroundColor Red
    Write-Host "   Please copy .env.development from the template and update with your API keys."
    exit 1
}

# Check if Docker is running
try {
    $dockerVersion = docker version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
} catch {
    Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and try again."
    exit 1
}

Write-Host "📦 Building and starting development containers..." -ForegroundColor Yellow
Write-Host "   - PostgreSQL database for local development" -ForegroundColor Yellow
Write-Host "   - Application will run with hot reload enabled" -ForegroundColor Yellow
Write-Host ""

# Start development environment
docker compose -f docker-compose.dev.yml up --build -d

# Wait for the database to be ready
Write-Host "⏳ Waiting for the database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
docker compose -f docker-compose.dev.yml exec db pg_isready -U postgres -d codify_dev

# Run migrations with Drizzle inside the container
Write-Host "📜 Applying latest schema with Drizzle..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

Write-Host ""
Write-Host "🎉 Development environment started!" -ForegroundColor Green
Write-Host "   Application: http://localhost:5000" -ForegroundColor Cyan
Write-Host "   Database: postgres://postgres:postgres@localhost:5432/codify_dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the environment, run: docker compose -f docker-compose.dev.yml down" -ForegroundColor Yellow
Write-Host "To view logs, run: docker compose -f docker-compose.dev.yml logs -f" -ForegroundColor Yellow