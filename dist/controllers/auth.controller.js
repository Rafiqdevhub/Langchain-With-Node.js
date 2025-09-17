"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const users_model_1 = require("../models/users.model");
const logger_1 = __importDefault(require("../config/logger"));
// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
// Helper function to generate JWT token
const generateToken = (userId, email) => {
    const payload = {
        id: userId,
        email,
        role: "user", // Default role for new users
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
// Register controller
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Validation
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
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                error: "Validation Error",
                message: "Please provide a valid email address",
            });
            return;
        }
        // Check if user already exists
        const existingUser = await database_1.db
            .select()
            .from(users_model_1.users)
            .where((0, drizzle_orm_1.eq)(users_model_1.users.email, email.toLowerCase()))
            .limit(1);
        if (existingUser.length > 0) {
            res.status(409).json({
                error: "Conflict",
                message: "User with this email already exists",
            });
            return;
        }
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user
        const newUser = await database_1.db
            .insert(users_model_1.users)
            .values({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        })
            .returning({
            id: users_model_1.users.id,
            name: users_model_1.users.name,
            email: users_model_1.users.email,
            created_at: users_model_1.users.created_at,
        });
        if (newUser.length === 0) {
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to create user",
            });
            return;
        }
        // Generate token
        const token = generateToken(newUser[0].id, newUser[0].email);
        logger_1.default.info("User registered successfully", {
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
    }
    catch (error) {
        logger_1.default.error("Registration error", {
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
exports.register = register;
// Login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            res.status(400).json({
                error: "Validation Error",
                message: "Email and password are required",
            });
            return;
        }
        // Find user by email
        const user = await database_1.db
            .select()
            .from(users_model_1.users)
            .where((0, drizzle_orm_1.eq)(users_model_1.users.email, email.toLowerCase()))
            .limit(1);
        if (user.length === 0) {
            res.status(401).json({
                error: "Authentication Error",
                message: "Invalid email or password",
            });
            return;
        }
        // Check password
        const isValidPassword = await bcryptjs_1.default.compare(password, user[0].password);
        if (!isValidPassword) {
            res.status(401).json({
                error: "Authentication Error",
                message: "Invalid email or password",
            });
            return;
        }
        // Generate token
        const token = generateToken(user[0].id, user[0].email);
        logger_1.default.info("User logged in successfully", {
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
    }
    catch (error) {
        logger_1.default.error("Login error", {
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
exports.login = login;
// Get current user profile
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                error: "Authentication Error",
                message: "User not authenticated",
            });
            return;
        }
        // Fetch fresh user data from database
        const user = await database_1.db
            .select({
            id: users_model_1.users.id,
            name: users_model_1.users.name,
            email: users_model_1.users.email,
            created_at: users_model_1.users.created_at,
            updated_at: users_model_1.users.updated_at,
        })
            .from(users_model_1.users)
            .where((0, drizzle_orm_1.eq)(users_model_1.users.id, req.user.id))
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
    }
    catch (error) {
        logger_1.default.error("Get profile error", {
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
exports.getProfile = getProfile;
// Update user profile
const updateProfile = async (req, res) => {
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
        // Update user
        const updatedUser = await database_1.db
            .update(users_model_1.users)
            .set({
            name: name.trim(),
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(users_model_1.users.id, req.user.id))
            .returning({
            id: users_model_1.users.id,
            name: users_model_1.users.name,
            email: users_model_1.users.email,
            updated_at: users_model_1.users.updated_at,
        });
        if (updatedUser.length === 0) {
            res.status(404).json({
                error: "Not Found",
                message: "User not found",
            });
            return;
        }
        logger_1.default.info("User profile updated", {
            userId: req.user.id,
            newName: name.trim(),
            timestamp: new Date().toISOString(),
        });
        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser[0],
        });
    }
    catch (error) {
        logger_1.default.error("Update profile error", {
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
exports.updateProfile = updateProfile;
// Change password
const changePassword = async (req, res) => {
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
        // Get current user with password
        const user = await database_1.db
            .select()
            .from(users_model_1.users)
            .where((0, drizzle_orm_1.eq)(users_model_1.users.id, req.user.id))
            .limit(1);
        if (user.length === 0) {
            res.status(404).json({
                error: "Not Found",
                message: "User not found",
            });
            return;
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user[0].password);
        if (!isValidPassword) {
            res.status(401).json({
                error: "Authentication Error",
                message: "Current password is incorrect",
            });
            return;
        }
        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        // Update password
        await database_1.db
            .update(users_model_1.users)
            .set({
            password: hashedNewPassword,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(users_model_1.users.id, req.user.id));
        logger_1.default.info("User password changed", {
            userId: req.user.id,
            timestamp: new Date().toISOString(),
        });
        res.status(200).json({
            message: "Password changed successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Change password error", {
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
exports.changePassword = changePassword;
// Logout (client-side token removal, but we can log the event)
const logout = async (req, res) => {
    try {
        if (req.user) {
            logger_1.default.info("User logged out", {
                userId: req.user.id,
                timestamp: new Date().toISOString(),
            });
        }
        res.status(200).json({
            message: "Logout successful",
        });
    }
    catch (error) {
        logger_1.default.error("Logout error", {
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
exports.logout = logout;
