import User from "../models/UserModel.js";
import mongoose from 'mongoose';
import Verification from "../models/emailVerification.js";
import PasswordReset from "../models/PasswordReset.js";
import { compareString, createJWT } from "../utils/index.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";
import { supabase } from "../utils/supabaseClient.js";
import Follower from "../models/followerModel.js";
import Posts from "../models/Posts.js";
import Views from "../models/Views.js";

export const OTPVerification = async (req, res, next) => {
  try {
    const { userId, otp } = req.params;
    const result = await Verification.findOne({ userId });

    if (!result) {
      return res.status(404).json({ message: "Verification record not found" });
    }

    const { expiresAt, token } = result;

    if (expiresAt < Date.now()) {
      await Verification.findOneAndDelete({ userId });
      return res.status(410).json({ message: "Code has expired. Please request again" });
    }

    const isMatch = await compareString(otp, token);
    if (isMatch) {
      await Promise.all([
        User.findByIdAndUpdate(userId, { emailVerified: true }),
        Verification.findOneAndDelete({ userId }),
      ]);

      return res.status(200).json({ message: "Email verified successfully. You can now login" });
    }

    return res.status(400).json({ message: "Invalid OTP, please try again" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Verification.findOneAndDelete({ userId: id });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = undefined;
    const token = createJWT(user._id);

    if (user?.accountType === "Writer") {
      await sendVerificationEmail(user, req, res, token);
      return; // sendVerificationEmail handles the response in your utils
    }

    return res.status(400).json({ message: "Something went wrong" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const followWriter = async (req, res, next) => {
  try {
    const followerId = req.user?.userId || req.body.user?.userId || req.body.userId;
    const { id } = req.params; // writer id

    if (!followerId) {
      console.warn('followWriter: missing followerId', { followerId, id });
      return res.status(400).json({ success: false, message: "Missing follower id" });
    }

    if (!id || String(id) === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      console.warn('followWriter: invalid writer id', { id });
      return res.status(400).json({ success: false, message: "Invalid writer id" });
    }

    const exists = await Follower.findOne({ followerId, userId: id });
    if (exists) {
      return res.status(200).json({ success: false, message: "You are already following this writer" });
    }

    const writer = await User.findById(id);
    if (!writer) return res.status(404).json({ success: false, message: "Writer not found" });

    const newFollower = await Follower.create({ followerId, userId: id });
    writer.followers = writer.followers ? [...writer.followers, newFollower._id] : [newFollower._id];
    await writer.save();

    return res.status(201).json({
      success: true,
      message: `You are now following this writer ${writer?.name}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const unfollowWriter = async (req, res, next) => {
  try {
    const followerId = req.user?.userId || req.body.user?.userId || req.body.userId;
    const { id } = req.params; // writer id

    if (!followerId) {
      console.warn('unfollowWriter: missing followerId', { followerId, id });
      return res.status(400).json({ success: false, message: "Missing follower id" });
    }

    if (!id || String(id) === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      console.warn('unfollowWriter: invalid writer id', { id });
      return res.status(400).json({ success: false, message: "Invalid writer id" });
    }

    const exists = await Follower.findOne({ followerId, userId: id });
    if (!exists) {
      return res.status(200).json({ success: false, message: "You are not following this writer" });
    }

    // remove follower record
    await Follower.findByIdAndDelete(exists._id);

    // remove reference from writer.followers array
    const writer = await User.findById(id);
    if (writer) {
      writer.followers = (writer.followers || []).filter((f) => String(f) !== String(exists._id));
      await writer.save();
    }

    return res.status(200).json({ success: true, message: "You have unfollowed this writer" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // Accept either full name or first/last name pieces
    const { firstName, lastName, image, name } = req.body;

    // Determine which user to update: param id (admin), body.userId, or authenticated user
    const userId = req.params?.id || req.body.user || req.body.userId || req.user?.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing user id' });

    // Build update object
    const updateUser = {};
    if (name) updateUser.name = String(name).trim();
    else if (firstName || lastName) updateUser.name = `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim();
    if (image !== undefined) updateUser.image = image;

    if (!updateUser.name && updateUser.image === undefined) {
      return res.status(400).json({ success: false, message: 'No update fields provided' });
    }

    const user = await User.findByIdAndUpdate(userId, updateUser, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const token = createJWT(user._id);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getWriter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate({ path: "followers", select: "followerId" });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // compute public posts count and total views for the writer
    try {
      const postsCount = await Posts.countDocuments({ user: id, status: true, approved: true });
      const totalViews = await Views.countDocuments({ user: id });
      // attach computed fields to the returned object for convenience
      const userObj = user.toObject();
      userObj.password = undefined;
      userObj.postsCount = postsCount;
      userObj.totalViews = totalViews;

      return res.status(200).json({ success: true, data: userObj });
    } catch (e) {
      // fallback: return user without computed stats
      user.password = undefined;
      return res.status(200).json({ success: true, data: user });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id) {
      const user = await User.findById(id).select("-password");
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      return res.json({ success: true, user });
    }
    const users = await User.find().select("-password");
    return res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

export const changeAccountType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountType } = req.body;

    if (!id) return res.status(400).json({ success: false, message: "Missing user id" });
    if (!accountType || !["User", "Writer"].includes(accountType)) {
      return res.status(400).json({ success: false, message: "Invalid accountType provided" });
    }

    const user = await User.findByIdAndUpdate(id, { accountType }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, message: "Account type updated", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /api/users/reset-password (self) - triggers a password reset email
export const resetPassword = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.email) {
      console.warn(`resetPassword: user ${userId} has no email (provider=${user.provider})`);
      return res.status(400).json({ message: 'User has no email on record' });
    }
    if (user.provider && user.provider !== 'credentials') {
      console.warn(`resetPassword: user ${userId} provider=${user.provider} cannot reset password`);
      return res.status(400).json({ message: `Password reset is not supported for provider '${user.provider}'` });
    }

    // Prefer Supabase password-reset flow if configured
    try {
      if (supabase && supabase.auth && typeof supabase.auth.resetPasswordForEmail === 'function') {
        const redirectTo = (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`) + '/reset-password';
        const { data, error } = await supabase.auth.resetPasswordForEmail?.(user.email, { redirectTo }) || await supabase.auth.resetPasswordForEmail(user.email).catch(e=>({ error: e }));
        if (error) {
          console.warn('Supabase resetPasswordForEmail failed:', error?.message || error);
        } else {
          return res.json({ message: 'Password reset email requested via Supabase' });
        }
      }
    } catch (e) {
      console.warn('Supabase reset attempt error:', e && e.message);
    }

    // Fallback: send an app-managed password reset email
    const result = await sendPasswordResetEmail(user, req);
    if (result && result.success) return res.json({ message: result.message });

    return res.status(500).json({ message: result?.message || 'Unable to initiate password reset' });
  } catch (error) {
    console.error('resetPassword error', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// POST /api/admin/users/:id/reset-password - admin triggers password reset for a user
export const adminResetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Missing user id' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.email) {
      console.warn(`adminResetPassword: user ${id} has no email (provider=${user.provider})`);
      return res.status(400).json({ message: 'User has no email on record' });
    }
    if (user.provider && user.provider !== 'credentials') {
      console.warn(`adminResetPassword: user ${id} provider=${user.provider} cannot reset password`);
      return res.status(400).json({ message: `Password reset is not supported for provider '${user.provider}'` });
    }

    // Try Supabase first
    try {
      if (supabase && supabase.auth && typeof supabase.auth.resetPasswordForEmail === 'function') {
        const redirectTo = (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`) + '/reset-password';
        const { data, error } = await supabase.auth.resetPasswordForEmail?.(user.email, { redirectTo }) || await supabase.auth.resetPasswordForEmail(user.email).catch(e=>({ error: e }));
        if (error) {
          console.warn('Supabase admin reset failed:', error?.message || error);
        } else {
          return res.json({ message: 'Password reset email requested via Supabase' });
        }
      }
    } catch (e) {
      console.warn('Supabase admin reset exception:', e && e.message);
    }

    // fallback to app-managed email
    const result = await sendPasswordResetEmail(user, req);
    if (result && result.success) return res.json({ message: result.message });

    return res.status(500).json({ message: result?.message || 'Unable to initiate password reset' });
  } catch (error) {
    console.error('adminResetPassword error', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};



