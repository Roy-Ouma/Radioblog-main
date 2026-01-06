import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import FormInputField from "../components/FormInputField";
import PasswordField from "../components/PasswordField";
import FormButton from "../components/FormButton";
import OAuthButton from "../components/OAuthButton";
import useStore from "../store";
import { emailSignUp, getGoogleSignUp } from "../utils/apiCalls";
import { saveUserInfo } from "../utils/index";
import { useGoogleLoginSafe } from "../hooks/useGoogleLoginSafe";

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
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const hasGoogleClientId = !!process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (user && user.token) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!passwordConfirm) {
      newErrors.passwordConfirm = "Please confirm your password";
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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
        toast.error("Google OAuth is not configured.");
        return;
      }
      try {
        setGoogleLoading(true);
        const userResp = await getGoogleSignUp(tokenResponse?.access_token);

        if (userResp?.success === true) {
          saveUserInfo(userResp, signIn);
        } else {
          toast.error(userResp?.message || "Google sign-up failed. Please try again.");
        }
      } catch (err) {
        toast.error("Google sign-up failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google sign-up was cancelled.");
      setGoogleLoading(false);
    },
  });

  const clearErrorOnChange = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden md:flex flex-col gap-y-8 w-1/3 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black items-center justify-center px-8">
        <Logo type="signup" />
        <div className="space-y-4 text-center max-w-sm">
          <h1 className="text-4xl font-bold text-white">Join Our Community</h1>
          <p className="text-gray-300 text-base leading-relaxed">
            Share your stories, connect with readers, and grow your audience
          </p>
          <div className="pt-4 space-y-2 text-sm text-gray-400">
            <p>✓ Create your profile</p>
            <p>✓ Share your content</p>
            <p>✓ Build your audience</p>
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
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sign up to get started with our platform
            </p>
          </div>

          {/* Email/Password Form - PRIMARY */}
          <form onSubmit={handleEmailSignUp} className="space-y-5 mb-8">
            <FormInputField
              label="Full Name"
              type="text"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearErrorOnChange("name");
              }}
              placeholder="John Doe"
              error={errors.name}
              isRequired
              disabled={isSubmitting}
              autoComplete="name"
            />

            <FormInputField
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearErrorOnChange("email");
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
                clearErrorOnChange("password");
              }}
              placeholder="••••••••"
              error={errors.password}
              isRequired
              disabled={isSubmitting}
              autoComplete="new-password"
              showStrength={true}
            />

            <PasswordField
              label="Confirm Password"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                clearErrorOnChange("passwordConfirm");
              }}
              placeholder="••••••••"
              error={errors.passwordConfirm}
              isRequired
              disabled={isSubmitting}
              autoComplete="new-password"
            />

            <FormButton
              label={isSubmitting ? "Creating Account..." : "Create Account"}
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

          {/* Google Sign-Up - OPTIONAL */}
          {hasGoogleClientId && (
            <OAuthButton
              provider="google"
              onClick={() => GoogleLogin()}
              loading={googleLoading}
              disabled={googleLoading || isSubmitting}
              label="Sign up with Google"
              fullWidth
            />
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-semibold transition"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Demo Tip:</strong> Create your account with any email and password to explore the platform.
            </p>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default SignupPage;
