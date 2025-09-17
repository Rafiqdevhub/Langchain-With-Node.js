import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { users } from "../models/users.model";
import logger from "../config/logger";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role?: "user" | "guest";
  };
}

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Helper function to generate JWT token
const generateToken = (userId: number, email: string): string => {
  const payload = {
    id: userId,
    email,
    role: "user",
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password }: RegisterRequest = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        error: "Validation Error",
        message: "Name, email, and password are required",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: "Validation Error",
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Validation Error",
        message: "Please provide a valid email address",
      });
      return;
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(409).json({
        error: "Conflict",
        message: "User with this email already exists",
      });
      return;
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        created_at: users.created_at,
      });

    if (newUser.length === 0) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to create user",
      });
      return;
    }

    const token = generateToken(newUser[0].id, newUser[0].email);

    logger.info("User registered successfully", {
      userId: newUser[0].id,
      email: newUser[0].email,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        created_at: newUser[0].created_at,
      },
      token,
    });
  } catch (error) {
    logger.error("Registration error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong during registration",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "Validation Error",
        message: "Email and password are required",
      });
      return;
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      res.status(401).json({
        error: "Authentication Error",
        message: "Invalid email or password",
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);

    if (!isValidPassword) {
      res.status(401).json({
        error: "Authentication Error",
        message: "Invalid email or password",
      });
      return;
    }

    const token = generateToken(user[0].id, user[0].email);

    logger.info("User logged in successfully", {
      userId: user[0].id,
      email: user[0].email,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        created_at: user[0].created_at,
      },
      token,
    });
  } catch (error) {
    logger.error("Login error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong during login",
    });
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication Error",
        message: "User not authenticated",
      });
      return;
    }

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (user.length === 0) {
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: user[0],
    });
  } catch (error) {
    logger.error("Get profile error", {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong while fetching profile",
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication Error",
        message: "User not authenticated",
      });
      return;
    }

    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({
        error: "Validation Error",
        message: "Name is required and must be a non-empty string",
      });
      return;
    }

    const updatedUser = await db
      .update(users)
      .set({
        name: name.trim(),
        updated_at: new Date(),
      })
      .where(eq(users.id, req.user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        updated_at: users.updated_at,
      });

    if (updatedUser.length === 0) {
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    logger.info("User profile updated", {
      userId: req.user.id,
      newName: name.trim(),
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    logger.error("Update profile error", {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong while updating profile",
    });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication Error",
        message: "User not authenticated",
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        error: "Validation Error",
        message: "Current password and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        error: "Validation Error",
        message: "New password must be at least 6 characters long",
      });
      return;
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (user.length === 0) {
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user[0].password
    );

    if (!isValidPassword) {
      res.status(401).json({
        error: "Authentication Error",
        message: "Current password is incorrect",
      });
      return;
    }

    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await db
      .update(users)
      .set({
        password: hashedNewPassword,
        updated_at: new Date(),
      })
      .where(eq(users.id, req.user.id));

    logger.info("User password changed", {
      userId: req.user.id,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error("Change password error", {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong while changing password",
    });
  }
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user) {
      logger.info("User logged out", {
        userId: req.user.id,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    logger.error("Logout error", {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong during logout",
    });
  }
};
