import axios from "axios";
import bcryptjs from "bcryptjs";
import User from "../models/UserModel.js";
import { createJWT } from "../utils/jwt.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const buildAuthResponse = (res, userDoc, message, status = 200) => {
  const token = createJWT(userDoc._id);
  const payload = typeof userDoc.toSafeObject === "function" ? userDoc.toSafeObject() : userDoc;

  return res.status(status).json({
    success: true,
    message,
    token,
    user: payload,
  });
};

const fetchGoogleProfile = async (accessToken) => {
  const { data } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

/**
 * Email/Password Sign Up
 * Creates a new user account with email and password
 * Users are created with "User" account type by default
 */
export const emailSignUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return next(httpError(400, "Name is required."));
    }
    if (name.trim().length < 2) {
      return next(httpError(400, "Name must be at least 2 characters."));
    }
    if (!email || !email.trim()) {
      return next(httpError(400, "Email is required."));
    }
    if (!password) {
      return next(httpError(400, "Password is required."));
    }
    if (password.length < 6) {
      return next(httpError(400, "Password must be at least 6 characters."));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return next(httpError(409, "Email is already registered."));
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Determine app context; only set `accountType` explicitly for admin signups
    const app = req.query.app || req.headers["x-app"] || "client";

    const userObj = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      provider: "email",
      emailVerified: false, // Email verification can be added later
    };

    if (app === "admin") {
      userObj.accountType = "Writer"; // Admin app signups become Writers by default
    }

    const newUser = await User.create(userObj);

    return buildAuthResponse(res, newUser, "Account created successfully. Please sign in.", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * Email/Password Sign In
 * Authenticates a user with email and password
 */
export const emailSignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return next(httpError(400, "Email is required."));
    }
    if (!password) {
      return next(httpError(400, "Password is required."));
    }

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return next(httpError(401, "Invalid email or password."));
    }

    // Check if password exists (for email-based accounts)
    if (!user.password) {
      return next(
        httpError(401, "This account was created with Google OAuth. Please sign in with Google.")
      );
    }

    // Compare passwords
    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return next(httpError(401, "Invalid email or password."));
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return buildAuthResponse(res, user, "Signed in successfully.");
  } catch (error) {
    return next(error);
  }
};

/**
 * Google OAuth authentication endpoint
 * Supports signup and login for both admin and client apps
 * 
 * Role assignment based on request headers or context:
 * - Admin app (from admin frontend): assigns "writer" role
 * - Client app (from client frontend): assigns "user" role
 * 
 * If user exists, reuses the record and updates profile
 * If user is new, creates a new record with assigned role
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { access_token: accessToken } = req.body;
    if (!accessToken) {
      return next(httpError(400, "Google access_token is required."));
    }

    const googleProfile = await fetchGoogleProfile(accessToken);
    const email = googleProfile?.email;

    if (!email) {
      return next(httpError(400, "Unable to verify Google account."));
    }

    // Determine which app the request is coming from (default: client = "user")
    // You can pass ?app=admin in the request or set a header
    const app = req.query.app || req.headers["x-app"] || "client";
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user, only set accountType for admin signups so client signups use the model default
      const userObj = {
        name: googleProfile.name || email.split("@")[0],
        email,
        image: googleProfile.picture || "",
        provider: "google",
        emailVerified: !!googleProfile.email_verified,
      };
      if (app === "admin") userObj.accountType = "Writer";

      user = await User.create(userObj);
    } else {
      // Update existing user to ensure Google provider is set and profile is current
      user.provider = "google";
      user.emailVerified = user.emailVerified || !!googleProfile.email_verified;
      if (!user.image && googleProfile.picture) {
        user.image = googleProfile.picture;
      }
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return buildAuthResponse(res, user, "Signed in with Google.");
  } catch (error) {
    if (error?.response) {
      return next(
        httpError(400, error?.response?.data?.error?.message || "Unable to validate Google token.")
      );
    }
    return next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(httpError(401, "Unauthorized."));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(httpError(404, "User not found."));
    }

    return res.status(200).json({
      success: true,
      user: typeof user.toSafeObject === "function" ? user.toSafeObject() : user,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  emailSignUp,
  emailSignIn,
  googleAuth,
  getCurrentUser,
};