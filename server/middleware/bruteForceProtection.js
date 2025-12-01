import User from '../models/UserModel.js';
import mongoose from 'mongoose';

// Track failed login attempts: { userId: { attempts: 5, lastAttempt: timestamp } }
const failedLoginAttempts = new Map();
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

export const trackFailedLogin = (email) => {
  if (!failedLoginAttempts.has(email)) {
    failedLoginAttempts.set(email, { attempts: 0, lockedUntil: null });
  }
  const record = failedLoginAttempts.get(email);
  record.attempts += 1;
  record.lastAttempt = Date.now();

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_TIME;
  }
};

export const trackSuccessfulLogin = (email) => {
  failedLoginAttempts.delete(email);
};

export const isAccountLocked = (email) => {
  const record = failedLoginAttempts.get(email);
  if (!record) return false;
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return true;
  }
  // Unlock if lockout time has passed
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    failedLoginAttempts.delete(email);
  }
  return false;
};

export const getFailedAttempts = (email) => {
  const record = failedLoginAttempts.get(email);
  return record ? record.attempts : 0;
};

// Optional: periodic cleanup to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of failedLoginAttempts.entries()) {
    // Remove entries older than 1 hour
    if (record.lastAttempt && now - record.lastAttempt > 60 * 60 * 1000) {
      failedLoginAttempts.delete(email);
    }
  }
}, 30 * 60 * 1000); // Cleanup every 30 minutes
