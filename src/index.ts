import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config/env";
import aiRoutes from "./routes/ai.routes";
import { securityMiddleware, requestLogger } from "./middleware";
import logger from "./config/logger";

const app = express();

// Trust proxy for proper IP detection in development/production
if (config.nodeEnv === "development") {
  app.set("trust proxy", true);
} else {
  app.set("trust proxy", 1);
}

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
      logger.error("Failed to parse text/plain body as JSON", {
        error: error instanceof Error ? error.message : String(error),
        headers: req.headers,
        url: req.url,
      });
    }
  }
  next();
});

app.use(securityMiddleware);
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    version: "2.0.0",
    description:
      "AI-powered code review and chatbot service with Arcjet security",
    endpoints: [
      "/api/ai/chat",
      "/api/ai/review-text",
      "/api/ai/review-files",
      "/api/ai/languages",
      "/api/ai/guidelines",
    ],
    security: {
      provider: "Arcjet",
      features: [
        "Bot detection and blocking",
        "Security threat shield",
        "Rate limiting (5 requests/min for guests, 10 for users, 20 for admins)",
        "Real-time request analysis",
      ],
    },
    features: [
      "AI Chatbot with conversation memory",
      "Code review for text input",
      "Multi-file code analysis",
      "Security vulnerability detection",
      "Code quality assessment",
      "Support for 25+ programming languages",
      "Advanced security protection via Arcjet",
    ],
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "2.0.0",
  });
});

app.use("/api/ai", aiRoutes);

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

    logger.error("Server error occurred", {
      error: err.message,
      stack: err.stack,
      statusCode,
      timestamp: new Date().toISOString(),
    });

    res.status(statusCode).json({
      error: "Server Error",
      ...errorDetails,
    });
  }
);

const server = app.listen(config.port, () => {
  logger.info("Server started successfully", {
    environment: config.nodeEnv.toUpperCase(),
    port: config.port,
    url: `http://localhost:${config.port}`,
    timestamp: new Date().toISOString(),
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed gracefully");
    process.exit(0);
  });
});

export default app;
