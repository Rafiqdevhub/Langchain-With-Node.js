import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { users } from "../models/users.model.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role?: "user" | "guest";
  };
}

interface JWTPayload {
  id: number;
  email: string;
  role?: "user" | "guest";
  iat?: number;
  exp?: number;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: "Authentication Error",
        message: "No authorization header provided",
      });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Authentication Error",
        message: "Invalid authorization header format. Use: Bearer <token>",
      });
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        error: "Authentication Error",
        message: "No token provided",
      });
      return;
    }

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

    if (!decoded.id || !decoded.email) {
      res.status(401).json({
        error: "Authentication Error",
        message: "Invalid token payload",
      });
      return;
    }

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

    if (user[0].email !== decoded.email) {
      res.status(401).json({
        error: "Authentication Error",
        message: "Token email mismatch",
      });
      return;
    }

    req.user = {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: decoded.role === "user" ? "user" : "user",
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

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      if (!decoded.id || !decoded.email) {
        next();
        return;
      }

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
        next();
        return;
      }

      if (user[0].email !== decoded.email) {
        next();
        return;
      }

      req.user = {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        role: decoded.role === "user" ? "user" : "user",
      };
    } catch (authError) {
      console.log(
        `[${new Date().toISOString()}] Optional authentication failed:`,
        authError instanceof Error ? authError.message : String(authError)
      );
    }

    next();
  } catch (error) {
    console.log(
      `[${new Date().toISOString()}] Optional authentication middleware error:`,
      error instanceof Error ? error.message : String(error)
    );
    next();
  }
};

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
