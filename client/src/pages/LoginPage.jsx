import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Toaster, toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import Divider from "../components/Divider";
import Inputbox from "../components/Inputbox";
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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (userState?.token) {
      navigate("/", { replace: true });
    }
  }, [userState, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleSubmit.__running) return;
    handleSubmit.__running = true;

    try {
      setIsLoading(true);
      const result = await emailSignIn(formData);
      if (result?.success) {
        saveUserInfo(result, signIn);
      } else {
        toast.error(result?.message || "Sign in failed. Please try again.");
      }
    } catch (error) {
      toast.error(error?.message || "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
      handleSubmit.__running = false;
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
    <div className="flex w-full h-[100vh]">
      <div className="hidden md:flex flex-col gap-y-4 w-1/3 min-h-screen bg-black items-center justify-center">
        <Logo type="login" />
        <span className="text-xl font-semibold text-white text-center">Welcome back!</span>
      </div>

      <div className="flex w-full md:w-2/3 h-full bg-white dark:bg-gradient-to-br md:dark:bg-gradient-to-r from-black via-[#020b19] to-black items-center px-10 md:px-20 lg:px-40">
        <div className="w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="block mb-10 md:hidden">
            <Logo />
          </div>
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                Sign in to your account
              </h2>
            </div>

            {hasGoogleClientId && (
              <Button
                label="Sign in with Google"
                icon={<FcGoogle />}
                styles="w-full flex flex-row-reverse gap-4 bg-white dark:bg-transparent text-black dark:text-white px-5 py-2.5 rounded-full border border-gray-300 hover:shadow-md transition-shadow duration-300"
                onClick={() => googleLogin()}
              />
            )}

            <Divider label="or sign in with email" />

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col rounded-md shadow-sm gap-5">
                <Inputbox
                  type="email"
                  label="Email address"
                  name="email"
                  value={formData.email}
                  placeholder="you@example.com"
                  onChange={handleChange}
                  isRequired
                />

                <Inputbox
                  type="password"
                  label="Password"
                  name="password"
                  value={formData.password}
                  placeholder="Password"
                  onChange={handleChange}
                  isRequired
                />
              </div>
              <Button
                label="Sign In"
                type="submit"
                styles="group relative w-full flex justify-center py-2.5 2xl:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-rose-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 mt-8"
              />
            </form>

            <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
              <p>
                Don't have an account?{" "}
                <Link to="/sign-up" className="text-orange-500 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default LoginPage;
