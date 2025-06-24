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
