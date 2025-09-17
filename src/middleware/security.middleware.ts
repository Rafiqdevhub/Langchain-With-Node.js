import { slidingWindow } from "@arcjet/node";
import { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet";
import logger from "../config/logger";

interface User {
  id?: number;
  email?: string;
  name?: string;
  role?: "user" | "guest";
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

interface ErrorResponse {
  error: string;
  message: string;
}

const securityMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role: string = req.user?.role || "guest";

    // Enhanced rate limiting based on user authentication status
    let limit: number;
    let interval: string;

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
    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: interval as any,
        max: limit,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn("Bot request blocked", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        userId: req.user?.id,
        userRole: role,
      });

      res.status(403).json({
        error: "Forbidden",
        message: "Automated requests are not allowed",
      } as ErrorResponse);
      return;
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn("Shield blocked request", {
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
      } as ErrorResponse);
      return;
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn("Rate limit exceeded", {
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
        message: `Rate limit exceeded. ${
          role === "guest"
            ? "Consider registering for higher limits."
            : `Limit: ${limit} requests per minute.`
        }`,
        retryAfter: 60, // seconds
      } as ErrorResponse);
      return;
    }

    next();
  } catch (e: unknown) {
    logger.error("Arcjet middleware error", {
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
    });
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong with security middleware",
    } as ErrorResponse);
  }
};
export default securityMiddleware;
