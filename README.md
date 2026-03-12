# Codify: AI Code Review Agent with LangChain & Google Gemini + User Authentication

- **Development Mode**: route-level auth/profile rate limiting is disabled
- **Production Mode**:
  - **Authentication endpoints**: 5 attempts per 15 minutes
  - **Profile endpoints**: 20 requests per 15 minutes

A production-ready RESTful API for AI-powered code review and chatbot services using LangChain and Google's Gemini AI model. This backend service provides comprehensive code analysis, security vulnerability detection, intelligent conversation capabilities, and secure user authentication with JWT tokens.

## Features

### Core Functionality

- **AI Code Review** with detailed analysis and suggestions
- **Multi-file code analysis** supporting 25+ programming languages
- **Security vulnerability detection** and best practices enforcement
- **Code quality assessment** with readability and maintainability scores
- **LangChain integration** with Google Gemini AI
- **Conversation memory/history** support with thread tracking
- **File upload support** (up to 10 files, 5MB each)
- **RESTful API** with structured JSON responses

### User Authentication & Management

- **User Registration** with email validation and secure password hashing
- **JWT-based Authentication** with 7-day token expiration
- **User Profile Management** (view and update user information)
- **Password Change** functionality with current password verification
- **Secure Logout** with activity logging
- **Role-based Access Control** (user and guest roles)

### Security & Performance

- **Internal Security Middleware** (currently pass-through)
- **Route-Level Rate Limiting** on auth/profile endpoints (Production only):
  - **Development Mode**: Rate limiting disabled for easier testing and development
  - **Production Mode**:
    - **Authentication endpoints**: 5 attempts per 15 minutes
    - **Profile endpoints**: 20 requests per 15 minutes
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Database Integration**: PostgreSQL with Drizzle ORM via NeonDB
- **Helmet.js** for security headers
- **CORS** protection with configurable origins (supports multiple domains)
- **Text/plain request support** for flexible frontend integration
- **Compression** middleware for response optimization
- **Payload size limits** (1MB for JSON, 5MB for files)
- **Graceful shutdown** handling
- **Robust error handling** with environment-aware responses

### Production Ready

