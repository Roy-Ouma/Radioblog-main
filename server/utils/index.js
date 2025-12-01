import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "./jwt.js"; // <- fixed path

export const hashString = async (userValue) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userValue, salt);
  return hashedPassword;
};

export const compareString = async (userPassword, password) => {
  try {
    const isMatch = await bcrypt.compare(userPassword, password);
    return isMatch;
  } catch (error) {
    throw new Error(error);
  }
};

// Use signToken helper instead of undefined `JWT`
export function createJWT(id) {
  return signToken({ userId: id }, { expiresIn: "1d" });
}

export function generateOTP() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

