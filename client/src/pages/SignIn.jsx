import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { getGoogleSignIn } from "../utils/apiCalls";
import useStore from "../store";

const SignIn = () => {
  const { setIsLoading, signIn } = useStore();

  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        setIsLoading(true);
        const result = await getGoogleSignIn(tokenResponse.access_token);
        setIsLoading(false);
        if (result?.success) {
          signIn(result);
          window.location.replace("/");
        } else {
          console.error("Google sign-in failed:", result);
        }
      } catch (err) {
        setIsLoading(false);
        console.error(err);
      }
    },
    onError: () => {
      console.error("Google login error");
    }
  });

  return (
    <button onClick={() => googleLogin()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white">
      <FcGoogle /> Sign in with Google
    </button>
  );
};

export default SignIn;