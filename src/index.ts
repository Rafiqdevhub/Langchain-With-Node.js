import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config/env.js";
import aiRoutes from "./routes/ai.routes.js";
import authRoutes from "./routes/auth.routes.js";
import {
  securityMiddleware,
  requestLogger,
  optionalAuthenticate,
} from "./middleware/index.js";

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
    // origin: config.corsOrigins,
    origin: ["http://localhost:3000", "https://codify-omega.vercel.app/"],
    credentials: true,
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
      console.error(
        `[${new Date().toISOString()}] Failed to parse text/plain body as JSON:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
  next();
});

app.use(requestLogger);

app.use(optionalAuthenticate);
app.use(securityMiddleware);

app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    version: "2.0.0",
    description:
      "AI-powered code review and chatbot service with Arcjet security and user authentication",
    endpoints: [
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/profile",
      "/api/auth/logout",
      "/api/ai/chat",
      "/api/ai/review-text",
      "/api/ai/review-files",
      "/api/ai/languages",
      "/api/ai/guidelines",
    ],
    security: {
      provider: "Arcjet",
      features:
        config.nodeEnv === "development"
          ? [
              "ALL SECURITY DISABLED in development mode for unrestricted testing",
              "No bot detection, no rate limiting, no security shield",
              "Perfect for development and testing",
              "JWT-based authentication still available",
            ]
          : [
              "Bot detection and blocking",
              "Security threat shield",
              "Dynamic rate limiting (10 requests/day per IP for guests, 100 requests/day for users)",
              "Real-time request analysis",
              "JWT-based authentication",
            ],
    },
    features: [
      "User registration and authentication",
      "JWT token-based sessions",
      "User profile management",
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

app.use("/api/auth", authRoutes);
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

    console.error(
      `[${new Date().toISOString()}] Server error occurred:`,
      err.message,
      statusCode
    );

    res.status(statusCode).json({
      error: "Server Error",
      ...errorDetails,
    });
  }
);

const server = app.listen(config.port, () => {
  console.log(
    `[${new Date().toISOString()}] Server started successfully on port ${
      config.port
    } (${config.nodeEnv.toUpperCase()})`
  );
  console.log(
    `[${new Date().toISOString()}] Server URL: http://localhost:${config.port}`
  );
});

process.on("SIGTERM", () => {
  console.log(
    `[${new Date().toISOString()}] SIGTERM signal received: closing HTTP server`
  );
  server.close(() => {
    console.log(`[${new Date().toISOString()}] HTTP server closed gracefully`);
    process.exit(0);
  });
});

export default app;
