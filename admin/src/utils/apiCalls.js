import axios from "axios";
import { API_URI } from "./index";

const api = axios.create({
  baseURL: API_URI,
  withCredentials: true,
});

// Email/Password Sign Up
export const emailSignUp = async (payload) => {
  try {
    // Signal admin app so backend assigns Writer role by default
    const { data } = await api.post("/auth/signup?app=admin", payload);
    return data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Sign up failed";
    console.error("Email Sign-Up failed:", message);
    return { success: false, message };
  }
};

// Email/Password Sign In
export const emailSignIn = async (payload) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Sign in failed";
    console.error("Email Sign-In failed:", message);
    return { success: false, message };
  }
};

// Google OAuth (reuse for both signup and signin)
const googleAuth = async (accessToken) => {
  try {
    // For admin flows, request with app=admin so new Google signups become Writers
    const { data } = await api.post("/auth/google?app=admin", { access_token: accessToken });
    return data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Google auth failed";
    console.error("Google authentication failed:", message);
    return { success: false, message };
  }
};

export const getGoogleSignIn = googleAuth;
export const getGoogleSignUp = googleAuth;

export const getAdminStats = async (token) => {
  try {
    let authToken = token;

    if (!authToken) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        authToken = parsed?.token;
      }
    }

    const config = authToken 
      ? { headers: { Authorization: `Bearer ${authToken}` } } 
      : {};
    
    const { data } = await api.get("/admin/analytics", config);
    return data;

  } catch (error) {
    console.error("API Error:", error?.response?.data || error.message);
    throw error;
  }
};

export default api;