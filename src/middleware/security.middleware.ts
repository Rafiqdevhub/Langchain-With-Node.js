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
        limit = 100; // 100 requests per day for authenticated users
        interval = "1d";
        break;
      case "guest":
        limit = 10; // 10 requests per IP address per day for guests
        interval = "1d";
        break;
      default:
        limit = 10; // Default to guest limits
        interval = "1d";
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

      const limitDescription =
        role === "guest"
          ? `${limit} requests per day per IP address`
          : `${limit} requests per day`;

      res.status(429).json({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Limit: ${limitDescription}. ${
          role === "guest"
            ? "Consider registering for higher limits."
            : "Please try again tomorrow."
        }`,
        retryAfter: 86400, // 24 hours in seconds
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
