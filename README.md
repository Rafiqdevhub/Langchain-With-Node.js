# AI Code Review Agent with LangChain & Google Gemini + User Authentication

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

- **Arcjet Security Integration** with bot detection and threat shield
- **Dynamic Rate Limiting** based on user authentication status:
  - **Guests (unauthenticated)**: 5 requests per minute
  - **Users (authenticated)**: 15 requests per minute
- **Additional Authentication Rate Limiting**: 5 attempts per 15 minutes
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
- Arcjet API key ([Get one here](https://arcjet.com))

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

## API Reference

### System Health & Information

#### GET `/`

Returns comprehensive API status, available endpoints, security features, and system information.

**Response:**

```json
{
  "status": "API is running",
  "version": "2.0.0",
  "description": "AI-powered code review and chatbot service with Arcjet security and user authentication",
  "endpoints": [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/profile",
    "/api/auth/logout",
    "/api/ai/chat",
    "/api/ai/review-text",
    "/api/ai/review-files",
    "/api/ai/languages",
    "/api/ai/guidelines"
  ],
  "security": {
    "provider": "Arcjet",
    "features": [
      "Bot detection and blocking",
      "Security threat shield",
      "Dynamic rate limiting (5 requests/min for guests, 15 for users)",
      "Real-time request analysis",
      "JWT-based authentication"
    ]
  },
  "features": [
    "User registration and authentication",
    "JWT token-based sessions",
    "User profile management",
    "AI Chatbot with conversation memory",
    "Code review for text input",
    "Multi-file code analysis",
    "Security vulnerability detection",
    "Code quality assessment",
    "Support for 25+ programming languages",
    "Advanced security protection via Arcjet"
  ]
}
```

#### GET `/health`

Basic health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T10:30:00.000Z",
  "uptime": 3600.5,
  "version": "2.0.0"
}
```

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**

- Name: Required, non-empty string
- Email: Valid email format, unique
- Password: Minimum 6 characters

**Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-09-17T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/login`

Authenticate user and receive access token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-09-17T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/api/auth/profile`

Get current user profile information. **Requires authentication.**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-09-17T10:30:00.000Z",
    "updated_at": "2025-09-17T10:30:00.000Z"
  }
}
```

#### PUT `/api/auth/profile`

Update user profile information. **Requires authentication.**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "John Smith"
}
```

**Response (200 OK):**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "updated_at": "2025-09-17T11:00:00.000Z"
  }
}
```

#### POST `/api/auth/change-password`

Change user password. **Requires authentication.**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response (200 OK):**

```json
{
  "message": "Password changed successfully"
}
```

#### POST `/api/auth/logout`

Logout user (logs the event, token invalidation is client-side). **Requires authentication.**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "message": "Logout successful"
}
```

### AI-Powered Code Analysis Endpoints

#### POST `/api/ai/review-text`

Submit code as text for AI-powered review and analysis.

**Request Body:**

```json
{
  "code": "function divide(a, b) { return a / b; }",
  "filename": "math.js",
  "threadId": "optional-thread-id"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": "Brief overview of the code analysis",
    "issues": [
      {
        "type": "warning",
        "severity": "medium",
        "line": 1,
        "description": "Division by zero not handled",
        "suggestion": "Add check for b === 0"
      }
    ],
    "suggestions": ["General improvement suggestions"],
    "securityConcerns": ["Security vulnerabilities found"],
    "codeQuality": {
      "readability": 8,
      "maintainability": 7,
      "complexity": "Low"
    },
    "threadId": "conversation-thread-id"
  }
}
```

#### POST `/api/ai/review-files`

Upload code files for comprehensive analysis.

**Content-Type:** `multipart/form-data`

**Form Data:**

- `files`: Code files (up to 10 files, 5MB each)
- `threadId`: Optional thread ID for conversation continuity

**Supported File Types:**

- JavaScript: `.js`, `.jsx`
- TypeScript: `.ts`, `.tsx`
- Python: `.py`
- Java: `.java`
- C/C++: `.c`, `.cpp`, `.h`, `.hpp`
- And 20+ more languages (see `/api/ai/languages`)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": "Multi-file analysis results",
    "issues": [...],
    "suggestions": [...],
    "securityConcerns": [...],
    "codeQuality": {...},
    "threadId": "conversation-thread-id",
    "filesAnalyzed": [
      {
        "filename": "app.js",
        "language": "javascript",
        "size": 1024
      }
    ]
  }
}
```

