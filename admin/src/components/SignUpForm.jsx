import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import FormInputField from "./FormInputField";
import PasswordField from "./PasswordField";
import FormButton from "./FormButton";
import OAuthButton from "./OAuthButton";
import { emailSignUp, getGoogleSignUp } from "../utils/apiCalls";

const SignUpForm = ({ setIsSignin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
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
        localStorage.setItem("user", JSON.stringify(result));
        toast.success(result?.message || "Account created successfully!");
        setTimeout(() => window.location.replace("/"), 800);
      } else {
        toast.error(result?.message || "Sign up failed. Please try again.");
      }
    } catch (error) {
      toast.error(error?.message || "Sign up failed. Please try again.");
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

        const result = await getGoogleSignUp(accessToken);

        if (result?.success) {
          localStorage.setItem("user", JSON.stringify(result));
          toast.success(result?.message || "Account created successfully!");
          setTimeout(() => window.location.replace("/"), 800);
        } else {
          toast.error(result?.message || "Google sign-up failed");
        }
      } catch (error) {
        toast.error(error?.message || "Google sign-up failed");
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
    <form onSubmit={handleEmailSignUp} className="w-full space-y-6">
      <div className="space-y-5">
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

        {/* Info Note for Writers */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            ℹ️ You will be automatically registered as a <strong>Writer</strong> upon signup.
          </p>
        </div>
      </div>

      <FormButton
        label={isSubmitting ? "Creating Account..." : "Create Account"}
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

      {/* Google Sign-Up - OPTIONAL */}
      <OAuthButton
        provider="google"
        onClick={() => googleLogin()}
        loading={googleLoading}
        disabled={googleLoading || isSubmitting}
        label="Sign up with Google"
        fullWidth
      />

      {/* Footer */}
      <div className="text-center text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => setIsSignin(true)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-semibold transition"
          >
            Sign in here
          </span>
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
