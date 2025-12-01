import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  getCurrentUser,
} from "../controllers/authController.js";
import { resetPasswordComplete } from "../controllers/authController.js";
import { supabaseSignUp, supabaseSignIn, supabaseAuthWebhook } from '../controllers/supabaseAuthController.js';
import { userAuth } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/google", authLimiter, googleAuth);
router.post("/google-signup", authLimiter, googleAuth); // backward compatible alias
// Supabase auth endpoints
router.post('/supabase-signup', authLimiter, supabaseSignUp);
router.post('/supabase-login', authLimiter, supabaseSignIn);
router.post('/supabase-webhook', supabaseAuthWebhook);
router.get("/me", userAuth, getCurrentUser);
router.post('/reset-password-complete', resetPasswordComplete);

export default router;

