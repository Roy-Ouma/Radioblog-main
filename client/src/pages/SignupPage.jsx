import { useGoogleLoginSafe } from '../hooks/useGoogleLoginSafe';
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Link } from "react-router-dom";
import { FcGoogle} from "react-icons/fc";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { getGoogleSignUp } from "../utils/apiCalls";
import useStore from "../store";



const SignupPage = () => {
  // guard against useStore() returning null/undefined during startup
  const store = useStore() || {};
  const user = store?.user ?? null;
  const signIn = store?.signIn ?? (() => {});
  const setIsLoading = store?.setIsLoading ?? (() => {});

  const [showForm, setShowForm] = useState(false);

  const hasGoogleClientId = !!process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  const GoogleLogin = useGoogleLoginSafe({
    onSuccess: async (tokenResponse) => {
      if (!hasGoogleClientId) {
        toast.error('Google OAuth is not configured.');
        return;
      }
      const setLoading = typeof setIsLoading === "function" ? setIsLoading : null;
      try {
        setLoading && setLoading(true);
        const userResp = await getGoogleSignUp(tokenResponse?.access_token);

        if (userResp?.success === true) {
          // signIn is provided by the store; persist the authenticated user
          signIn(userResp);
          if (userResp.token) window.location.replace("/");
          toast.success("Account created successfully!");
        } else {
          toast.error(userResp?.message || "Google Sign-Up failed. Please try again.");
        }
      } catch (err) {
        toast.error("Google Sign-Up failed. Please try again.");
      } finally {
        setLoading && setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google Sign-Up failed. Please try again.');
    },
  });

  // redirect only when user becomes available and has a token
  useEffect(() => {
    if (user && user.token) {
      window.location.replace("/");
    }
  }, [user]);
  

  return (
    <div className="flex w-full min-h-[100vh]">
      {/* Left side - Logo and Welcome (hidden on mobile) */}
      <div className="hidden md:flex flex-col gap-y-4 w-1/3 min-h-screen bg-gradient-to-b from-black to-gray-900 items-center justify-center px-8">
        <Logo type="Sign-up" />
        <span className="text-2xl font-bold text-white text-center">
          Join Our Community
        </span>
        <span className="text-gray-400 text-center text-sm max-w-xs">
          Share your stories, connect with readers, and grow your audience
        </span>
      </div>

      {/* Right side - Main content */}
      <div className="flex flex-col gap-y-4 w-full md:w-2/3 min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-[#0f172a] to-black items-center justify-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="w-full h-full flex flex-col items-center justify-center py-8 sm:py-12">
          {/* Mobile Logo */}
          <div className="block mb-8 md:hidden">
            <Logo />
          </div>

          {/* Header */}
          <div className="w-full max-w-md flex gap-3 md:gap-4 items-center justify-start mb-10">  
            {showForm && (
              <IoArrowBackCircleSharp 
                className="text-2xl lg:text-3xl cursor-pointer text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition"
                onClick={() => setShowForm(false)}
              />
            )}
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">
              {showForm ? "Create Account" : "Get Started"}
            </h2>
          </div>

          {/* Google Sign-Up Only */}
          <div className="w-full max-w-md space-y-4">
            {hasGoogleClientId && (
              <Button 
                onClick={() => GoogleLogin()}
                label="Sign up with Google"
                icon={<FcGoogle className="text-xl" />}
                styles="w-full flex items-center gap-3 justify-center bg-white dark:bg-gray-800 dark:border dark:border-gray-700 text-gray-900 dark:text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
              />
            )}

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-orange-500 dark:text-orange-400 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default SignupPage;