#### POST `/api/ai/chat`

Send a message to the AI chatbot with optional conversation continuity.

**Request Body:**

```json
{
  "message": "How can I improve this function?",
  "threadId": "optional-thread-id"
}
```

**Response (200 OK):**

```json
{
  "message": "AI response to your question",
  "threadId": "conversation-thread-id"
}
```

#### GET `/api/ai/languages`

Returns list of supported programming languages and file types.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "supportedExtensions": [".js", ".ts", ".py", ".java", "..."],
    "languages": [
      {
        "extension": ".js",
        "language": "javascript"
      }
    ],
    "maxFileSize": "5MB",
    "maxFiles": 10
  }
}
```

#### GET `/api/ai/guidelines`

Returns code review criteria, severity levels, and best practices.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "reviewCriteria": [
      "Potential bugs and logic errors",
      "Security vulnerabilities",
      "Performance issues",
      "Code maintainability and readability",
      "Best practices adherence",
      "Design patterns usage",
      "Error handling",
      "Code structure and organization"
    ],
    "severityLevels": {
      "critical": "Critical issues that must be fixed immediately",
      "high": "Important issues that should be addressed soon",
      "medium": "Issues that should be considered for improvement",
      "low": "Minor suggestions for enhancement"
    },
    "issueTypes": {
      "bug": "Potential runtime errors or logic mistakes",
      "warning": "Code that might cause issues",
      "suggestion": "Recommendations for improvement",
      "security": "Security vulnerabilities or concerns"
    }
  }
}
```

## Rate Limiting & Security

### Dynamic Rate Limiting

The API implements **dynamic rate limiting** based on user authentication status:

#### Rate Limits by User Type

| User Type                    | Rate Limit         | Description                        |
| ---------------------------- | ------------------ | ---------------------------------- |
| **Guests** (unauthenticated) | 5 requests/minute  | Encourages user registration       |
| **Users** (authenticated)    | 15 requests/minute | Higher limits for registered users |

#### Authentication Endpoints Rate Limiting

| Endpoint Type                                                                             | Rate Limit  | Window     |
| ----------------------------------------------------------------------------------------- | ----------- | ---------- |
| **Authentication** (`/api/auth/register`, `/api/auth/login`, `/api/auth/change-password`) | 5 attempts  | 15 minutes |
| **Profile** (`/api/auth/profile`)                                                         | 20 requests | 15 minutes |

### Security Features

- **Arcjet Integration**: Bot detection, threat shield, and security monitoring
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Input Validation**: Comprehensive validation for all endpoints
- **CORS Protection**: Configurable origins with secure defaults
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM

## Error Responses

### Authentication Errors (401)

```json
{
  "error": "Authentication Error",
  "message": "Invalid email or password"
}
```

```json
{
  "error": "Authentication Error",
  "message": "Token has expired"
}
```

### Validation Errors (400)

```json
{
  "error": "Validation Error",
  "message": "Name, email, and password are required"
}
```

### Rate Limit Exceeded (429)

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Consider registering for higher limits.",
  "retryAfter": 60
}
```

### User Conflict (409)

```json
{
  "error": "Conflict",
  "message": "User with this email already exists"
}
```

### Bot/Security Blocked (403)

```json
{
  "error": "Forbidden",
  "message": "Automated requests are not allowed"
}
```

```json
{
  "error": "Forbidden",
  "message": "Request blocked by security policy"
}
```

### Server Errors (500)

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong during registration"
}
```

## Deployment

This is a backend-only API with no frontend or static file dependencies. It's designed for deployment on various platforms:

- **Vercel** (recommended for serverless)
- **Heroku**
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **Docker** (any container platform)

