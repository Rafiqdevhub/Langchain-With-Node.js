# Production Deployment Guide

This guide will help you deploy the LangChain Chatbot API to various platforms.

## Prerequisites

Before deploying, make sure to:

1. Set up environment variables on your hosting platform:

   - `NODE_ENV`: Set to "production"
   - `GOOGLE_API_KEY`: Your Google Gemini API key
   - `CORS_ORIGIN`: The URL of your frontend application (for CORS protection)
   - `PORT`: The port your application will run on (often set automatically by the platform)

2. Build the application locally to test:
   ```bash
   npm run build
   ```

## Deployment Platforms

### Vercel (Recommended for Serverless)

1. **Install Vercel CLI** (optional):

   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:

   ```bash
   vercel --prod
   ```

3. **Deploy via GitHub Integration**:

   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the `vercel.json` configuration
   - Set environment variables in the Vercel dashboard:
     - `GOOGLE_API_KEY`
     - `CORS_ORIGIN`
     - `NODE_ENV=production`

4. **Configuration**: The `vercel.json` file is already configured for this API-only project.

### Heroku

1. **Create a Heroku app**:

   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**:

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set GOOGLE_API_KEY=your_api_key
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

### Railway

1. **Connect your GitHub repository** to Railway
2. **Set environment variables** in Railway dashboard:
   - `NODE_ENV=production`
   - `GOOGLE_API_KEY=your_api_key`
   - `CORS_ORIGIN=https://your-frontend-domain.com`
3. **Deploy automatically** on git push

### Render

1. **Create a new Web Service** in Render
2. **Connect your GitHub repository**
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. **Set environment variables**:
   - `NODE_ENV=production`
   - `GOOGLE_API_KEY=your_api_key`
   - `CORS_ORIGIN=https://your-frontend-domain.com`

### Docker Deployment

1. **Build the Docker image**:

   ```bash
   docker build -t langchain-chatbot-api .
   ```

2. **Run locally**:

   ```bash
   docker run -p 3000:3000 \
     -e NODE_ENV=production \
     -e GOOGLE_API_KEY=your_api_key \
     -e CORS_ORIGIN=https://your-frontend-domain.com \
     langchain-chatbot-api
   ```

3. **Deploy to container platforms** (AWS ECS, Google Cloud Run, Azure Container Instances, etc.)

### DigitalOcean App Platform

1. **Create a new App** in DigitalOcean
2. **Connect your GitHub repository**
3. **Configure the component**:
   - Type: Web Service
   - Build Command: `npm run build`
   - Run Command: `npm start`
4. **Set environment variables**:
   - `NODE_ENV=production`
   - `GOOGLE_API_KEY=your_api_key`
   - `CORS_ORIGIN=https://your-frontend-domain.com`

## Environment Variables Reference

| Variable             | Description                             | Required | Default             |
| -------------------- | --------------------------------------- | -------- | ------------------- |
| `NODE_ENV`           | Environment mode                        | Yes      | development         |
| `PORT`               | Server port                             | No       | 3000                |
| `GOOGLE_API_KEY`     | Google Gemini API key                   | Yes      | -                   |
| `CORS_ORIGIN`        | Allowed CORS origins                    | No       | \*                  |
| `RATE_LIMIT_GENERAL` | General rate limit (requests/15min)     | No       | 100                 |
| `RATE_LIMIT_AI`      | AI endpoint rate limit (requests/15min) | No       | 20 (prod), 50 (dev) |
| `RATE_LIMIT_DAILY`   | Daily AI limit (requests/day)           | No       | 50                  |

## Health Check

After deployment, verify your API is working:

```bash
curl https://your-api-domain.com/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Testing API Endpoints

Test the chat endpoint:

```bash
curl -X POST https://your-api-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "threadId": "test-thread-123"
  }'
```

## Monitoring and Scaling

- **Logs**: Check platform-specific logging (Vercel Functions, Heroku logs, etc.)
- **Performance**: Monitor response times and rate limit usage
- **Scaling**: Most platforms auto-scale, but monitor usage patterns
- **Error Tracking**: Consider integrating services like Sentry or LogRocket

## Security Considerations

1. **Environment Variables**: Never commit API keys to version control
2. **CORS**: Set specific origins in production, not wildcards
3. **Rate Limiting**: Adjust limits based on your usage patterns
4. **HTTPS**: Ensure all platforms serve over HTTPS (most do by default)
5. **API Key Rotation**: Regularly rotate your Google API keys

## Troubleshooting

### Common Issues:

1. **Build Failures**: Ensure all dependencies are in `package.json`
2. **Environment Variables**: Double-check all required env vars are set
3. **CORS Errors**: Verify `CORS_ORIGIN` matches your frontend domain exactly
4. **Rate Limiting**: Check if you're hitting API limits
5. **Port Issues**: Let the platform set the PORT automatically

### Debug Commands:

```bash
# Check build locally
npm run build
npm start

# Test API locally
curl http://localhost:3000/health
```