- **Environment-based configuration** via `.env` files
- **TypeScript** for type safety
- **Database migrations** with Drizzle Kit
- **Vercel deployment** optimized
- **Health check endpoint** with comprehensive system information
- **Comprehensive API documentation**

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google AI API key ([Get one here](https://makersuite.google.com/app/apikey))
- PostgreSQL database (NeonDB recommended)

### Environment Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```
4. **Configure environment variables** (see [Environment Variables](#environment-variables))
5. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```
6. **Start development server**:
   ```bash
   npm run dev
   ```

## Docker Setup

The application is fully dockerized with different configurations for development and production environments.

### Development with Docker

For local development using PostgreSQL (local database):

1. **Ensure Docker and Docker Compose are installed**

2. **Configure environment variables**:

   ```bash
   cp .env.development .env.development.local
   ```

Edit `.env.development.local` with your API keys (Google AI, database, JWT).

3. **Start development environment**:

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

   This will:
   - Start PostgreSQL database on port 5432
   - Build and start the application on port 5000
   - Mount source code for hot reloading

4. **Run database migrations** (in a new terminal):

   ```bash
   docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
   ```

5. **Access the application**:
   - API: http://localhost:5000
   - Database: postgres://postgres:postgres@localhost:5432/postgres

### Production with Docker

For production deployment using Neon Cloud database:

1. **Configure environment variables**:

   ```bash
   cp .env.production .env.production.local
   ```

   Edit `.env.production.local` with:
   - Production Neon database URL
   - Production API keys
   - Production CORS origins

2. **Build and run production environment**:

   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

3. **Access the application**:
   - API: http://localhost:5000 (or your configured port)

### Environment Variables Switching

- **Development**: Uses `.env.development` with PostgreSQL connection
- **Production**: Uses `.env.production` with Neon Cloud connection

The `DATABASE_URL` automatically switches between:

- Dev: `postgres://postgres:postgres@db:5432/codify_dev`
- Prod: Your Neon Cloud URL (e.g., `postgres://...neon.tech...`)

## Advanced Docker Deployment

### Environment Variables Management

#### For Local Development

```bash
# Copy and configure development environment
cp .env.example .env.development
# Edit .env.development with your local configuration

# Start development environment
npm run dev:docker
```

#### For Production Deployment

##### Option 1: Docker Compose (Recommended)

```bash
# Create production environment file
cp .env.example .env.production

# Edit .env.production with production values:
# - DATABASE_URL=your-neon-production-url
# - JWT_SECRET=strong-production-secret
# - GOOGLE_API_KEY=your-production-key
# - CORS_ORIGINS=https://yourdomain.com
# - NODE_ENV=production

# Deploy
docker compose -f docker-compose.prod.yml up -d
```

##### Option 2: Direct Docker Run

```bash
# Run with environment file
docker run -d \
  --name codify-backend \
  -p 5000:5000 \
  --env-file .env.production \
  rafiq9323/codify-backend:latest
```

##### Option 3: Docker Run with Inline Environment Variables

```bash
docker run -d \
  --name codify-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-super-secret-key" \
  -e GOOGLE_API_KEY="your-google-api-key" \
  -e CORS_ORIGINS="https://yourdomain.com" \
  rafiq9323/codify-backend:latest
```

##### Option 4: Kubernetes Deployment

### Docker Image Management

#### Building Locally

```bash
# Build for local testing
docker build -t codify-backend:local .

# Run locally
docker run -p 5000:5000 --env-file .env.development codify-backend:local
```

#### Pulling from Docker Hub

```bash
# Pull latest image
docker pull rafiq9323/codify-backend:latest

# Run with environment variables
docker run -p 5000:5000 \
  -e DATABASE_URL="your-db-url" \
  -e JWT_SECRET="your-secret" \
  rafiq9323/codify-backend:latest
```

#### Image Information

- **Repository**: `rafiq9323/codify-backend`
- **Architecture**: Multi-platform (AMD64, ARM64)
- **Base Image**: Node.js 20 Alpine
- **Size**: ~444MB
- **Health Check**: Built-in `/health` endpoint

### Database Migration in Docker

#### Development Environment

```bash
# Run migrations inside running container
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

# Or run locally (if containers are down)
npm run db:migrate
```

#### Production Environment

```bash
# Run migrations in production container
docker compose -f docker-compose.prod.yml exec app npm run db:migrate

# Or with direct docker exec
docker exec codify-backend npm run db:migrate
```

### Troubleshooting Docker Issues

#### Common Problems & Solutions

##### 1. Port Already in Use

```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process or change port
docker run -p 5001:5000 rafiq9323/codify-backend:latest
```

##### 2. Database Connection Failed

```bash
# Check database container logs
docker compose -f docker-compose.dev.yml logs db

# Test database connection
docker compose -f docker-compose.dev.yml exec db pg_isready -U postgres -d codify_dev
```

##### 3. Environment Variables Not Loaded

```bash
# Verify environment file exists
ls -la .env*

# Check environment variables in container
docker exec codify-backend env | grep -E "(DATABASE_URL|JWT_SECRET|GOOGLE_API_KEY)"
```

##### 4. Permission Denied on Docker Socket

```bash
# On Linux, add user to docker group
sudo usermod -aG docker $USER

# Or run with sudo
sudo docker compose up
```

##### 5. Build Fails Due to Cache

```bash
# Build without cache
docker compose -f docker-compose.dev.yml build --no-cache

# Clean Docker system
docker system prune -a
```

##### 6. Container Exits Immediately

```bash
# Check container logs
docker logs codify-backend

# Run interactively to debug
docker run -it --rm rafiq9323/codify-backend:latest /bin/sh
```

### Docker Compose Commands Reference

```bash
# Development
docker compose -f docker-compose.dev.yml up              # Start in foreground
docker compose -f docker-compose.dev.yml up -d           # Start in background
docker compose -f docker-compose.dev.yml down            # Stop containers
docker compose -f docker-compose.dev.yml logs -f         # Follow logs
docker compose -f docker-compose.dev.yml exec app bash   # Access container shell

# Production
docker compose -f docker-compose.prod.yml up -d          # Deploy production
docker compose -f docker-compose.prod.yml down           # Stop production
docker compose -f docker-compose.prod.yml restart        # Restart services
docker compose -f docker-compose.prod.yml logs -f app    # Follow app logs
```

### Security Best Practices

#### Environment Variables

- ✅ **Never commit** `.env` files to git
- ✅ **Use strong, unique secrets** for production
- ✅ **Rotate JWT secrets** regularly
- ✅ **Use HTTPS URLs** in CORS_ORIGINS

#### Docker Security

- ✅ **Run as non-root user** (configured in Dockerfile)
- ✅ **Use specific image tags** (not `latest` in production)
- ✅ **Scan images** for vulnerabilities
- ✅ **Keep base images updated**

#### Database Security

- ✅ **Use connection pooling** (handled by NeonDB)
- ✅ **Enable SSL/TLS** (default with NeonDB)
- ✅ **Regular backups** (handled by NeonDB)
- ✅ **Parameterized queries** (Drizzle ORM)

### Monitoring & Health Checks

#### Health Check Endpoint

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2025-09-22T...",
  "uptime": 123.45,
  "version": "2.0.0"
}
```

#### Container Health

```bash
# Check container health
docker ps

# View resource usage
docker stats codify-backend

# Monitor logs
docker logs -f codify-backend
```

### Scaling Considerations

#### Horizontal Scaling

```bash
# Run multiple instances
docker run -d -p 5001:5000 rafiq9323/codify-backend:latest
docker run -d -p 5002:5000 rafiq9323/codify-backend:latest

# Use load balancer (nginx example)
docker run -d -p 80:80 \
  --link codify-backend-1:backend1 \
  --link codify-backend-2:backend2 \
  nginx
```

#### Database Scaling

- **NeonDB** handles automatic scaling
- **Connection pooling** built-in
- **Read replicas** available for high traffic

### Backup & Recovery

#### Database Backups

```bash
# NeonDB provides automatic backups
# Manual backup if needed
docker compose -f docker-compose.dev.yml exec db pg_dump -U postgres codify_dev > backup.sql
```

#### Container Recovery

```bash
# Restart failed containers
docker compose -f docker-compose.prod.yml restart

# Recreate containers
docker compose -f docker-compose.prod.yml up --force-recreate -d
```

This comprehensive Docker deployment guide covers all aspects of running your Codify Backend in containerized environments, from local development to production scaling.

#### Migration Commands

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```
