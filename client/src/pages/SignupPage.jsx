import { useGoogleLoginSafe } from '../hooks/useGoogleLoginSafe';
import React, { useEffect, useState } from "react";
import { BiImages} from "react-icons/bi";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Toaster, toast } from "sonner";
import { Link } from "react-router-dom";
import { FcGoogle} from "react-icons/fc";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import Logo from "../components/Logo";
import Button from "../components/Button";
import Divider from "../components/Divider";
import Inputbox from "../components/Inputbox";
import { getGoogleSignUp, emailSignUp } from "../utils/apiCalls";
import useStore from "../store";
import { saveUserInfo } from "../utils/index";
import { uploadFile } from "../utils/index";



const SignupPage = () => {
  // guard against useStore() returning null/undefined during startup
  const store = useStore() || {};
  const user = store?.user ?? null;
  const signIn = store?.signIn ?? (() => {});
  const setIsLoading = store?.setIsLoading ?? (() => {});

  const [showForm, setShowForm] = useState(false);
  const [Data, setData] = useState({
   firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
    profile: ""
  });
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // quick confirm-password check (non-submitting)
  const confirmPassword = (e) => {
    // prevent accidental form submit if used inside form
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!Data.password || !Data.confirmpassword) {
      toast.error("Please enter both password fields to confirm.");
      return;
    }
    if (Data.password === Data.confirmpassword) {
      toast.success("Passwords match.");
    } else {
      toast.error("Passwords do not match.");
    }
  };

    const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...Data,
      [name]: value
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // prevent double submits
    if (handleSubmit.__running) return;
    handleSubmit.__running = true;

    const setLoading = typeof setIsLoading === "function" ? setIsLoading : null;

    // basic client validation
    if (Data.password !== Data.confirmpassword) {
      toast.error("Passwords do not match.");
      handleSubmit.__running = false;
      return;
    }

    try {
      setLoading && setLoading(true);

      // ensure image is uploaded and we have a remote URL (uploadFile may return the url)
      let imageUrl = fileURL;
      if (file) {
        try {
          const uploadResult = await uploadFile(setFileURL, file);
          // prefer explicit return from uploadFile if provided
          if (typeof uploadResult === "string" && uploadResult.length) imageUrl = uploadResult;
        } catch (err) {
          toast.error("Image upload failed. Please try again or continue without an image.");
          // continue without aborting submission
        }
      }

      const result = await emailSignUp({ ...Data, image: imageUrl });

      if (result?.success) {
        saveUserInfo(result, signIn);
      } else {
        toast.error(result?.message || "Sign up failed. Please try again.");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Sign up failed. Please try again.";
      toast.error(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setLoading && setLoading(false);
      handleSubmit.__running = false;
    }
  };
   
  // redirect only when user becomes available and has a token
  useEffect(() => {
    if (user && user.token) {
      window.location.replace("/");
    }
  }, [user]);

  // upload when `file` changes
  useEffect(() => {
    let objectUrl;
    const setLoading = typeof setIsLoading === "function" ? setIsLoading : null;
    if (file) {
      // show local preview quickly
      try {
        objectUrl = URL.createObjectURL(file);
        setFileURL(objectUrl);
      } catch {}

      (async () => {
        try {
          setLoading && setLoading(true);
          await uploadFile(setFileURL, file);
        } catch (err) {
          toast.error("Image upload failed.");
        } finally {
          setLoading && setLoading(false);
        }
      })();
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, setIsLoading]);
  

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

          {showForm ? (
            /* Email Form */
            <form className="w-full max-w-md space-y-5" onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <Inputbox
                  type="text"
                  label="First Name"
                  name="firstname"
                  value={Data.firstname}
                  placeholder="John"
                  onChange={handleChange}
                  isRequired={true}
                />
                <Inputbox
                  type="text"
                  label="Last Name"
                  name="lastname"
                  value={Data.lastname}
                  placeholder="Doe"
                  onChange={handleChange}
                  isRequired={true}
                />
              </div>

              {/* Email */}
              <Inputbox
                type="email"
                label="Email Address"
                name="email"
                isRequired={true}
                value={Data.email}
                placeholder="you@example.com"
                onChange={handleChange}
              />

              {/* Password Fields */}
              <div className="relative">
                <Inputbox
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  name="password"
                  isRequired={true}
                  value={Data.password}
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Inputbox
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  name="confirmpassword"
                  isRequired={true}
                  value={Data.confirmpassword}
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                  aria-label={showConfirmPassword ? "Hide" : "Show"}
                >
                  {showConfirmPassword ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
                </button>
              </div>

              {/* Profile Picture Upload */}
              <div className="py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="imgUpload"
                    className="flex items-center gap-2 text-sm md:text-base text-gray-700 dark:text-gray-300 cursor-pointer hover:text-orange-500 dark:hover:text-orange-400 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("imgUpload")?.click();
                    }}
                  >
                    <BiImages size={20} />
                    <span className="font-medium">{file ? file.name : "Upload Picture"}</span>
                  </label>
                  <input
                    id="imgUpload"
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setFile(f);
                      try {
                        setFileURL(URL.createObjectURL(f));
                      } catch {}
                    }}
                    className="hidden"
                    accept="image/*"
                  />
                  {file && (
                    <button
                      type="button"
                      onClick={() => document.getElementById("imgUpload")?.click()}
                      className="px-2 py-1 text-xs md:text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link to="/sign-in" className="text-orange-500 dark:text-orange-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                label="Create Account"
                type="submit"
                styles="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white font-semibold rounded-lg hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition transform hover:scale-105"
              />
            </form>
          ) : (
            /* OAuth Options */
            <div className="w-full max-w-md space-y-4">
              {hasGoogleClientId && (
                <Button 
                  onClick={() => GoogleLogin()}
                  label="Sign up with Google"
                  icon={<FcGoogle className="text-xl" />}
                  styles="w-full flex items-center gap-3 justify-center bg-white dark:bg-gray-800 dark:border dark:border-gray-700 text-gray-900 dark:text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                />
              )}
              <Divider label="or continue with email"/>
              <Button 
                onClick={() => setShowForm(true)}
                label="Continue with Email"
                styles="w-full bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
              />
            </div>
          )}
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default SignupPage;
