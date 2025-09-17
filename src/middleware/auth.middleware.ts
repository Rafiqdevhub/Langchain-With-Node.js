import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { users } from "../models/users.model.js";

// Environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Extended Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role?: "user" | "guest";
  };
}

// JWT payload interface
interface JWTPayload {
  id: number;
  email: string;
  role?: "user" | "guest";
  iat?: number;
  exp?: number;
}

// Authentication middleware
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          error: "Authentication Error",
          message: "Token has expired",
        });
        return;
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          error: "Authentication Error",
          message: "Invalid token",
        });
        return;
      } else {
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
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, decoded.id))
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
      role: decoded.role === "user" ? "user" : "user", // Default to "user" for all authenticated users
    };

    next();
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Authentication middleware error:`,
      error instanceof Error ? error.message : String(error)
    );

    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong during authentication",
    });
  }
};

// Optional authentication middleware (doesn't fail if no token provided)
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without authentication
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    // Try to authenticate, but don't fail if it doesn't work
    await authenticate(req, res, (err?: any) => {
      if (err) {
        // Log the error but continue without authentication
        console.log(
          `[${new Date().toISOString()}] Optional authentication failed:`,
          err instanceof Error ? err.message : String(err)
        );
      }
      next();
    });
  } catch (error) {
    // Log error but continue without authentication
    console.log(
      `[${new Date().toISOString()}] Optional authentication middleware error:`,
      error instanceof Error ? error.message : String(error)
    );
    next();
  }
};

// Role-based authorization middleware
export const authorize = (requiredRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
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
