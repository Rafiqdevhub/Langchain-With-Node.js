import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  googleApiKey: process.env.GOOGLE_API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "",
  nodeEnv: process.env.NODE_ENV || "development",
} as const;
