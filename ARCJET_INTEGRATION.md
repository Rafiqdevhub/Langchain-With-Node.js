# Arcjet Security Integration

This application has been successfully integrated with **Arcjet** security features to provide advanced protection against various threats.

## Security Features Implemented

### 1. **Bot Detection & Blocking**

- Automatically detects and blocks malicious bots
- Allows legitimate search engine crawlers and preview services
- Real-time analysis of request patterns

### 2. **Security Shield**

- Protection against common web attacks
- Blocks suspicious requests based on threat intelligence
- Real-time security monitoring

### 3. **Rate Limiting**

- Dynamic rate limiting based on user roles:
  - **Guest users**: 5 requests per minute
  - **Authenticated users**: 10 requests per minute
  - **Admin users**: 20 requests per minute
- Sliding window algorithm for accurate rate limiting

## 📁 Files Modified

### 1. **Security Middleware** (`src/middleware/security.middleware.ts`)

- Core Arcjet integration
- Role-based rate limiting logic
- Comprehensive error handling and logging
- Bot detection and shield protection

### 2. **Arcjet Configuration** (`src/config/arcjet.ts`)

- Central Arcjet client configuration
- Shield, bot detection, and base rate limit rules
- Environment-based configuration

### 3. **Main Application** (`src/index.ts`)

- Replaced `express-rate-limit` with Arcjet middleware
- Global security middleware application
- Updated API documentation

### 4. **Routes** (`src/routes/ai.routes.ts`)

- Security middleware integration (applied globally)
- Consistent protection across all endpoints

### 5. **Middleware Index** (`src/middleware/index.ts`)

- Centralized middleware exports

## 🚀 Setup Instructions

### 1. **Environment Configuration**

Create a `.env` file with your Arcjet API key:

```bash
ARCJET_KEY=your_arcjet_api_key_here
```

### 2. **Get Arcjet API Key**

1. Visit [Arcjet.com](https://arcjet.com)
2. Sign up for an account
3. Create a new project
4. Copy your API key to the `.env` file

### 3. **Install Dependencies**

```bash
npm install
```

### 4. **Run the Application**

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 🛡️ Security Benefits

### **Before Arcjet**

- Basic express-rate-limit (24-hour windows)
- No bot protection
- No threat intelligence
- Limited attack detection

### **After Arcjet**

- Advanced real-time threat detection
- Intelligent bot filtering
- Role-based dynamic rate limiting
- Comprehensive security logging
- Protection against sophisticated attacks

## 📊 Monitoring & Logging

The security middleware provides detailed logging for:

- Blocked bot requests
- Shield-blocked threats
- Rate limit violations
- Security errors

Logs include:

- IP addresses
- User agents
- Request paths
- Request methods
- Timestamps

## 🔧 Configuration Options

You can customize the security settings by modifying:

### Rate Limits (`src/middleware/security.middleware.ts`)

```typescript
case "admin":
    limit = 20; // requests per minute
    break;
case "user":
    limit = 10; // requests per minute
    break;
case "guest":
    limit = 5;  // requests per minute
    break;
```

### Arcjet Rules (`src/config/arcjet.ts`)

```typescript
rules: [
  shield({ mode: "LIVE" }), // Security shield
  detectBot({
    // Bot detection
    mode: "LIVE",
    allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
  }),
  slidingWindow({
    // Base rate limit
    mode: "LIVE",
    interval: "2s",
    max: 5,
  }),
];
```

## 📈 API Response Changes

The API now includes updated security information:

```json
{
  "status": "API is running",
  "version": "2.0.0",
  "description": "AI-powered code review and chatbot service with Arcjet security",
  "security": {
    "provider": "Arcjet",
    "features": [
      "Bot detection and blocking",
      "Security threat shield",
      "Rate limiting (5 requests/min for guests, 10 for users, 20 for admins)",
      "Real-time request analysis"
    ]
  }
}
```

## 🚨 Error Responses

The middleware returns structured error responses:

### Bot Detection

```json
{
  "error": "Forbidden",
  "message": "Automated requests are not allowed"
}
```

### Security Shield

```json
{
  "error": "Forbidden",
  "message": "Request blocked by security policy"
}
```

### Rate Limiting

```json
{
  "error": "Forbidden",
  "message": "Too many requests"
}
```

## ✅ Testing

The integration has been tested and verified:

- ✅ TypeScript compilation successful
- ✅ Server starts without errors
- ✅ Middleware loads correctly
- ✅ Security rules are active
- ✅ Error handling works properly

## 🔄 Next Steps

1. **Monitor Security Events**: Check Arcjet dashboard for security insights
2. **Fine-tune Rules**: Adjust rate limits based on usage patterns
3. **Add User Authentication**: Implement proper user roles for enhanced rate limiting
4. **Custom Rules**: Add application-specific security rules as needed

## 📚 Additional Resources

- [Arcjet Documentation](https://docs.arcjet.com/)
- [Arcjet Node.js Guide](https://docs.arcjet.com/get-started/nodejs)
- [Rate Limiting Guide](https://docs.arcjet.com/rate-limiting/quick-start)
- [Bot Detection Guide](https://docs.arcjet.com/bot-protection/quick-start)
