# Production Deployment Guide

This guide will help you deploy the LangChain Chatbot API to various platforms.

## Prerequisites

Before deploying, make sure to:

1. Set up environment variables on your hosting platform:

   - `PORT`: The port your application will run on (often set automatically by the platform)
   - `NODE_ENV`: Set to "production"
   - `GOOGLE_API_KEY`: Your Google Gemini API key
   - `CORS_ORIGIN`: The URL of your frontend application (for CORS protection)

2. Build the application:
   ```bash
   npm run build
   ```

## Deployment Options

### 1. Heroku

1. Install the Heroku CLI and login:

   ```bash
   heroku login
   ```

2. Create a new Heroku app:

   ```bash
   heroku create your-app-name
   ```

3. Set environment variables:

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set GOOGLE_API_KEY=your-google-api-key
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

### 2. Railway

1. Connect your GitHub repository to Railway
2. Create a new project from the repository
3. Set environment variables in the Railway dashboard
4. Deploy the project

### 3. Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `npm install && npm run build`
4. Set the start command: `npm start`
5. Add environment variables in the Render dashboard
6. Deploy the service

### 4. Docker

1. Build the Docker image:

   ```bash
   docker build -t langchain-chatbot-api .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 \
     -e NODE_ENV=production \
     -e GOOGLE_API_KEY=your-google-api-key \
     -e CORS_ORIGIN=https://your-frontend-domain.com \
     langchain-chatbot-api
   ```

## Production Best Practices

This API includes several production best practices:

1. **Security Headers**: Using Helmet to set security headers
2. **Rate Limiting**: Consider adding rate limiting for production
3. **Compression**: Response compression for faster transfer
4. **CORS Protection**: Restricting access to known origins
5. **Error Handling**: Production-appropriate error messages
6. **Graceful Shutdown**: Proper server shutdown on SIGTERM signals

## Monitoring & Logging

Consider adding a monitoring solution such as:

- New Relic
- Datadog
- Sentry (for error tracking)

For logging, consider:

- Winston or Pino for structured logging
- A log aggregation service (e.g., Loggly, Papertrail)
