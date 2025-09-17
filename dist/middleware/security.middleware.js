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
        const role = req.user?.role || "guest";
        let limit;
        switch (role) {
            case "admin":
                limit = 20;
                break;
            case "user":
                limit = 10;
                break;
            case "guest":
                limit = 5;
                break;
            default:
                limit = 5;
                break;
        }
        const client = arcjet_1.default.withRule((0, node_1.slidingWindow)({
            mode: "LIVE",
            interval: "1m",
            max: limit,
        }));
        const decision = await client.protect(req);
        if (decision.isDenied() && decision.reason.isBot()) {
            logger_1.default.warn("Bot request blocked", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
            });
            res.status(403).json({
                error: "Forbidden",
                message: "Automated requests are not allowed",
            });
            return;
        }
        if (decision.isDenied() && decision.reason.isShield()) {
            logger_1.default.warn("Shield Blocked request", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
                method: req.method,
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
            });
            res
                .status(403)
                .json({
                error: "Forbidden",
                message: "Too many requests",
            });
            return;
        }
        next();
    }
    catch (e) {
        logger_1.default.error("Arcjet middleware error", {
            error: e instanceof Error ? e.message : String(e),
            stack: e instanceof Error ? e.stack : undefined,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong with security middleware",
        });
    }
};
exports.default = securityMiddleware;
