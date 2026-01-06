import express from "express";
import {
  emailSignUp,
  emailSignIn,
  googleAuth,
  getCurrentUser,
} from "../controllers/authController.js";
import { userAuth } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Email/Password authentication
router.post("/signup", authLimiter, emailSignUp);
router.post("/login", authLimiter, emailSignIn);

// Google OAuth
router.post("/google", authLimiter, googleAuth);
router.post("/google-signup", authLimiter, googleAuth); // backward compatible alias

// Get current authenticated user
router.get("/me", userAuth, getCurrentUser);

export default router;

