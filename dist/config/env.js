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
    nodeEnv: process.env.NODE_ENV || "development",
    rateLimits: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
        generalMax: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || "100"),
        aiMaxProd: parseInt(process.env.RATE_LIMIT_AI_MAX_PROD || "20"),
        aiMaxDev: parseInt(process.env.RATE_LIMIT_AI_MAX_DEV || "50"),
        dailyWindowMs: parseInt(process.env.RATE_LIMIT_DAILY_WINDOW_MS || "86400000"),
        aiDailyMax: parseInt(process.env.RATE_LIMIT_AI_DAILY_MAX || "50"),
    },
};
