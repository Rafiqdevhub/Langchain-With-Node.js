import { slidingWindow } from "@arcjet/node";
import { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet";
import logger from "../config/logger";

interface User {
  role?: "admin" | "user" | "guest";
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

interface ErrorResponse {
  error: string;
  message: string;
}

const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role: string = (req as AuthenticatedRequest).user?.role || "guest";

    let limit: number;

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

    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: limit,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn("Bot request blocked", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
      });

      res.status(403).json({
        error: "Forbidden",
        message: "Automated requests are not allowed",
      } as ErrorResponse);
      return;
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn("Shield Blocked request", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
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
      });

      res.status(403).json({
        error: "Forbidden",
        message: "Too many requests",
      } as ErrorResponse);
      return;
    }

    next();
  } catch (e: unknown) {
    logger.error("Arcjet middleware error", {
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong with security middleware",
    } as ErrorResponse);
  }
};
export default securityMiddleware;
