import User from '../models/UserModel.js';
import { verifyToken } from '../utils/jwt.js';

export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.userId) return res.status(401).json({ success: false, message: 'Invalid token' });

    const user = await User.findById(payload.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.accountType !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.user = payload;
    req.currentUser = user;
    return next();
  } catch (err) {
    console.error('adminAuth error', err);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const generalAdminAuth = async (req, res, next) => {
  await adminAuth(req, res, async () => {
    const user = req.currentUser;
    if (!user?.isGeneralAdmin) {
      return res.status(403).json({ success: false, message: 'General admin privileges required' });
    }
    return next();
  });
};

export default adminAuth;
