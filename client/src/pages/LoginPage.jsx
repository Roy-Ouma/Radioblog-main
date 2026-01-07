import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import FormInputField from "../components/FormInputField";
import PasswordField from "../components/PasswordField";
import FormCheckbox from "../components/FormCheckbox";
import FormButton from "../components/FormButton";
import OAuthButton from "../components/OAuthButton";
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
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (userState?.token) {
      navigate("/", { replace: true });
    }
  }, [userState, navigate]);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await emailSignIn({ email, password });
      if (result?.success) {
        if (rememberMe) {
          localStorage.setItem("rememberEmail", email);
        } else {
          localStorage.removeItem("rememberEmail");
        }
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
        setGoogleLoading(true);
        const result = await getGoogleSignIn(tokenResponse.access_token);
        if (result?.success) {
          saveUserInfo(result, signIn);
        } else {
          toast.error(result?.message || "Google sign-in failed. Please try again.");
        }
      } catch (error) {
        toast.error(error?.message || "Google sign-in failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google sign-in was cancelled.");
      setGoogleLoading(false);
    },
  });

  const hasGoogleClientId = !!process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem("rememberEmail");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="flex w-full min-h-screen">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden md:flex flex-col gap-y-8 w-1/3 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black items-center justify-center px-8">
        <Logo type="login" />
        <div className="space-y-4 text-center max-w-sm">
          <h1 className="text-4xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-300 text-base leading-relaxed">
            Sign in to continue to your dashboard and access all your content
          </p>
          <div className="pt-4 space-y-2 text-sm text-gray-400">
            <p>✓ Access your dashboard</p>
            <p>✓ Manage your content</p>
            <p>✓ Connect with your audience</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full md:w-2/3 min-h-screen bg-white dark:bg-slate-950 items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="block md:hidden mb-8 text-center">
            <Logo />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Email/Password Form - PRIMARY */}
          <form onSubmit={handleEmailSignIn} className="space-y-5 mb-8">
            <FormInputField
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: "" });
                }
              }}
              placeholder="your@email.com"
              error={errors.email}
              isRequired
              disabled={isSubmitting}
              autoComplete="email"
            />

            <PasswordField
              label="Password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              placeholder="••••••••"
              error={errors.password}
              isRequired
              disabled={isSubmitting}
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between gap-4">
              <FormCheckbox
                label="Remember me"
                name="rememberMe"
                value={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
              />
              <Link
                to="#"
                className="text-sm text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition"
              >
                Forgot password?
              </Link>
            </div>

            <FormButton
              label={isSubmitting ? "Signing in..." : "Sign In"}
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              variant="primary"
              size="md"
              fullWidth
            />
          </form>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-950 text-gray-600 dark:text-gray-400 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In - OPTIONAL */}
          {hasGoogleClientId && (
            <OAuthButton
              provider="google"
              onClick={() => googleLogin()}
              loading={googleLoading}
              disabled={googleLoading || isSubmitting}
              label="Sign in with Google"
              fullWidth
            />
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/sign-up"
                className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-semibold transition"
              >
                Create one now
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Use any valid email and password to complete.
            </p>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default LoginPage;
