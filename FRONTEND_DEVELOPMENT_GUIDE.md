# Frontend Development Guide - AI Code Review Backend

## Table of Contents

1. [Backend Overview](#backend-overview)
2. [API Endpoints Reference](#api-endpoints-reference)
3. [Frontend Implementation Requirements](#frontend-implementation-requirements)
4. [Data Models & Types](#data-models--types)
5. [Integration Examples](#integration-examples)
6. [Rate Limiting & Error Handling](#rate-limiting--error-handling)
7. [Authentication & Security](#authentication--security)
8. [Deployment Considerations](#deployment-considerations)

---

## Backend Overview

This is a **production-ready RESTful API** for AI-powered code review and chatbot services built with:

- **Framework**: Express.js + TypeScript
- **AI Engine**: Google Gemini 2.0 Flash via LangChain
- **Features**: Code review, multi-file analysis, AI chatbot with memory
- **Security**: Helmet, CORS, multi-tier rate limiting
- **Deployment**: Vercel-optimized, supports multiple platforms

### Key Features Your Frontend Can Leverage

- ✅ AI-powered code review for 25+ programming languages
- ✅ Multi-file code analysis (up to 10 files, 5MB each)
- ✅ Conversation memory with thread tracking
- ✅ Security vulnerability detection
- ✅ Code quality scoring (readability, maintainability, complexity)
- ✅ Real-time chat with AI assistant

---

## API Endpoints Reference

### Base URL

- **Development**: `http://localhost:5000`
- **Production**: Your deployed backend URL

### 1. Health Check & Info

```http
GET /
```

**Purpose**: Get API status, available endpoints, and rate limits
**Response**: API information and feature list

```http
GET /health
```

**Purpose**: Health check endpoint
**Response**: Server health status and uptime

### 2. AI Chat Endpoints

#### Chat with AI Assistant

```http
POST /api/ai/chat
Content-Type: application/json
```

**Body**:

```json
{
  "message": "Hello, can you help me with JavaScript?",
  "threadId": "optional-for-conversation-continuity"
}
```

**Response**:

```json
{
  "message": "AI response here",
  "threadId": "uuid-for-conversation-tracking"
}
```

### 3. Code Review Endpoints

#### Review Code as Text

```http
POST /api/ai/review-text
Content-Type: application/json
```

**Body**:

```json
{
  "code": "function divide(a, b) { return a / b; }",
  "filename": "math.js",
  "threadId": "optional-thread-id"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "summary": "Brief code overview",
    "issues": [
      {
        "type": "warning",
        "severity": "medium",
        "line": 1,
        "description": "Division by zero not handled",
        "suggestion": "Add check for b === 0"
      }
    ],
    "suggestions": ["Add error handling", "Use TypeScript"],
    "securityConcerns": ["Input validation missing"],
    "codeQuality": {
      "readability": 7,
      "maintainability": 6,
      "complexity": "Low"
    },
    "threadId": "conversation-thread-id"
  }
}
```

#### Review Uploaded Files

```http
POST /api/ai/review-files
Content-Type: multipart/form-data
```

**Body**:

- `files`: File uploads (up to 10 files, 5MB each)
- `threadId`: Optional thread ID

**Response**: Same as review-text but includes `filesAnalyzed` array

### 4. Utility Endpoints

#### Get Supported Languages

```http
GET /api/ai/languages
```

**Response**:

```json
{
  "success": true,
  "data": {
    "supportedExtensions": [".js", ".ts", ".py", ".java", "..."],
    "languages": [
      { "extension": ".js", "language": "javascript" },
      { "extension": ".ts", "language": "typescript" }
    ],
    "maxFileSize": "5MB",
    "maxFiles": 10
  }
}
```

#### Get Review Guidelines

```http
GET /api/ai/guidelines
```

**Response**: Review criteria, severity levels, and best practices

---

## Frontend Implementation Requirements

### 1. Core Pages/Components Needed

#### Home/Landing Page

- API status display
- Feature overview
- Getting started guide

#### Code Review Interface

- **Text Input Mode**:
  - Code editor/textarea
  - Language selection dropdown
  - Filename input
- **File Upload Mode**:
  - Drag & drop file upload
  - Multiple file selection
  - File type validation
- **Results Display**:
  - Summary section
  - Issues list with severity badges
  - Code quality metrics
  - Security concerns panel

#### AI Chat Interface

- Chat message history
- Message input
- Thread management
- Conversation persistence

#### Settings/Configuration

- API endpoint configuration
- Rate limit information
- Supported languages view

### 2. Required Frontend Technologies

#### Essential Libraries

```json
{
  "http-client": "axios or fetch",
  "ui-framework": "React/Vue/Angular/Svelte",
  "file-upload": "dropzone.js or react-dropzone",
  "code-editor": "monaco-editor or codemirror",
  "styling": "tailwindcss or styled-components",
  "routing": "react-router or vue-router",
  "state-management": "zustand or redux or pinia"
}
```

#### Recommended Stack Options

1. **React + Next.js + Tailwind CSS + Axios**
2. **Vue 3 + Nuxt + Tailwind CSS + Fetch**
3. **Svelte + SvelteKit + Tailwind CSS + Fetch**

### 3. State Management Requirements

#### Global State Needs

```javascript
{
  // API Configuration
  apiBaseUrl: 'http://localhost:5000',

  // Chat State
  chatHistory: [],
  currentThreadId: null,

  // Code Review State
  reviewResults: null,
  uploadedFiles: [],

  // UI State
  isLoading: false,
  errors: [],
  rateLimit: {
    remaining: 100,
    resetTime: null
  }
}
```

---

## Data Models & Types

### TypeScript Interfaces (Copy these to your frontend)

```typescript
// Chat Types
interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  threadId: string;
}

// Code Review Types
interface CodeReviewRequest {
  code: string;
  filename?: string;
  threadId?: string;
}

interface CodeIssue {
  type: "bug" | "warning" | "suggestion" | "security";
  severity: "low" | "medium" | "high" | "critical";
  line?: number;
  description: string;
  suggestion?: string;
}

interface CodeQuality {
  readability: number; // 1-10
  maintainability: number; // 1-10
  complexity: "Low" | "Medium" | "High";
}

interface CodeReviewResult {
  summary: string;
  issues: CodeIssue[];
  suggestions: string[];
  securityConcerns: string[];
  codeQuality: CodeQuality;
  threadId: string;
}

interface CodeReviewResponse {
  success: boolean;
  data: CodeReviewResult & {
    filesAnalyzed?: {
      filename: string;
      language: string;
      size: number;
    }[];
  };
}

// API Response Types
interface ApiError {
  error: string;
  message: string;
  dailyLimit?: number;
  resetTime?: string;
}

interface RateLimit {
  general: string;
  ai: string;
  aiDaily: string;
}
```

---

## Integration Examples

### 1. Chat Implementation (React)

```typescript
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(`${API_BASE}/api/ai/chat`, {
        message: content,
        threadId,
      });

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.message,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setThreadId(response.data.threadId);
    } catch (error) {
      console.error("Chat error:", error);
      // Handle error - show error message
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
}
```

### 2. Code Review Implementation (React)

```typescript
export function useCodeReview() {
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const reviewText = async (code: string, filename?: string) => {
    setIsLoading(true);

    try {
      const response = await axios.post<CodeReviewResponse>(
        `${API_BASE}/api/ai/review-text`,
        { code, filename }
      );

      setReviewResult(response.data.data);
    } catch (error) {
      console.error("Review error:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const reviewFiles = async (files: File[]) => {
    setIsLoading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post<CodeReviewResponse>(
        `${API_BASE}/api/ai/review-files`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setReviewResult(response.data.data);
    } catch (error) {
      console.error("File review error:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return { reviewResult, reviewText, reviewFiles, isLoading };
}
```

### 3. File Upload Component

```typescript
import { useDropzone } from "react-dropzone";

const SUPPORTED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".php",
  ".rb",
  ".go",
  ".rs",
  ".swift",
  // ... add all supported extensions
];

export function FileUpload({ onFiles }: { onFiles: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/*": SUPPORTED_EXTENSIONS,
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: onFiles,
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-8">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <p>Drag & drop files here, or click to select</p>
      )}
    </div>
  );
}
```

---

## Rate Limiting & Error Handling

### Rate Limits (Important!)

- **General API**: 100 requests per 15 minutes per IP
- **AI Endpoints**: 20 (prod) / 50 (dev) requests per 15 minutes per IP
- **Daily AI Limit**: 50 requests per day per IP

### Error Response Handling

```typescript
interface ApiError {
  error: string;
  message: string;
  dailyLimit?: number;
  resetTime?: string;
}

function handleApiError(error: any) {
  if (error.response?.status === 429) {
    const data: ApiError = error.response.data;

    if (data.error === "Daily AI limit exceeded") {
      // Show daily limit exceeded message
      alert(
        `Daily limit of ${data.dailyLimit} requests exceeded. Try again in ${data.resetTime}`
      );
    } else {
      // Show rate limit exceeded message
      alert("Rate limit exceeded. Please try again later.");
    }
  } else if (error.response?.status === 400) {
    // Validation error
    alert(error.response.data.message);
  } else {
    // General error
    alert("An error occurred. Please try again.");
  }
}
```

### Rate Limit Display Component

```typescript
export function RateLimitDisplay() {
  const [rateLimits, setRateLimits] = useState<RateLimit | null>(null);

  useEffect(() => {
    // Fetch rate limit info from root endpoint
    axios
      .get(`${API_BASE}/`)
      .then((response) => setRateLimits(response.data.rateLimits));
  }, []);

  return (
    <div className="text-sm text-gray-600">
      <h3>Rate Limits</h3>
      <ul>
        <li>General: {rateLimits?.general}</li>
        <li>AI Requests: {rateLimits?.ai}</li>
        <li>Daily AI: {rateLimits?.aiDaily}</li>
      </ul>
    </div>
  );
}
```

---

## Authentication & Security

### CORS Configuration

The backend is configured to accept requests from any origin in development, but you'll need to set `CORS_ORIGIN` environment variable in production.

### No Authentication Required

The API doesn't require authentication tokens, but it's protected by:

- Rate limiting per IP address
- File type validation
- Payload size limits
- Security headers (Helmet.js)

### Security Best Practices for Frontend

1. **Validate file types** before upload
2. **Show file size limits** to users
3. **Handle rate limit errors** gracefully
4. **Don't expose sensitive data** in client code
5. **Implement client-side validation** for better UX

---

## Deployment Considerations

### Environment Variables for Production

Set these in your frontend deployment:

```env
# Frontend Environment Variables
VITE_API_BASE_URL=https://your-backend-url.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.vercel.app
```

### Backend Requirements

Make sure the backend has these environment variables set:

```env
NODE_ENV=production
GOOGLE_API_KEY=your_google_ai_api_key
CORS_ORIGIN=https://your-frontend-url.com
```

### Deployment Platforms

Your frontend can be deployed on:

- **Vercel** (recommended for Next.js)
- **Netlify** (great for static sites)
- **GitHub Pages** (for simple React apps)
- **Cloudflare Pages**
- **AWS Amplify**

### API Endpoint Configuration

Create a config file in your frontend:

```typescript
// config/api.ts
export const API_CONFIG = {
  baseUrl:
    process.env.NODE_ENV === "production"
      ? "https://your-backend-url.vercel.app"
      : "http://localhost:5000",

  endpoints: {
    chat: "/api/ai/chat",
    reviewText: "/api/ai/review-text",
    reviewFiles: "/api/ai/review-files",
    languages: "/api/ai/languages",
    guidelines: "/api/ai/guidelines",
  },
};
```

---

## Example UI Components Structure

```
src/
├── components/
│   ├── Chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   └── MessageInput.tsx
│   ├── CodeReview/
│   │   ├── CodeEditor.tsx
│   │   ├── FileUpload.tsx
│   │   ├── ReviewResults.tsx
│   │   └── IssuesList.tsx
│   ├── Common/
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   └── Dashboard/
│       ├── ApiStatus.tsx
│       └── RateLimitDisplay.tsx
├── hooks/
│   ├── useChat.ts
│   ├── useCodeReview.ts
│   └── useApiStatus.ts
├── types/
│   └── api.ts
├── config/
│   └── api.ts
└── pages/
    ├── index.tsx
    ├── chat.tsx
    ├── review.tsx
    └── about.tsx
```

---

## Getting Started Checklist

### Backend Setup

- [ ] Backend is running on port 5000
- [ ] `GOOGLE_API_KEY` is configured
- [ ] API responds to `GET /` request
- [ ] CORS is properly configured

### Frontend Setup

- [ ] Install HTTP client (axios/fetch)
- [ ] Configure API base URL
- [ ] Implement error handling
- [ ] Add rate limit monitoring
- [ ] Test file upload functionality
- [ ] Test chat functionality
- [ ] Test code review functionality

### Testing

- [ ] Test rate limiting behavior
- [ ] Test file upload with different file types
- [ ] Test large file uploads (>5MB should fail)
- [ ] Test chat conversation continuity
- [ ] Test error scenarios

---

## Support & Troubleshooting

### Common Issues

1. **CORS Errors**: Set `CORS_ORIGIN` in backend environment
2. **Rate Limit Exceeded**: Implement proper error handling and user feedback
3. **File Upload Fails**: Check file type and size limits
4. **Chat Doesn't Work**: Verify `GOOGLE_API_KEY` is set in backend

### API Testing

Use these curl commands to test the backend:

```bash
# Test API status
curl http://localhost:5000/

# Test chat
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test code review
curl -X POST http://localhost:5000/api/ai/review-text \
  -H "Content-Type: application/json" \
  -d '{"code": "console.log(\"hello\");", "filename": "test.js"}'
```

This backend is production-ready and well-structured for frontend integration. Focus on creating a clean, responsive UI that handles the rate limiting gracefully and provides good user feedback for the AI-powered features.
