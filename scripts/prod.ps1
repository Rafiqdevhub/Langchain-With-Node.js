# Production deployment script for Codify Backend
# This script starts the application in production mode with Neon Cloud Database

Write-Host "🚀 Starting Codify Backend in Production Mode" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if .env.production exists
if (!(Test-Path .env.production)) {
    Write-Host "❌ Error: .env.production file not found!" -ForegroundColor Red
    Write-Host "   Please create .env.production with your production environment variables."
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
    Write-Host "   Please start Docker and try again."
    exit 1
}

Write-Host "📦 Building and starting production container..." -ForegroundColor Yellow
Write-Host "   - Using Neon Cloud Database (no local proxy)" -ForegroundColor Yellow
Write-Host "   - Running in optimized production mode" -ForegroundColor Yellow
Write-Host ""

# Start production environment
docker compose -f docker-compose.prod.yml up --build -d

# Wait for container to be ready
Write-Host "⏳ Waiting for application to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run migrations with Drizzle inside the container
Write-Host "📜 Applying latest schema with Drizzle..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml exec app npm run db:migrate

Write-Host ""
Write-Host "🎉 Production environment started!" -ForegroundColor Green
Write-Host "   Application: http://localhost:5000" -ForegroundColor Cyan
Write-Host "   Logs: docker logs codify-backend-prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "   View logs: docker logs -f codify-backend-prod" -ForegroundColor Yellow
Write-Host "   Stop app: docker compose -f docker-compose.prod.yml down" -ForegroundColor Yellow
Write-Host "   Restart: docker compose -f docker-compose.prod.yml restart" -ForegroundColor Yellow