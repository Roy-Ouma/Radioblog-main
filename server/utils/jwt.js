import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET_KEY || "change-me";
const DEFAULT_EXP = "7d";

export const signToken = (payload, options = {}) =>
  jwt.sign(payload, SECRET, { expiresIn: options.expiresIn || DEFAULT_EXP });

export const verifyToken = (token) => jwt.verify(token, SECRET);

// wrapper used across project
export const createJWT = (id, options = {}) =>
  signToken({ userId: id }, { expiresIn: options.expiresIn || "1d" });

export default { signToken, verifyToken, createJWT };

