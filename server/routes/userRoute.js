import express from "express";
import {
	getUser,
	changeAccountType,
	followWriter,
	unfollowWriter,
	getWriter,
	updateUser,
	resendOTP,
	OTPVerification,
	resetPassword,
	deleteAccount,
} from "../controllers/userController.js";
import userAuth from "../middleware/authMiddleware.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Get all users
router.get("/get-user", getUser);

// Get single user by id (basic)
router.get("/get-user/:id", getUser);

// Get writer profile (includes followers)
router.get("/writer/:id", getWriter);

// Follow a writer (requires authentication)
router.post("/follow/:id", userAuth, followWriter);
// Unfollow a writer
router.delete("/follow/:id", userAuth, unfollowWriter);

// Resend verification link / OTP
router.post("/resend-link/:id", resendOTP);
// Verify OTP
router.post("/verify/:id/:otp", OTPVerification);

// Admin: change a user's account type (requires auth)
router.patch("/update-role/:id", userAuth, changeAccountType);

// Update current authenticated user's profile
router.patch("/update", userAuth, updateUser);

// Request password reset for current authenticated user
router.post('/reset-password', userAuth, resetPassword);

// Delete current authenticated user's account
router.delete('/delete-account', userAuth, deleteAccount);

// Admin: update any user's profile
router.patch("/update/:id", adminAuth, updateUser);

export default router;

