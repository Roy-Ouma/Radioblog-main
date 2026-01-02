import axios from "axios";
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
    const defaultRole = app === "admin" ? "writer" : "user";

    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with role based on signup context
      user = await User.create({
        name: googleProfile.name || email.split("@")[0],
        email,
        image: googleProfile.picture || "",
        provider: "google",
        emailVerified: !!googleProfile.email_verified,
        accountType: defaultRole,
      });
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
  googleAuth,
  getCurrentUser,
};