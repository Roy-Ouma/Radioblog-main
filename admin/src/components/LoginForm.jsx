import {
  Button,
  Group,
  TextInput,
  useMantineColorScheme,
  Divider,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useInputState } from "@mantine/hooks";
import clsx from "clsx";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/index";
import { PasswordStrength } from "./PasswordStrength";
import { useSignin } from "../hooks/auth-hook";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API_URI } from "../utils";

const LoginForm = ({ toast, isSignin, setIsSignin, toggle, setFormClose }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === "dark";

  const { signIn } = useStore();
  const { data, isPemding, isSuccess, mutate } = useSignin(toast, toggle);

  const [strength, setStrength] = useState(0);
  const [passValue, setPassValue] = useInputState("");
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const handleSubmit = async (values) => {
    setFormClose(true);

    // call mutate and let the hook's onSuccess/onError handlers manage navigation and notifications
    mutate({
      ...values,
      password: passValue,
    });
  };

  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      // tokenResponse contains access_token when using this hook
      const accessToken = tokenResponse?.access_token;
      if (!accessToken) {
        toast?.error?.("Unable to acquire Google access token");
        return;
      }

      try {
        toggle();
        const { data } = await axios.post(`${API_URI}/auth/google`, {
          access_token: accessToken,
        });

        localStorage.setItem("user", JSON.stringify(data));
        toast?.success?.(data?.message || "Signed in with Google");
        setTimeout(() => window.location.replace("/"), 800);
      } catch (error) {
        toast?.error?.(error?.response?.data?.message || error.message);
      } finally {
        toggle();
      }
    },
    onError: (err) => {
      toast?.error?.("Google sign-in failed");
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className='flex flex-col gap-4'
    >
      <TextInput
        withAsterisk
        label='Email Address'
        placeholder='your@email.com'
        {...form.getInputProps("email")}
      />

      <PasswordStrength
        value={passValue}
        setValue={setPassValue}
        setStrength={setStrength}
        isSignin={true}
      />

      <Group
        className={clsx(
          "w-full flex",
          isSignin ? "justify-end" : " justify-between"
        )}
        mt='md'
      >
        <Button
          type='submit'
          className={clsx(theme ? "bg-blue-600" : "bg-black")}
        >
          Submit
        </Button>
      </Group>

      <Divider label='Or continue with' labelPosition='center' my='sm' />

      <Stack>
        <Button
          variant='outline'
          onClick={() => googleLogin()}
          className='w-full flex items-center justify-center gap-2'
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
          Sign in with Google
        </Button>
      </Stack>
      <p className='text-sm'>
        {isSignin ? "Don't have an account?" : "Already has an account?"}
        <span
          className='underline text-blue-600 ml-1 cursor-pointer'
          onClick={() => setIsSignin((prev) => !prev)}
        >
          {isSignin ? "Sign up" : "Sign in"}
        </span>
      </p>
    </form>
  );
};

export default LoginForm;
