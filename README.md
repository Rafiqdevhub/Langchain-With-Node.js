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
- **CORS** protection with configurable origins (supports multiple domains)
- **Text/plain request support** for flexible frontend integration
- **Compression** middleware for response optimization
- **Payload size limits** (1MB for JSON, 5MB for files)
- **Multi-tier rate limiting**:
  - General API: 20 requests per 24 hours per IP
  - AI endpoints: 5 requests per 24 hours per IP
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

- **General**: 20 requests per 24 hours per IP
- **AI Endpoints**: 5 requests per 24 hours per IP

**Important**: Rate limits are strictly enforced per IP address and reset at midnight UTC daily.

**Error Responses:**

Rate limit exceeded:

```json
{
  "error": "Daily general limit exceeded",
  "message": "You have exceeded your daily limit of 20 requests. Please try again tomorrow."
}
```

AI limit exceeded:

```json
{
  "error": "Daily AI limit exceeded",
  "message": "You have exceeded your daily limit of 5 AI requests. Please try again tomorrow."
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

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
GOOGLE_API_KEY=your_production_api_key
CORS_ORIGINS=https://codify-omega.vercel.app,https://yourdomain.com

# The API uses fixed daily rate limits (not configurable via env vars)
# General API: 20 requests per 24 hours per IP
# AI Endpoints: 5 requests per 24 hours per IP
```

## Configuration

The API uses fixed daily rate limits for optimal resource management:

| Setting                 | Value                      | Description                          |
| ----------------------- | -------------------------- | ------------------------------------ |
| `PORT`                  | `5000`                     | Server port                          |
| `NODE_ENV`              | `development`              | Environment mode                     |
| `GOOGLE_API_KEY`        | _required_                 | Google AI API key                    |
| `CORS_ORIGINS`          | Multiple domains supported | Comma-separated allowed CORS origins |
| **Rate Limits (Fixed)** |                            |                                      |
| General API             | `20 requests per 24 hours` | All endpoints per IP                 |
| AI Endpoints            | `5 requests per 24 hours`  | AI-specific endpoints per IP         |
| Rate Limit Reset        | `Midnight UTC daily`       | When limits reset                    |

### CORS Configuration

The API supports multiple frontend domains. Configure using:

```env
# Single domain
CORS_ORIGINS=https://yourdomain.com

# Multiple domains
CORS_ORIGINS=https://codify-omega.vercel.app,http://localhost:8000,https://yourdomain.com
```

**Default allowed origins:**

- `https://codify-omega.vercel.app` (production)
- `http://localhost:8000` (development)

## Architecture

```
src/
├── config/
│   └── env.ts              # Environment configuration
├── controllers/
│   ├── ai.controller.ts    # Chat functionality
│   └── code-review.controller.ts # Code review logic
├── middleware/
│   └── upload.middleware.ts # File upload handling
├── routes/
│   └── ai.routes.ts        # API route definitions
├── services/
│   ├── chatbot.service.ts  # LangChain chat service
│   └── code-review.service.ts # Code analysis service
└── index.ts                # Main server file with rate limiting
```

**Key Design Decisions:**

- **Stateless API**: No database required, conversation state managed by client
- **Strict daily rate limiting**: 20 general + 5 AI requests per IP per day
- **IP-based isolation**: Each IP address gets independent rate limit counters
- **Multiple CORS origins**: Support for multiple frontend domains
- **Error boundaries**: Graceful error handling with detailed logging
- **Security first**: Helmet, CORS, payload limits, and input validation
- **Flexible request parsing**: Supports both JSON and text/plain content types

## Rate Limiting Details

### Current Implementation

The API implements **strict daily rate limiting** to ensure fair usage and resource protection:

#### General Endpoints (20 requests/day per IP)

- Root endpoint (`/`)
- Health check (`/health`)
- All other non-AI endpoints

#### AI Endpoints (5 requests/day per IP)

- `/api/ai/chat` - AI chatbot
- `/api/ai/review-text` - Text code review
- `/api/ai/review-files` - File upload code review
- `/api/ai/languages` - Get supported languages
- `/api/ai/guidelines` - Get review guidelines

### Rate Limit Features

- **Per-IP isolation**: Each IP address has independent counters
- **Daily reset**: Limits reset at midnight UTC
- **Explicit key generation**: Uses IP + date for accurate tracking
- **Graceful error responses**: Clear messages when limits are exceeded
- **Header information**: Standard rate limit headers included in responses

### Testing Rate Limits

You can test the rate limiting behavior:

```bash
# Test general endpoint (20/day limit)
for i in {1..25}; do curl http://localhost:5000/ && echo "Request $i"; done

# Test AI endpoint (5/day limit)
for i in {1..8}; do curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}' && echo "AI Request $i"; done
```

## Technologies Used

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI Integration**: LangChain + Google Gemini
- **Security**: Helmet.js, CORS, express-rate-limit
- **Performance**: Compression middleware
- **Development**: tsx, nodemon for hot reload
- **Deployment**: Docker, multi-platform support

## Documentation

- [`FRONTEND_DEVELOPMENT_GUIDE.md`](./FRONTEND_DEVELOPMENT_GUIDE.md) - **Complete frontend integration guide**
- [`API_DOCS.md`](./API_DOCS.md) - Detailed API documentation
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Production deployment guide
- [Configuration](#configuration) - Environment variables reference

### Frontend Integration

The `FRONTEND_DEVELOPMENT_GUIDE.md` provides comprehensive instructions for building a frontend that integrates with this API, including:

- Complete API endpoint documentation with examples
- TypeScript interfaces and types
- React hooks and implementation examples
- Rate limiting handling strategies
- Error handling patterns
- File upload components
- CORS configuration guidance

## Quick Integration Example

```javascript
// Basic API client setup
const API_BASE = "https://your-api-domain.com";

// Chat with AI
const response = await fetch(`${API_BASE}/api/ai/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Hello AI!" }),
});

// Review code
const reviewResponse = await fetch(`${API_BASE}/api/ai/review-text`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code: 'console.log("Hello World");',
    filename: "test.js",
  }),
});
```
