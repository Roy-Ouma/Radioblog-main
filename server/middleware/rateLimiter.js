import rateLimit from 'express-rate-limit';

// Global rate limiter: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production',
});

// Login/signup rate limiter: 5 attempts per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  skip: (req) => process.env.NODE_ENV !== 'production',
});

// Like/Unlike rate limiter: 100 per hour per user
export const likeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many like actions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  skip: (req) => process.env.NODE_ENV !== 'production',
});

// Comment rate limiter: 50 per hour per user
export const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Too many comments, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  skip: (req) => process.env.NODE_ENV !== 'production',
});

// Create post rate limiter: 10 per hour per user
export const createPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many posts created, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  skip: (req) => process.env.NODE_ENV !== 'production',
});
