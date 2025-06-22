import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
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

app.use(compression());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    version: "1.0.0",
    endpoints: ["/api/ai/chat"],
  });
});

// AI Route
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
