import { useGoogleLoginSafe } from '../hooks/useGoogleLoginSafe';
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Logo from "../components/Logo";
import { emailSignUp, getGoogleSignUp } from "../utils/apiCalls";
import { saveUserInfo } from "../utils/index";
import useStore from "../store";

const SignupPage = () => {
  const store = useStore() || {};
  const user = store?.user ?? null;
  const signIn = store?.signIn ?? (() => {});
  const setIsLoading = store?.setIsLoading ?? (() => {});
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasGoogleClientId = !!process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (user && user.token) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !passwordConfirm) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await emailSignUp({ name, email, password });
      if (result?.success) {
        saveUserInfo(result, signIn);
      } else {
        toast.error(result?.message || "Sign up failed. Please try again.");
      }
    } catch (error) {
      toast.error(error?.message || "Sign up failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const GoogleLogin = useGoogleLoginSafe({
    onSuccess: async (tokenResponse) => {
      if (!hasGoogleClientId) {
        toast.error('Google OAuth is not configured.');
        return;
      }
      try {
        setIsLoading?.(true);
        const userResp = await getGoogleSignUp(tokenResponse?.access_token);

        if (userResp?.success === true) {
          signIn(userResp);
          toast.success("Account created successfully!");
          setTimeout(() => window.location.replace("/"), 600);
        } else {
          toast.error(userResp?.message || "Google sign-up failed. Please try again.");
        }
      } catch (err) {
        toast.error("Google sign-up failed. Please try again.");
      } finally {
        setIsLoading?.(false);
      }
    },
    onError: () => {
      toast.error('Google sign-up was cancelled.');
    },
  });

  return (
    <div className="flex w-full min-h-screen">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden md:flex flex-col gap-y-6 w-1/3 min-h-screen bg-gradient-to-b from-slate-900 to-black items-center justify-center px-8">
        <Logo type="Sign-up" />
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Join Our Community</h1>
          <p className="text-gray-400 text-sm">Share your stories, connect with readers, and grow your audience</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full md:w-2/3 min-h-screen bg-white dark:bg-slate-950 items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="block md:hidden mb-8 text-center">
            <Logo />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Sign up to get started with our platform</p>
          </div>

          {/* Email/Password Form - PRIMARY */}
          <form onSubmit={handleEmailSignUp} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-950 text-gray-600 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-Up - OPTIONAL */}
          {hasGoogleClientId && (
            <button
              onClick={() => GoogleLogin()}
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-900 transition font-medium text-gray-900 dark:text-white"
            >
              <FcGoogle className="text-xl" />
              Sign up with Google
            </button>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-orange-500 hover:text-orange-600 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default SignupPage;
