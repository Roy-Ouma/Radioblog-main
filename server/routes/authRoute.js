import express from "express";
import {
  googleAuth,
  getCurrentUser,
} from "../controllers/authController.js";
import { userAuth } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Google OAuth only
router.post("/google", authLimiter, googleAuth);
router.post("/google-signup", authLimiter, googleAuth); // backward compatible alias

// Get current authenticated user
router.get("/me", userAuth, getCurrentUser);

export default router;

