import { verifyToken } from "../utils/jwt.js";

export const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default userAuth;