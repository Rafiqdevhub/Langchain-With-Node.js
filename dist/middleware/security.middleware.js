"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@arcjet/node");
const arcjet_1 = __importDefault(require("../config/arcjet"));
const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || "guest";
        // Enhanced rate limiting based on user authentication status
        let limit;
        let interval;
        switch (role) {
            case "user":
                limit = 15;
                interval = "1m";
                break;
            case "guest":
                limit = 5;
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
            console.log(`[${new Date().toISOString()}] Bot request blocked - IP: ${req.ip}, Path: ${req.path}, Role: ${role}`);
            res.status(403).json({
                error: "Forbidden",
                message: "Automated requests are not allowed",
            });
            return;
        }
        if (decision.isDenied() && decision.reason.isShield()) {
            console.log(`[${new Date().toISOString()}] Shield blocked request - IP: ${req.ip}, Path: ${req.path}, Method: ${req.method}, Role: ${role}`);
            res.status(403).json({
                error: "Forbidden",
                message: "Request blocked by security policy",
            });
            return;
        }
        if (decision.isDenied() && decision.reason.isRateLimit()) {
            console.log(`[${new Date().toISOString()}] Rate limit exceeded - IP: ${req.ip}, Path: ${req.path}, Role: ${role}, Limit: ${limit}/${interval}`);
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
        console.error(`[${new Date().toISOString()}] Arcjet middleware error:`, e instanceof Error ? e.message : String(e));
        res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong with security middleware",
        });
    }
};
exports.default = securityMiddleware;
