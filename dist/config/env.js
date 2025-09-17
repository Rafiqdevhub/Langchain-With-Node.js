"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 5000,
    googleApiKey: process.env.GOOGLE_API_KEY || "",
    corsOrigin: process.env.CORS_ORIGIN || "",
    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",")
        : ["https://codify-omega.vercel.app", "http://localhost:3000"],
    nodeEnv: process.env.NODE_ENV || "development",
    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
    // Arcjet Security Configuration
    arcjet: {
        key: process.env.ARCJET_KEY || "",
        env: process.env.ARCJET_ENV || "development",
        mode: process.env.ARCJET_MODE || "LIVE",
    },
    rateLimits: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
        generalMax: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || "100"),
        aiMaxProd: parseInt(process.env.RATE_LIMIT_AI_MAX_PROD || "20"),
        aiMaxDev: parseInt(process.env.RATE_LIMIT_AI_MAX_DEV || "50"),
        dailyWindowMs: parseInt(process.env.RATE_LIMIT_DAILY_WINDOW_MS || "86400000"),
        aiDailyMax: parseInt(process.env.RATE_LIMIT_AI_DAILY_MAX || "50"),
        // Authentication specific rate limits
        authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
        authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "5"), // 5 auth attempts per 15 min
        profileMax: parseInt(process.env.PROFILE_RATE_LIMIT_MAX || "20"), // 20 profile requests per 15 min
    },
};
