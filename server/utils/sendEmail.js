import Verification from "../models/VerificationModel.js";
import PasswordReset from "../models/PasswordReset.js";
import { generateOTP, hashString } from "./index.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const {AUTH_EMAIL, AUTH_PASSWORD} = process.env;

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: AUTH_EMAIL,
        pass: AUTH_PASSWORD,
    },
});

export const sendVerificationEmail = async (user, req, res, token) => {
    try {
        const { _id, email, name } = user;
        const otp = generateOTP();

        const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;
        const verifyPage = `${clientUrl}/otp-verification`;

        const mailOptions = {
            from: `Maseno Radio <${AUTH_EMAIL}>`,
            to: email,
            subject: "Verify your Maseno Radio account",
            text: `Hi ${name},\n\nThank you for registering on Maseno Radio.\n\nYour verification code is: ${otp}\n\nThis code is valid for 30 minutes. Visit ${verifyPage} and enter the code to verify your account.\n\nIf you did not request this, please ignore this message.\n\n— Maseno Radio Team`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; background:#f9f9f9; padding:20px; border-radius:8px; max-width:600px;">
                <h2 style="color:#1f2937">Hi ${name},</h2>
                <p style="color:#374151; font-size:16px;">Thanks for registering on <strong>Maseno Radio</strong>. To complete your registration, use the code below to verify your email address.</p>
                <div style="margin:20px 0; padding:16px; background:#fff; border-radius:6px; text-align:center; border:1px solid #e5e7eb;">
                  <p style="font-size:20px; letter-spacing:4px; margin:0; font-weight:700;">${otp}</p>
                </div>
                <p style="color:#374151">Or click the button below to open the verification page:</p>
                <p style="text-align:center; margin:18px 0;">
                  <a href="${verifyPage}" style="background:#ff7a18; color:#fff; padding:12px 22px; text-decoration:none; border-radius:6px; display:inline-block;">Verify Email</a>
                </p>
                <p style="color:#6b7280; font-size:13px;">This code expires in 30 minutes. If you didn't request this, ignore this email.</p>
                <p style="color:#374151; margin-top:18px;">Best regards,<br/>Maseno Radio Team</p>
              </div>
            `
        };

        // create hashed token and verification record, then send email
        const hashedToken = await hashString(String(otp));

        const newVerifiedEmail = await Verification.create({
            userId: _id,
            otp: hashedToken,
            expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
        });

        if (newVerifiedEmail) {
            try {
                const info = await transporter.sendMail(mailOptions);
                if (info && info.accepted && info.accepted.length > 0) {
                    return res.status(201).send({
                        success: "PENDING",
                        message: "OTP has been sent to your email, please verify",
                        user,
                        token,
                    });
                }

                // if SMTP did not accept the message, remove the verification record
                await Verification.findByIdAndDelete(newVerifiedEmail._id);
                return res.status(500).json({ error: "Email not accepted by SMTP provider" });
            } catch (err) {
                console.error("sendMail error:", err);
                await Verification.findByIdAndDelete(newVerifiedEmail._id);
                return res.status(500).json({ error: "Email sending failed", message: err.message });
            }
        } else {
            return res.status(500).json({ error: "Verification record creation failed" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Email sending failed", message: error.message });
    }
};

export const sendPasswordResetEmail = async (user, req) => {
    try {
        const { _id, email, name } = user;
        if (!email) return { success: false, message: 'User has no email' };

        // create a secure token
        const rawToken = require('crypto').randomBytes(24).toString('hex');
        const hashed = await hashString(String(rawToken));

        // save password reset record (expires in 1 hour)
        const expiresAt = Date.now() + 60 * 60 * 1000;
        await PasswordReset.create({ userId: _id, token: hashed, expiresAt });

        const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;
        const resetPage = `${clientUrl}/reset-password?token=${encodeURIComponent(rawToken)}&id=${_id}`;

        const mailOptions = {
            from: `Maseno Radio <${process.env.AUTH_EMAIL}>`,
            to: email,
            subject: "Reset your Maseno Radio password",
            text: `Hi ${name},\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n${resetPage}\n\nIf you did not request this, you can ignore this email. This link expires in 1 hour.\n\n— Maseno Radio Team`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; background:#f9f9f9; padding:20px; border-radius:8px; max-width:600px;">
                <h2 style="color:#1f2937">Hi ${name},</h2>
                <p style="color:#374151; font-size:16px;">We received a request to reset your password. Click the button below to set a new password. This link expires in one hour.</p>
                <p style="text-align:center; margin:18px 0;">
                  <a href="${resetPage}" style="background:#ff7a18; color:#fff; padding:12px 22px; text-decoration:none; border-radius:6px; display:inline-block;">Reset Password</a>
                </p>
                <p style="color:#6b7280; font-size:13px;">If you didn't request this, ignore this email.</p>
                <p style="color:#374151; margin-top:18px;">Best regards,<br/>Maseno Radio Team</p>
              </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            if (info && info.accepted && info.accepted.length > 0) {
                return { success: true, message: 'Password reset email sent' };
            }
            // if SMTP didn't accept, delete record
            await PasswordReset.findOneAndDelete({ userId: _id, token: hashed });
            return { success: false, message: 'SMTP did not accept message' };
        } catch (err) {
            console.error('sendPasswordResetEmail sendMail error:', err);
            await PasswordReset.findOneAndDelete({ userId: _id, token: hashed });
            return { success: false, message: 'Email sending failed' };
        }

    } catch (error) {
        console.error('sendPasswordResetEmail error:', error);
        return { success: false, message: error.message || 'Failed to send password reset email' };
    }
};



        
      