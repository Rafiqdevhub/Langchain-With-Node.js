"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const env_1 = require("./config/env");
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const middleware_1 = require("./middleware");
const logger_1 = __importDefault(require("./config/logger"));
const app = (0, express_1.default)();
// Trust proxy for proper IP detection in development/production
if (env_1.config.nodeEnv === "development") {
    app.set("trust proxy", true);
}
else {
    app.set("trust proxy", 1);
}
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.config.corsOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
app.use(express_1.default.text({ type: "text/plain", limit: "1mb" }));
app.use((req, res, next) => {
    if (req.headers["content-type"] === "text/plain;charset=UTF-8" && req.body) {
        try {
            req.body = JSON.parse(req.body);
        }
        catch (error) {
            logger_1.default.error("Failed to parse text/plain body as JSON", {
                error: error instanceof Error ? error.message : String(error),
                headers: req.headers,
                url: req.url,
            });
        }
    }
    next();
});
app.use(middleware_1.requestLogger);
// Optional authentication middleware - attempts to authenticate users but doesn't fail if no token
// This allows the security middleware to apply different rate limits based on auth status
app.use(middleware_1.optionalAuthenticate);
app.use(middleware_1.securityMiddleware);
app.get("/", (req, res) => {
    res.json({
        status: "API is running",
        version: "2.0.0",
        description: "AI-powered code review and chatbot service with Arcjet security and user authentication",
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
            features: [
                "Bot detection and blocking",
                "Security threat shield",
                "Dynamic rate limiting (5 requests/min for guests, 15 for users)",
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
app.use("/api/auth", auth_routes_1.default);
app.use("/api/ai", ai_routes_1.default);
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
    logger_1.default.error("Server error occurred", {
        error: err.message,
        stack: err.stack,
        statusCode,
        timestamp: new Date().toISOString(),
    });
    res.status(statusCode).json({
        error: "Server Error",
        ...errorDetails,
    });
});
const server = app.listen(env_1.config.port, () => {
    logger_1.default.info("Server started successfully", {
        environment: env_1.config.nodeEnv.toUpperCase(),
        port: env_1.config.port,
        url: `http://localhost:${env_1.config.port}`,
        timestamp: new Date().toISOString(),
    });
});
process.on("SIGTERM", () => {
    logger_1.default.info("SIGTERM signal received: closing HTTP server");
    server.close(() => {
        logger_1.default.info("HTTP server closed gracefully");
        process.exit(0);
    });
});
exports.default = app;
