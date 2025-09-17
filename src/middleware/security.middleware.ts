import { slidingWindow } from "@arcjet/node";
import { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet.js";

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
      console.log(
        `[${new Date().toISOString()}] Bot request blocked - IP: ${
          req.ip
        }, Path: ${req.path}, Role: ${role}`
      );

      res.status(403).json({
        error: "Forbidden",
        message: "Automated requests are not allowed",
      } as ErrorResponse);
      return;
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      console.log(
        `[${new Date().toISOString()}] Shield blocked request - IP: ${
          req.ip
        }, Path: ${req.path}, Method: ${req.method}, Role: ${role}`
      );

      res.status(403).json({
        error: "Forbidden",
        message: "Request blocked by security policy",
      } as ErrorResponse);
      return;
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      console.log(
        `[${new Date().toISOString()}] Rate limit exceeded - IP: ${
          req.ip
        }, Path: ${req.path}, Role: ${role}, Limit: ${limit}/${interval}`
      );

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
    console.error(
      `[${new Date().toISOString()}] Arcjet middleware error:`,
      e instanceof Error ? e.message : String(e)
    );
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong with security middleware",
    } as ErrorResponse);
  }
};
export default securityMiddleware;
