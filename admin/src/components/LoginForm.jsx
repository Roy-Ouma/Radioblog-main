import {
  Button,
  Divider,
  Stack,
  useMantineColorScheme,
} from "@mantine/core";
import clsx from "clsx";
import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API_URI } from "../utils";

const LoginForm = ({ toast, isSignin, setIsSignin }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === "dark";
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const accessToken = tokenResponse?.access_token;
      if (!accessToken) {
        toast?.error?.("Unable to acquire Google access token");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.post(`${API_URI}/auth/google`, {
          access_token: accessToken,
        });

        localStorage.setItem("user", JSON.stringify(data));
        toast?.success?.(data?.message || "Signed in successfully");
        setTimeout(() => window.location.replace("/"), 800);
      } catch (error) {
        toast?.error?.(error?.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      toast?.error?.("Google sign-in failed");
    },
  });

  return (
    <form className={clsx(
      'w-full rounded-xl p-8 shadow-lg border',
      theme
        ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-blue-500/30'
        : 'bg-gradient-to-br from-white via-slate-50 to-white border-slate-200'
    )}>
      <div className='mb-8'>
        <h2 className={clsx(
          'text-2xl font-bold mb-2',
          theme ? 'text-white' : 'text-slate-900'
        )}>
          Sign In
        </h2>
        <p className={clsx(
          'text-sm font-medium',
          theme ? 'text-slate-400' : 'text-slate-600'
        )}>
          Sign in to your account with Google
        </p>
      </div>

      <Stack className='mt-8'>
        <Button
          onClick={() => googleLogin()}
          disabled={loading}
          className={clsx(
            'w-full flex items-center justify-center gap-3 h-12 font-semibold rounded-lg transition-all duration-200',
            theme
              ? 'border-slate-600 hover:bg-slate-700 text-slate-100 hover:text-white'
              : 'border-slate-300 hover:bg-slate-100 text-slate-900',
            'border'
          )}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 48 48'
            className='w-5 h-5'
          >
            <path fill='#fff' d='M0 0h48v48H0z' />
            <path d='M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.5 5.5-6.7 7.1v5.9h10.8c6.3-5.8 9.9-14.3 9.9-25 0-1.8-.2-3.6-.6-5.3z' fill='#4285F4'/>
            <path d='M6.3 14.3l6.9 5.1C15 15 19.1 12 24 12c5.1 0 9.5 2 12.4 5.2l7.4-7.4C36.8 4.6 30.8 2 24 2 15.7 2 8.8 6.9 6.3 14.3z' fill='#EA4335'/>
            <path d='M24 46c6.8 0 12.8-2.6 17.1-6.9l-8.3-6.4C30.9 35 27.6 36 24 36c-5.2 0-9.6-2-12.5-5l-8 6.1C8.8 41.9 15.7 46 24 46z' fill='#FBBC05'/>
            <path d='M43.6 20.5H42V20H24v8h11.3c-1 2.7-2.9 5.1-5.6 6.7-1.8 1-3.9 1.6-6.1 1.6-5.1 0-9.5-2-12.4-5.2l-7 5.2C8.8 41.9 15.7 46 24 46c8.8 0 16.2-4.4 20.8-11 1.3-2 2.3-4.3 3-6.7.2-.7.4-1.4.6-2.1 0-1.8-.2-3.6-.6-5.3z' fill='none' />
          </svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>
      </Stack>

      <Divider my='md' />

      <p className={clsx(
        'text-sm mt-8 text-center font-medium',
        theme ? 'text-slate-400' : 'text-slate-700'
      )}>
        Don't have an account?
        <span
          className='ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-semibold transition-colors'
          onClick={() => setIsSignin(false)}
        >
          Sign up
        </span>
      </p>
    </form>
  );
};

export default LoginForm;
