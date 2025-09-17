"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.optionalAuthenticate = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const users_model_1 = require("../models/users.model");
const logger_1 = __importDefault(require("../config/logger"));
// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                error: "Authentication Error",
                message: "No authorization header provided",
            });
            return;
        }
        // Check if header follows Bearer token format
        if (!authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                error: "Authentication Error",
                message: "Invalid authorization header format. Use: Bearer <token>",
            });
            return;
        }
        // Extract token
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        if (!token) {
            res.status(401).json({
                error: "Authentication Error",
                message: "No token provided",
            });
            return;
        }
        // Verify token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (jwtError) {
            if (jwtError instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({
                    error: "Authentication Error",
                    message: "Token has expired",
                });
                return;
            }
            else if (jwtError instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({
                    error: "Authentication Error",
                    message: "Invalid token",
                });
                return;
            }
            else {
                throw jwtError;
            }
        }
        // Validate token payload
        if (!decoded.id || !decoded.email) {
            res.status(401).json({
                error: "Authentication Error",
                message: "Invalid token payload",
            });
            return;
        }
        // Fetch user from database to ensure they still exist and get fresh data
        const user = await database_1.db
            .select({
            id: users_model_1.users.id,
            name: users_model_1.users.name,
            email: users_model_1.users.email,
        })
            .from(users_model_1.users)
            .where((0, drizzle_orm_1.eq)(users_model_1.users.id, decoded.id))
            .limit(1);
        if (user.length === 0) {
            res.status(401).json({
                error: "Authentication Error",
                message: "User not found",
            });
            return;
        }
        // Verify email matches (additional security check)
        if (user[0].email !== decoded.email) {
            res.status(401).json({
                error: "Authentication Error",
                message: "Token email mismatch",
            });
            return;
        }
        // Attach user to request object
        req.user = {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            role: (decoded.role === "user") ? "user" : "user", // Default to "user" for all authenticated users
        };
        next();
    }
    catch (error) {
        logger_1.default.error("Authentication middleware error", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        });
        res.status(500).json({
            error: "Internal Server Error",
            message: "Something went wrong during authentication",
        });
    }
};
exports.authenticate = authenticate;
// Optional authentication middleware (doesn't fail if no token provided)
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // If no auth header, continue without authentication
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            next();
            return;
        }
        // Try to authenticate, but don't fail if it doesn't work
        await (0, exports.authenticate)(req, res, (err) => {
            if (err) {
                // Log the error but continue without authentication
                logger_1.default.warn("Optional authentication failed", {
                    error: err instanceof Error ? err.message : String(err),
                    timestamp: new Date().toISOString(),
                });
            }
            next();
        });
    }
    catch (error) {
        // Log error but continue without authentication
        logger_1.default.warn("Optional authentication middleware error", {
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
        });
        next();
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
// Role-based authorization middleware
const authorize = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: "Authentication Error",
                message: "User not authenticated",
            });
            return;
        }
        const userRole = req.user.role || "user";
        if (!requiredRoles.includes(userRole)) {
            res.status(403).json({
                error: "Authorization Error",
                message: "Insufficient permissions",
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
