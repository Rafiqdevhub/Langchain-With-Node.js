"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        error: "Too Many Requests",
        message: "Too many authentication attempts, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const profileRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        error: "Too Many Requests",
        message: "Too many profile requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post("/register", authRateLimit, auth_controller_1.register);
router.post("/login", authRateLimit, auth_controller_1.login);
router.get("/profile", auth_middleware_1.authenticate, profileRateLimit, auth_controller_1.getProfile);
router.put("/profile", auth_middleware_1.authenticate, profileRateLimit, auth_controller_1.updateProfile);
router.post("/change-password", auth_middleware_1.authenticate, authRateLimit, auth_controller_1.changePassword);
router.post("/logout", auth_middleware_1.authenticate, auth_controller_1.logout);
exports.default = router;
