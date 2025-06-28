"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production" ? env_1.config.corsOrigin : "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Performance middlewares
app.use((0, compression_1.default)()); // Compress responses
app.use(express_1.default.json({ limit: "1mb" })); // Limit payload size
// Rate limiting
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.config.rateLimits.windowMs,
    max: env_1.config.rateLimits.generalMax,
    message: {
        error: "Too many requests",
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Stricter rate limiting for AI endpoints
const aiLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.config.rateLimits.windowMs,
    max: env_1.config.nodeEnv === "production"
        ? env_1.config.rateLimits.aiMaxProd
        : env_1.config.rateLimits.aiMaxDev,
    message: {
        error: "AI rate limit exceeded",
        message: "Too many AI requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Daily rate limiter for AI endpoints (50 requests per day)
const aiDailyLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.config.rateLimits.dailyWindowMs, // 24 hours
    max: env_1.config.rateLimits.aiDailyMax, // 50 requests per day
    message: {
        error: "Daily AI limit exceeded",
        message: `You have exceeded your daily limit of ${env_1.config.rateLimits.aiDailyMax} AI requests. Please try again tomorrow or contact support for additional quota.`,
        dailyLimit: env_1.config.rateLimits.aiDailyMax,
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
            "/api/ai/guidelines"
        ],
        rateLimits: {
            general: `${env_1.config.rateLimits.generalMax} requests per ${env_1.config.rateLimits.windowMs / 60000} minutes`,
            ai: `${env_1.config.nodeEnv === "production"
                ? env_1.config.rateLimits.aiMaxProd
                : env_1.config.rateLimits.aiMaxDev} requests per ${env_1.config.rateLimits.windowMs / 60000} minutes`,
            aiDaily: `${env_1.config.rateLimits.aiDailyMax} AI requests per day`,
        },
        features: [
            "AI Chatbot with conversation memory",
            "Code review for text input",
            "Multi-file code analysis",
            "Security vulnerability detection",
            "Code quality assessment",
            "Support for 25+ programming languages"
        ]
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
app.use("/api/ai", aiDailyLimiter, aiLimiter, ai_routes_1.default);
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: "The requested resource does not exist",
    });
});
app.use((err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    const errorDetails = env_1.config.nodeEnv === "production"
        ? { message: "Internal Server Error" }
        : { message: err.message, stack: err.stack };
    console.error(`[${new Date().toISOString()}] Error:`, err);
    res.status(statusCode).json({
        error: "Server Error",
        ...errorDetails,
    });
});
const server = app.listen(env_1.config.port, () => {
    console.log(`[${env_1.config.nodeEnv.toUpperCase()}] Server running on http://localhost:${env_1.config.port}`);
});
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
});
exports.default = app;