### Quick Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `GOOGLE_API_KEY`
   - `CORS_ORIGIN` (your frontend URL)
   - `NODE_ENV=production`
3. Deploy automatically via git push

The included `vercel.json` configuration ensures proper API-only deployment.

### Common Deployment Issues

❌ **"public directory not found"** - This is an API-only project with no frontend. Use the provided `vercel.json` configuration.

❌ **CORS errors** - Set `CORS_ORIGIN` to your frontend domain in production.

❌ **Build failures** - Ensure all dependencies are installed: `npm install`

✅ **Solution**: Use the deployment configurations provided in `vercel.json`, `Dockerfile`, and `Procfile`.

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for detailed deployment instructions.

### Docker Deployment

```bash
# Build and run with Docker
docker build -t langchain-api .
docker run -p 5000:5000 --env-file .env langchain-api

# Or use docker-compose
docker-compose up -d
```

## Environment Variables

### Required Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (NeonDB)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Google AI API
GOOGLE_API_KEY=your-google-api-key

# Arcjet Security
ARCJET_KEY=your-arcjet-api-key
ARCJET_ENV=development
ARCJET_MODE=LIVE

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### Optional Rate Limiting Variables

```env
# Authentication Rate Limiting
AUTH_RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
AUTH_RATE_LIMIT_MAX=5               # 5 auth attempts per window
PROFILE_RATE_LIMIT_MAX=20           # 20 profile requests per window

# Arcjet Rate Limiting (configured in code)
# Guests: 5 requests/minute
# Users: 15 requests/minute
```

### Production Configuration

For production deployment, ensure these settings:

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret-64-chars>
ARCJET_MODE=LIVE
CORS_ORIGINS=https://yourdomain.com
DATABASE_URL=<production-database-url>
```

## Configuration

The API provides flexible configuration through environment variables:

| Setting          | Default                    | Description                     |
| ---------------- | -------------------------- | ------------------------------- |
| `PORT`           | `5000`                     | Server port                     |
| `NODE_ENV`       | `development`              | Environment mode                |
| `DATABASE_URL`   | _required_                 | PostgreSQL connection string    |
| `JWT_SECRET`     | _required in production_   | JWT signing secret              |
| `JWT_EXPIRES_IN` | `7d`                       | Token expiration time           |
| `GOOGLE_API_KEY` | _required_                 | Google AI API key               |
| `ARCJET_KEY`     | _required_                 | Arcjet security API key         |
| `CORS_ORIGINS`   | Multiple domains supported | Comma-separated allowed origins |

### Rate Limiting Configuration

Rate limits are dynamically configured based on user authentication:

| User Type             | Requests/Minute | Configured In            |
| --------------------- | --------------- | ------------------------ |
| **Guests**            | 5               | `security.middleware.ts` |
| **Users**             | 15              | `security.middleware.ts` |
| **Auth Endpoints**    | 5 per 15 min    | `auth.routes.ts`         |
| **Profile Endpoints** | 20 per 15 min   | `auth.routes.ts`         |

### CORS Configuration

The API supports multiple frontend domains:

```env
# Single domain
CORS_ORIGINS=https://yourdomain.com

# Multiple domains
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000,https://app.yourdomain.com
```

**Default allowed origins:**

- `https://codify-omega.vercel.app` (production)
- `http://localhost:3000` (development)

## Architecture

```text
src/
├── config/
│   ├── env.ts              # Environment configuration
│   ├── database.ts         # Database connection (NeonDB)
│   ├── arcjet.ts          # Security configuration
│   └── logger.ts          # Winston logging setup
├── controllers/
│   ├── ai.controller.ts    # Chat functionality
│   ├── code-review.controller.ts # Code review logic
│   └── auth.controller.ts  # Authentication endpoints
├── middleware/
│   ├── auth.middleware.ts  # JWT authentication
│   ├── security.middleware.ts # Arcjet security
│   ├── upload.middleware.ts # File upload handling
│   └── request-logger.middleware.ts # Request logging
├── models/
│   └── users.model.ts      # User database schema
├── routes/
│   ├── ai.routes.ts        # AI API route definitions
│   └── auth.routes.ts      # Authentication routes
├── services/
│   ├── chatbot.service.ts  # LangChain chat service
│   └── code-review.service.ts # Code analysis service
└── index.ts                # Main server file
```

