import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "./config/env";
import aiRoutes from "./routes/ai.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? config.corsOrigin : "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Performance middlewares
app.use(compression()); // Compress responses
app.use(express.json({ limit: "1mb" })); // Limit payload size

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: config.rateLimits.windowMs,
  max: config.rateLimits.generalMax,
  message: {
    error: "Too many requests",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: config.rateLimits.windowMs,
  max:
    config.nodeEnv === "production"
      ? config.rateLimits.aiMaxProd
      : config.rateLimits.aiMaxDev,
  message: {
    error: "AI rate limit exceeded",
    message: "Too many AI requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Daily rate limiter for AI endpoints (50 requests per day)
const aiDailyLimiter = rateLimit({
  windowMs: config.rateLimits.dailyWindowMs, // 24 hours
  max: config.rateLimits.aiDailyMax, // 50 requests per day
  message: {
    error: "Daily AI limit exceeded",
    message: `You have exceeded your daily limit of ${config.rateLimits.aiDailyMax} AI requests. Please try again tomorrow or contact support for additional quota.`,
    dailyLimit: config.rateLimits.aiDailyMax,
    resetTime: "24 hours from first request",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP + date to create daily buckets
    const today = new Date().toISOString().split("T")[0];
    return `${req.ip}-${today}`;
  },
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    version: "2.0.0",
    description: "AI-powered code review and chatbot service",
    endpoints: [
      "/api/ai/chat",
      "/api/ai/review-text",
      "/api/ai/review-files",
      "/api/ai/languages",
      "/api/ai/guidelines",
    ],
    rateLimits: {
      general: `${config.rateLimits.generalMax} requests per ${
        config.rateLimits.windowMs / 60000
      } minutes`,
      ai: `${
        config.nodeEnv === "production"
          ? config.rateLimits.aiMaxProd
          : config.rateLimits.aiMaxDev
      } requests per ${config.rateLimits.windowMs / 60000} minutes`,
      aiDaily: `${config.rateLimits.aiDailyMax} AI requests per day`,
    },
    features: [
      "AI Chatbot with conversation memory",
      "Code review for text input",
      "Multi-file code analysis",
      "Security vulnerability detection",
      "Code quality assessment",
      "Support for 25+ programming languages",
    ],
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  });
});

// AI Routes with both regular and daily rate limiting
app.use("/api/ai", aiDailyLimiter, aiLimiter, aiRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource does not exist",
  });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    const errorDetails =
      config.nodeEnv === "production"
        ? { message: "Internal Server Error" }
        : { message: err.message, stack: err.stack };

    console.error(`[${new Date().toISOString()}] Error:`, err);

    res.status(statusCode).json({
      error: "Server Error",
      ...errorDetails,
    });
  }
);

const server = app.listen(config.port, () => {
  console.log(
    `[${config.nodeEnv.toUpperCase()}] Server running on http://localhost:${
      config.port
    }`
  );
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export default app;
