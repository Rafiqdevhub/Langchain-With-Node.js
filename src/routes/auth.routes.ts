import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Too Many Requests",
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const profileRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too Many Requests",
    message: "Too many profile requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.get("/profile", authenticate, profileRateLimit, getProfile);
router.put("/profile", authenticate, profileRateLimit, updateProfile);
router.post("/change-password", authenticate, authRateLimit, changePassword);
router.post("/logout", authenticate, logout);

export default router;
