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
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(express.text({ type: "text/plain", limit: "1mb" }));
app.use((req, res, next) => {
  if (req.headers["content-type"] === "text/plain;charset=UTF-8" && req.body) {
    try {
      req.body = JSON.parse(req.body);
    } catch (error) {
      console.error("Failed to parse text/plain body as JSON:", error);
    }
  }
  next();
});

const generalLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, // 20 requests per 24 hours per IP
  message: {
    error: "Daily general limit exceeded",
    message:
      "You have exceeded your daily limit of 20 requests. Please try again tomorrow.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit based on IP address + date
    const today = new Date().toISOString().split("T")[0];
    const clientIp = req.ip || "unknown-ip";
    return `general-${clientIp}-${today}`;
  },
});

// AI endpoints rate limiting - 5 requests per 24 hours
const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 AI requests per 24 hours per IP
  message: {
    error: "Daily AI limit exceeded",
    message:
      "You have exceeded your daily limit of 5 AI requests. Please try again tomorrow.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit based on IP address + date
    const today = new Date().toISOString().split("T")[0];
    const clientIp = req.ip || "unknown-ip";
    return `ai-${clientIp}-${today}`;
  },
});

// Apply rate limiting to all requests
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
      general: "20 requests per 24 hours",
      ai: "5 requests per 24 hours",
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

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  });
});

// AI Routes with AI rate limiting
app.use("/api/ai", aiLimiter, aiRoutes);

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
