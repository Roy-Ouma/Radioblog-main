import axios from "axios";
import User from "../models/UserModel.js";
import { hashString, compareString } from "../utils/index.js";
import PasswordReset from "../models/PasswordReset.js";
import { createJWT } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

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

const formatFullName = (first, last) =>
  `${(first || "").trim()} ${(last || "").trim()}`.replace(/\s+/g, " ").trim();

export const registerUser = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      firstName,
      lastName,
      email,
      password,
      accountType = "User",
      image = "",
    } = req.body;

    const resolvedFirstName = firstname || firstName;
    const resolvedLastName = lastname || lastName;

    if (!resolvedFirstName || !resolvedLastName || !email || !password) {
      return next(httpError(400, "First name, last name, email, and password are required."));
    }

    if (password.length < 8) {
      return next(httpError(400, "Password must be at least 8 characters long."));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(httpError(409, "Email is already registered."));
    }

    const hashedPassword = await hashString(password);

    const user = await User.create({
      name: formatFullName(resolvedFirstName, resolvedLastName),
      email,
      password: hashedPassword,
      accountType: accountType === "Writer" ? "Writer" : "User",
      provider: "credentials",
      image,
      // Credentials signups should not be auto-verified. Only OAuth (e.g. Google)
      // or explicit email verification flows should mark emailVerified = true.
      emailVerified: false,
    });

    // If the account requires email verification (writers/admins), send a verification email
    const token = createJWT(user._id);
    if (!user.emailVerified) {
      // sendVerificationEmail will return the appropriate response to the client
      return sendVerificationEmail(user, req, res, token);
    }

    return buildAuthResponse(res, user, "Account created successfully.", 201);
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(httpError(400, "Email and password are required."));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(httpError(401, "Invalid credentials."));
    }

    if (user.provider !== "credentials") {
      return next(httpError(400, "Please continue with Google for this account."));
    }

    const isMatch = await compareString(password, user.password || "");
    if (!isMatch) {
      return next(httpError(401, "Invalid credentials."));
    }

    if (user.accountType === "Writer" && !user.emailVerified) {
      return next(httpError(403, "Please verify your email before signing in."));
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    user.password = undefined;

    return buildAuthResponse(res, user, "Signed in successfully.");
  } catch (error) {
    return next(error);
  }
};

const fetchGoogleProfile = async (accessToken) => {
  const { data } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

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

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: googleProfile.name || email.split("@")[0],
        email,
        image: googleProfile.picture || "",
        provider: "google",
        emailVerified: !!googleProfile.email_verified,
        accountType: "User",
      });
    } else {
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

// POST /api/auth/reset-password-complete
export const resetPasswordComplete = async (req, res, next) => {
  try {
    const { id, token, newPassword } = req.body;
    if (!id || !token || !newPassword) return next(httpError(400, 'Missing id, token or newPassword'));
    if (newPassword.length < 8) return next(httpError(400, 'Password must be at least 8 characters'));

    const resetRec = await PasswordReset.findOne({ userId: id, used: false }).sort({ createdAt: -1 });
    if (!resetRec) return next(httpError(400, 'Reset token not found or already used'));
    if (resetRec.expiresAt < Date.now()) return next(httpError(410, 'Reset token expired'));

    const match = await compareString(String(token), resetRec.token);
    if (!match) return next(httpError(400, 'Invalid token'));

    const user = await User.findById(id).select('+password');
    if (!user) return next(httpError(404, 'User not found'));

    user.password = await hashString(newPassword);
    await user.save();

    resetRec.used = true;
    await resetRec.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    return next(err);
  }
};

export default {
  registerUser,
  loginUser,
  googleAuth,
  getCurrentUser,
};