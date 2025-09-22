#!/bin/bash

# Development startup script for Codify Backend with Neon Local
# This script starts the application in development mode with Neon Local

echo "🚀 Starting Codify Backend in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please copy .env.development from the template and update with your API keys."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Create .neon_local directory if it doesn't exist
mkdir -p .neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Building and starting development containers..."
echo "   - Neon Local proxy will create an ephemeral database branch"
echo "   - Application will run with hot reload enabled"
echo ""

# Start development environment
docker compose -f docker-compose.dev.yml up --build -d

# Wait for the database to be ready
echo "⏳ Waiting for the database to be ready..."
sleep 10
docker compose -f docker-compose.dev.yml exec neon-local pg_isready -U postgres -d postgres

# Run migrations with Drizzle inside the container
echo "📜 Applying latest schema with Drizzle..."
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:5000"
echo "   Database: postgres://postgres:postgres@localhost:5432/postgres"
echo ""
echo "To stop the environment, run: docker compose -f docker-compose.dev.yml down"
echo "To view logs, run: docker compose -f docker-compose.dev.yml logs -f"