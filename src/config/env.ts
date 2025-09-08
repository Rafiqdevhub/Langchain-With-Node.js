import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  googleApiKey: process.env.GOOGLE_API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "",
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["https://codify-omega.vercel.app", "http://localhost:3000"],
  nodeEnv: process.env.NODE_ENV || "development",
  rateLimits: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    generalMax: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || "100"),
    aiMaxProd: parseInt(process.env.RATE_LIMIT_AI_MAX_PROD || "20"),
    aiMaxDev: parseInt(process.env.RATE_LIMIT_AI_MAX_DEV || "50"),
    dailyWindowMs: parseInt(
      process.env.RATE_LIMIT_DAILY_WINDOW_MS || "86400000"
    ),
    aiDailyMax: parseInt(process.env.RATE_LIMIT_AI_DAILY_MAX || "50"),
  },
} as const;
