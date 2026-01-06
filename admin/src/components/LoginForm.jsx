import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import FormInputField from "./FormInputField";
import PasswordField from "./PasswordField";
import FormCheckbox from "./FormCheckbox";
import FormButton from "./FormButton";
import OAuthButton from "./OAuthButton";
import { emailSignIn, getGoogleSignIn } from "../utils/apiCalls";
import { API_URI } from "../utils";

const LoginForm = ({ setIsSignin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

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
        localStorage.setItem("user", JSON.stringify(result));
        if (rememberMe) {
          localStorage.setItem("rememberEmail", email);
        } else {
          localStorage.removeItem("rememberEmail");
        }
        toast.success(result?.message || "Signed in successfully");
        setTimeout(() => window.location.replace("/"), 800);
      } else {
        toast.error(result?.message || "Sign in failed. Please try again.");
      }
    } catch (error) {
      toast.error(error?.message || "Sign in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        const accessToken = tokenResponse?.access_token;
        if (!accessToken) {
          toast.error("Unable to acquire Google access token");
          return;
        }

        const result = await getGoogleSignIn(accessToken);

        if (result?.success) {
          localStorage.setItem("user", JSON.stringify(result));
          toast.success(result?.message || "Signed in successfully");
          setTimeout(() => window.location.replace("/"), 800);
        } else {
          toast.error(result?.message || "Google sign-in failed");
        }
      } catch (error) {
        toast.error(error?.message || "Google sign-in failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google sign-in was cancelled.");
      setGoogleLoading(false);
    },
  });

  // Load remembered email on mount
  React.useEffect(() => {
    const remembered = localStorage.getItem("rememberEmail");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <form
      onSubmit={handleEmailSignIn}
      className="w-full space-y-6"
    >
      <div className="space-y-5">
        <FormInputField
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
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
            if (errors.password) setErrors({ ...errors, password: "" });
          }}
          placeholder="••••••••"
          error={errors.password}
          isRequired
          disabled={isSubmitting}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between gap-4">
          <FormCheckbox
            label="Remember me"
            name="rememberMe"
            value={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isSubmitting}
          />
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition"
          >
            Forgot password?
          </a>
        </div>
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

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Sign-In - OPTIONAL */}
      <OAuthButton
        provider="google"
        onClick={() => googleLogin()}
        loading={googleLoading}
        disabled={googleLoading || isSubmitting}
        label="Sign in with Google"
        fullWidth
      />

      {/* Footer */}
      <div className="text-center text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <span
            onClick={() => setIsSignin(false)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-semibold transition"
          >
            Sign up here
          </span>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