**Key Design Decisions:**

- **Database-backed Authentication**: PostgreSQL with Drizzle ORM for user management
- **JWT Token Authentication**: Stateless authentication with 7-day expiration
- **Dynamic Security**: Rate limits adjust based on authentication status
- **Role-based Architecture**: User and guest roles with different permissions
- **Microservice-ready**: Modular structure for easy scaling
- **Security-first**: Multiple layers of protection via Arcjet
- **Error boundaries**: Comprehensive error handling with detailed logging
- **Multiple CORS origins**: Support for multiple frontend domains
- **Flexible request parsing**: Supports both JSON and text/plain content types

## Database Setup

### NeonDB Integration

This application uses **NeonDB** (serverless PostgreSQL) with **Drizzle ORM** for data management.

#### Database Schema

**Users Table:**

```sql
CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "password" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

#### Migration Commands

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Rate Limiting Details

#### Current Implementation

The API implements **dynamic rate limiting** with Arcjet integration:

#### Security Layers

1. **Arcjet Bot Detection**: Blocks automated requests
2. **Arcjet Security Shield**: Protects against threats
3. **Dynamic Rate Limiting**: Adjusts based on user authentication
4. **Express Rate Limiting**: Additional protection for auth endpoints

#### Rate Limit Benefits

- **Encourages Registration**: Guests get lower limits
- **Rewards Authentication**: Users receive higher limits
- **Prevents Abuse**: Multiple security layers
- **Real-time Monitoring**: Detailed logging and analytics

## Technologies Used

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL via NeonDB (serverless)
- **ORM**: Drizzle ORM with Kit for migrations
- **Authentication**: JWT tokens, bcryptjs for password hashing
- **AI Integration**: LangChain + Google Gemini 2.0 Flash
- **Security**: Arcjet (bot detection, threat shield, rate limiting)
- **Additional Security**: Helmet.js, CORS, input validation
- **Performance**: Compression middleware, optimized queries
- **Logging**: Winston for structured logging
- **Development**: tsx, nodemon for hot reload
- **Deployment**: Docker support, multi-platform compatibility

## Quick Integration Examples

### Backend API Usage

#### Authentication Flow

```javascript
// Register new user
const registerResponse = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    password: "securepass123",
  }),
});

const { user, token } = await registerResponse.json();
localStorage.setItem("authToken", token);
```

#### Making Authenticated Requests

```javascript
const token = localStorage.getItem("authToken");

// Get user profile
const profileResponse = await fetch("/api/auth/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Code review with authentication (higher rate limits)
const reviewResponse = await fetch("/api/ai/review-text", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    code: 'console.log("Hello World");',
    filename: "test.js",
  }),
});
```

#### Handling Rate Limits

```javascript
async function makeRequest(url, options) {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const error = await response.json();
    if (error.message.includes("Consider registering")) {
      // Redirect to registration for higher limits
      window.location.href = "/register";
    } else {
      // Handle rate limit with retry
      const retryAfter = error.retryAfter || 60;
      setTimeout(() => makeRequest(url, options), retryAfter * 1000);
    }
  }

  return response;
}
```

## Documentation

- [`AUTHENTICATION.md`](./AUTHENTICATION.md) - **Complete authentication system guide**
- [`ARCJET_INTEGRATION.md`](./ARCJET_INTEGRATION.md) - Security implementation details
- [Environment Variables](#environment-variables) - Configuration reference
- [Database Setup](#database-setup) - Database schema and migrations

### Database Documentation

The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **Users table**: Stores user accounts with encrypted passwords
- **Migrations**: Version-controlled schema changes via Drizzle Kit
- **Type safety**: Generated TypeScript types from database schema
- **Connection pooling**: Efficient database connections via NeonDB serverless
