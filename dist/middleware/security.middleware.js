"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@arcjet/node");
const arcjet_1 = __importDefault(require("../config/arcjet"));
const logger_1 = __importDefault(require("../config/logger"));
const securityMiddleware = async (req, res, next) => {
    try {
        // Determine user role and set appropriate rate limit
        const role = req.user?.role || "guest";
        // Enhanced rate limiting based on user authentication status
        let limit;
        let interval;
        switch (role) {
            case "user":
                limit = 15; // Increased limit for authenticated users
                interval = "1m";
                break;
            case "guest":
                limit = 5; // Stricter limit for unauthenticated users
                interval = "1m";
                break;
            default:
                limit = 5;
                interval = "1m";
                break;
        }
        // Create client with dynamic rate limiting
        const client = arcjet_1.default.withRule((0, node_1.slidingWindow)({
            mode: "LIVE",
            interval: interval,
            max: limit,
        }));
        const decision = await client.protect(req);
        if (decision.isDenied() && decision.reason.isBot()) {
            logger_1.default.warn("Bot request blocked", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
                userId: req.user?.id,
                userRole: role,
            });
            res.status(403).json({
                error: "Forbidden",
                message: "Automated requests are not allowed",
            });
            return;
        }
        if (decision.isDenied() && decision.reason.isShield()) {
            logger_1.default.warn("Shield blocked request", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
                method: req.method,
                userId: req.user?.id,
                userRole: role,
            });
            res.status(403).json({
                error: "Forbidden",
                message: "Request blocked by security policy",
            });
            return;
        }
        if (decision.isDenied() && decision.reason.isRateLimit()) {
            logger_1.default.warn("Rate limit exceeded", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
                userId: req.user?.id,
                userRole: role,
                limit: limit,
                interval: interval,
            });
            res.status(429).json({
                error: "Too Many Requests",
                message: `Rate limit exceeded. ${role === "guest"
                    ? "Consider registering for higher limits."
                    : `Limit: ${limit} requests per minute.`}`,
                retryAfter: 60, // seconds
            });
            return;
        }
        next();
    }
    catch (e) {
        logger_1.default.error("Arcjet middleware error", {
            error: e instanceof Error ? e.message : String(e),
            stack: e instanceof Error ? e.stack : undefined,
            timestamp: new Date().toISOString(),
            userId: req.user?.id,
        });
        res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong with security middleware",
        });
    }
};
exports.default = securityMiddleware;
