import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Toaster, toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import useStore from "../store";
import { emailSignIn, getGoogleSignIn } from "../utils/apiCalls";
import { saveUserInfo } from "../utils/index";
import { useGoogleLoginSafe } from "../hooks/useGoogleLoginSafe";

const LoginPage = () => {
  const store = useStore() || {};
  const userState = store?.user ?? null;
  const signIn = store?.signIn ?? (() => {});
  const setIsLoading = store?.setIsLoading ?? (() => {});
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userState?.token) {
      navigate("/", { replace: true });
    }
  }, [userState, navigate]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await emailSignIn({ email, password });
      if (result?.success) {
        saveUserInfo(result, signIn);
      } else {
        toast.error(result?.message || "Sign in failed. Please try again.");
      }
    } catch (error) {
      toast.error(error?.message || "Sign in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleLogin = useGoogleLoginSafe({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const result = await getGoogleSignIn(tokenResponse.access_token);
        if (result?.success) {
          saveUserInfo(result, signIn);
        } else {
          toast.error(result?.message || "Google sign-in failed. Please try again.");
        }
      } catch (error) {
        toast.error(error?.message || "Google sign-in failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Google sign-in was cancelled.");
    },
  });

  const hasGoogleClientId = !!process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <div className="flex w-full min-h-screen">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden md:flex flex-col gap-y-6 w-1/3 min-h-screen bg-gradient-to-b from-slate-900 to-black items-center justify-center px-8">
        <Logo type="login" />
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to continue to your dashboard</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full md:w-2/3 h-full bg-white dark:bg-slate-950 items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="block md:hidden mb-8 text-center">
            <Logo />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign In</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Enter your credentials to access your account</p>
          </div>

          {/* Email/Password Form - PRIMARY */}
          <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
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

          {/* Google Sign-In - OPTIONAL */}
          {hasGoogleClientId && (
            <button
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-900 transition font-medium text-gray-900 dark:text-white"
            >
              <FcGoogle className="text-xl" />
              Sign in with Google
            </button>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-orange-500 hover:text-orange-600 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default LoginPage;
