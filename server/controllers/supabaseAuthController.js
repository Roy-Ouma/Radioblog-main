import { supabase } from '../utils/supabaseClient.js';
import Users from '../models/Users.js';
import { createJWT } from '../utils/jwt.js';
import dotenv from 'dotenv';

dotenv.config();

// Server-side signup: creates a Supabase account which triggers email verification
export const supabaseSignUp = async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const redirectTo = (process.env.FRONTEND_URL || '').replace(/\/$/, '') + '/';

    const { data, error } = await supabase.auth.signUp({ email, password }, { redirectTo });
    if (error) {
      console.error('Supabase signUp error', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    // Do NOT create local user until email confirmed — Supabase will send confirmation email.
    return res.status(200).json({ success: true, message: 'Signup initiated. Please check your email to verify.', data });
  } catch (err) {
    console.error('supabaseSignUp error', err);
    return res.status(500).json({ success: false, message: 'Unable to sign up' });
  }
};

// Server-side sign in using Supabase auth - returns session data from Supabase
export const supabaseSignIn = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Supabase signIn error', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    const supUser = data?.user || null;
    if (!supUser || !supUser.email) {
      return res.status(400).json({ success: false, message: 'Unable to retrieve Supabase user after sign-in' });
    }

    // Find or create local user record
    let user = await Users.findOne({ email: supUser.email }).exec();
    const verified = !!(supUser.email_confirmed_at || supUser.confirmed_at || supUser.email_confirmed);
    if (!user) {
      user = await Users.create({
        name: (supUser.user_metadata && (supUser.user_metadata.name || supUser.user_metadata.full_name)) || supUser.name || supUser.email.split('@')[0],
        email: supUser.email,
        image: (supUser.user_metadata && (supUser.user_metadata.avatar_url || supUser.user_metadata.picture)) || supUser.avatar_url || '',
        provider: 'supabase',
        emailVerified: verified,
        accountType: 'User',
      });
    } else {
      user.provider = 'supabase';
      user.emailVerified = user.emailVerified || verified;
      if (!user.image && supUser.user_metadata?.avatar_url) user.image = supUser.user_metadata.avatar_url;
      await user.save({ validateBeforeSave: false });
    }

    // block writers who haven't verified email (keep parity with credential login rules)
    if (user.accountType === 'Writer' && !user.emailVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before signing in.' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Create app JWT using same utility as rest of app
    const token = createJWT(user._id);
    const payload = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user;

    return res.json({ success: true, message: 'Signed in with Supabase', token, user: payload, supabase: data });
  } catch (err) {
    console.error('supabaseSignIn error', err);
    return res.status(500).json({ success: false, message: 'Unable to sign in' });
  }
};

// Webhook endpoint for Supabase Auth events (configure this URL in Supabase project)
// Supabase will POST event payloads; you should verify the webhook using the project's secret
export const supabaseAuthWebhook = async (req, res) => {
  try {
    const event = req.body;
    // Example event types: "user.created", "user.updated", "user.deleted"
    // When a user verifies their email, Supabase sets "email_confirmed_at" and an update event is sent.

    const type = event?.type || event?.eventType || (event?.record && event?.trigger) || null;
    // Minimal handling: when user is confirmed, create or update local user record
    const user = event?.record || event?.user || null;
    if (user && (user?.email_confirmed_at || user?.confirmed_at || user?.email_confirmed)) {
      // Create or update Users collection in Mongo to reflect verified account
      try {
        const existing = await Users.findOne({ email: user.email }).exec();
        if (existing) {
          existing.emailVerified = true;
          await existing.save();
        } else {
          // create minimal user record — adapt fields as needed
          await Users.create({
            email: user.email,
            name: user.user_metadata?.name || user.name || '',
            image: user.user_metadata?.avatar_url || user.avatar_url || '',
            emailVerified: true,
            provider: 'supabase',
          });
        }
      } catch (e) {
        console.warn('supabase webhook local user sync failed', e && e.message);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('supabaseAuthWebhook error', err);
    return res.status(500).json({ success: false });
  }
};
