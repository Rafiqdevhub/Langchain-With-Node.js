# AI Code Review Agent with LangChain & Google Gemini

A production-ready RESTful API for AI-powered code review and chatbot services using LangChain and Google's Gemini AI model. This backend service provides comprehensive code analysis, security vulnerability detection, and intelligent conversation capabilities.

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

### Security & Performance

- **Helmet.js** for security headers
- **CORS** protection with configurable origins
- **Compression** middleware for response optimization
- **Payload size limits** (1MB for JSON, 5MB for files)
- **Multi-tier rate limiting**:
  - General API: 100 requests per 15 minutes per IP
  - AI endpoints: 20 (production) / 50 (development) requests per 15 minutes per IP
  - Daily AI limit: 50 requests per day per IP
- **Graceful shutdown** handling
- **Robust error handling** with environment-aware responses

### Production Ready

- **Environment-based configuration** via `.env` files
- **TypeScript** for type safety
- **Vercel deployment** optimized
- **Health check endpoint** with rate limit status
- **Comprehensive API documentation**

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google AI API key ([Get one here](https://makersuite.google.com/app/apikey))

## API Reference

### Health Check

```http
GET /
```

Returns API status, available endpoints, and rate limit information.

**Response:**

```json
{
  "status": "API is running",
  "version": "2.0.0",
  "description": "AI-powered code review and chatbot service",
  "endpoints": [
    "/api/ai/chat",
    "/api/ai/review-text",
    "/api/ai/review-files",
    "/api/ai/languages",
    "/api/ai/guidelines"
  ],
  "features": [
    "AI Chatbot with conversation memory",
    "Code review for text input",
    "Multi-file code analysis",
    "Security vulnerability detection",
    "Code quality assessment",
    "Support for 25+ programming languages"
  ]
}
```

### Code Review - Text Input

```http
POST /api/ai/review-text
```

Submit code as text for AI-powered review and analysis.

**Request Body:**

```json
{
  "code": "function divide(a, b) { return a / b; }",
  "filename": "math.js",
  "threadId": "optional-thread-id"
}
```

**Response:**

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

### Code Review - File Upload

```http
POST /api/ai/review-files
Content-Type: multipart/form-data
```

Upload code files for comprehensive analysis.

**Form Data:**

- `files`: Code files (up to 10 files, 5MB each)
- `threadId`: Optional thread ID for conversation continuity

**Supported File Types:**

- JavaScript: `.js`, `.jsx`
- TypeScript: `.ts`, `.tsx`
- Python: `.py`
- Java: `.java`
- C/C++: `.c`, `.cpp`, `.h`, `.hpp`
- And 20+ more languages

### Get Supported Languages

```http
GET /api/ai/languages
```

Returns list of supported programming languages and file types.

### Get Review Guidelines

```http
GET /api/ai/guidelines
```

Returns code review criteria, severity levels, and best practices.

### Chat with AI

```http
POST /api/ai/chat
```

Send a message to the AI chatbot with optional conversation continuity.

**Request Body:**

```json
{
  "message": "Your message here",
  "threadId": "optional-thread-id"
}
```

**Rate Limits:**

- **General**: 100 requests per 15 minutes per IP
- **AI Endpoint**: 20 (prod) / 50 (dev) requests per 15 minutes per IP
- **Daily AI Limit**: 50 requests per day per IP

**Error Responses:**

Rate limit exceeded:

```json
{
  "error": "AI rate limit exceeded",
  "message": "Too many AI requests from this IP, please try again later."
}
```

Daily limit exceeded:

```json
{
  "error": "Daily AI limit exceeded",
  "message": "You have exceeded your daily limit of 50 AI requests. Please try again tomorrow or contact support for additional quota.",
  "dailyLimit": 50,
  "resetTime": "24 hours from first request"
}
```

Validation error:

```json
{
  "error": "Validation Error",
  "message": "Message is required"
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

### Platform Deployment

The project includes configuration files for popular hosting platforms:

- **Heroku**: `Procfile` included
- **Railway/Render**: Works out of the box
- **Vercel/Netlify**: Serverless deployment ready
- **AWS/GCP**: Container deployment ready

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for detailed deployment instructions.

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
GOOGLE_API_KEY=your_production_api_key
CORS_ORIGIN=https://yourdomain.com

# Optional rate limiting overrides
RATE_LIMIT_GENERAL_MAX=200
RATE_LIMIT_AI_MAX_PROD=30
RATE_LIMIT_AI_DAILY_MAX=100
```

## Configuration

All configuration is handled through environment variables with sensible defaults:

| Variable                  | Default       | Description                   |
| ------------------------- | ------------- | ----------------------------- |
| `PORT`                    | `5000`        | Server port                   |
| `NODE_ENV`                | `development` | Environment mode              |
| `GOOGLE_API_KEY`          | _required_    | Google AI API key             |
| `CORS_ORIGIN`             | `*` (dev)     | Allowed CORS origins          |
| `RATE_LIMIT_WINDOW_MS`    | `900000`      | Rate limit window (15 min)    |
| `RATE_LIMIT_GENERAL_MAX`  | `100`         | General requests per window   |
| `RATE_LIMIT_AI_MAX_PROD`  | `20`          | AI requests per window (prod) |
| `RATE_LIMIT_AI_MAX_DEV`   | `50`          | AI requests per window (dev)  |
| `RATE_LIMIT_AI_DAILY_MAX` | `50`          | AI requests per day           |

## Architecture

```
src/
├── config/
│   └── env.ts              # Environment configuration
├── routes/
│   └── ai.routes.ts        # AI chat endpoints
└── index.ts                # Main server file
```

**Key Design Decisions:**

- **Stateless API**: No database required, conversation state managed by client
- **Rate limiting**: Multi-tier protection against abuse
- **Error boundaries**: Graceful error handling with detailed logging
- **Security first**: Helmet, CORS, payload limits, and input validation
- **Environment aware**: Different behavior for development vs production

## Technologies Used

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI Integration**: LangChain + Google Gemini
- **Security**: Helmet.js, CORS, express-rate-limit
- **Performance**: Compression middleware
- **Development**: tsx, nodemon for hot reload
- **Deployment**: Docker, multi-platform support

## Documentation

- [`API_DOCS.md`](./API_DOCS.md) - Detailed API documentation
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Production deployment guide
- [Environment variables](#configuration) - Configuration reference
