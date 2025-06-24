# LangChain Chatbot API Documentation

This document provides detailed information about the API endpoints available in this service.

## Base URL

```
http://localhost:5000
```

## Authentication

Currently, the API does not implement authentication. This is suitable for local development but should be enhanced before production deployment.

## Endpoints

### Get API Status

```
GET /
```

Returns the status of the API.

#### Response

```json
{
  "status": "API is running",
  "version": "1.0.0",
  "endpoints": ["/api/ai/chat"]
}
```

### Send Chat Message

```
POST /api/ai/chat
```

Send a message to the AI chatbot and receive a response.

#### Request Body

| Field    | Type   | Description                                        |
| -------- | ------ | -------------------------------------------------- |
| message  | string | The message to send to the chatbot (required)      |
| threadId | string | Thread ID for continuing a conversation (optional) |

Example:

```json
{
  "message": "Hello, how are you?",
  "threadId": "1234-5678-abcd-efgh"
}
```

#### Response

| Field    | Type   | Description                                |
| -------- | ------ | ------------------------------------------ |
| message  | string | The response from the chatbot              |
| threadId | string | Thread ID for continuing this conversation |

Example:

```json
{
  "message": "I'm doing well, thank you for asking! How can I help you today?",
  "threadId": "1234-5678-abcd-efgh"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request (e.g., missing required fields)
- `500 Internal Server Error`: Server-side error

Error responses include a JSON object with an error message:

```json
{
  "error": "Error message here"
}
```

## Using the API with Frontend Frameworks

### Example with React

```javascript
import { useState } from "react";

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);

    try {
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, threadId }),
      });

      const data = await response.json();

      // Add AI response to chat
      setMessages((prev) => [...prev, { text: data.message, sender: "ai" }]);

      // Save thread ID for conversation continuity
      setThreadId(data.threadId);

      // Clear input
      setInput("");
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your request.",
          sender: "system",
        },
      ]);
    }
  };

  return (
    <div>
      <div className="chat-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```

## Rate Limiting

This API implements multi-tier rate limiting to prevent abuse and ensure fair usage:

### Rate Limit Tiers

1. **General Rate Limits** (all endpoints):

   - 100 requests per 15 minutes per IP address

2. **AI Endpoint Rate Limits** (`/api/ai/*`):
   - **Short-term**: 20 requests per 15 minutes (production) / 50 requests per 15 minutes (development)
   - **Daily Limit**: **50 AI requests per day per IP address**

### Daily Limit Details

The daily limit is the primary constraint for AI usage:

- **Limit**: 50 AI requests per 24-hour period
- **Reset**: Automatically resets 24 hours after the first request
- **Tracking**: Based on IP address and calendar day
- **Priority**: Daily limit is checked before short-term limits

### Rate Limit Headers

When you make requests to the API, you'll receive the following headers:

- `RateLimit-Limit`: The maximum number of requests allowed in the time window
- `RateLimit-Remaining`: The number of requests remaining in the current window
- `RateLimit-Reset`: The time when the rate limit window resets (in Unix timestamp)

### Rate Limit Responses

#### Daily Limit Exceeded (429 Too Many Requests):

```json
{
  "error": "Daily AI limit exceeded",
  "message": "You have exceeded your daily limit of 50 AI requests. Please try again tomorrow or contact support for additional quota.",
  "dailyLimit": 50,
  "resetTime": "24 hours from first request"
}
```

#### Short-term Limit Exceeded (429 Too Many Requests):

```json
{
  "error": "AI rate limit exceeded",
  "message": "Too many AI requests from this IP, please try again later."
}
```

### Configuring Rate Limits

Rate limits can be configured through environment variables:

- `RATE_LIMIT_WINDOW_MS`: Short-term time window in milliseconds (default: 900000 = 15 minutes)
- `RATE_LIMIT_GENERAL_MAX`: Maximum general requests per window (default: 100)
- `RATE_LIMIT_AI_MAX_PROD`: Maximum AI requests per short-term window in production (default: 20)
- `RATE_LIMIT_AI_MAX_DEV`: Maximum AI requests per short-term window in development (default: 50)
- `RATE_LIMIT_DAILY_WINDOW_MS`: Daily window in milliseconds (default: 86400000 = 24 hours)
- `RATE_LIMIT_AI_DAILY_MAX`: Maximum AI requests per day (default: 50)

## Versioning

This is version 1.0.0 of the API. Future breaking changes will be released as new versions.
