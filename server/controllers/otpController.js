import { generateOTP } from "../utils/index.js"; // adjust path if needed

/**
 * Stub OTP controller - replace storage/email logic with real implementations.
 */

export const sendOTP = async (req, res, next) => {
  try {
    const otp = generateOTP ? generateOTP() : Math.floor(100000 + Math.random() * 900000);
    // TODO: save OTP and send email
    return res.status(200).json({ success: true, otp });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    // TODO: verify OTP
    return res.status(200).json({ success: true, message: "OTP verified (stub)" });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const otp = generateOTP ? generateOTP() : Math.floor(100000 + Math.random() * 900000);
    // TODO: resend
    return res.status(200).json({ success: true, otp });
  } catch (error) {
    next(error);
  }
};

// Add this named export so imports expecting OTPVerification succeed
export const OTPVerification = verifyOTP;