import {
  Button,
  Group,
  TextInput,
  useMantineColorScheme,
  Progress,
  Text,
  Divider,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useInputState } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import { BiImages } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "../hooks/auth-hook";
import { uploadFile } from "../utils";
import { PasswordStrength } from "./PasswordStrength";
import { clsx } from "clsx";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API_URI } from "../utils";

const SignUpForm = ({ toast, isSignin, setIsSignin, toggle, setFormClose }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === "dark";

  const { mutate } = useSignUp(toast, toggle);
  const [strength, setStrength] = useState(0);
  const [fileURL, setFileURL] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [passValue, setPassValue] = useInputState("");
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
    validate: {
      firstName: (value) =>
        value.length < 3 ? "First name is too short" : null,
      lastName: (value) => (value.length < 2 ? "Last name is too short" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const handleSubmit = (values) => {
    // For signup, ensure password meets strength requirement
    if (!isSignin) {
      if (strength < 90) {
        toast.error("Password is not strong enough. Please use uppercase, lowercase, numbers, and special characters.");
        return;
      }
    }
    
    if (isUploading) {
      toast.error("Please wait for the image upload to finish.");
      return;
    }
    setFormClose(true);

    const res = mutate({
      ...values,
      password: passValue,
      image: fileURL,
      accountType: "Writer",
    });
  };

  const googleSignup = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
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
    onError: () => toast?.error?.("Google sign-in failed"),
  });

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = async (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    const preview = URL.createObjectURL(selected);
    setPreviewUrl(preview);
    setFileURL("");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrl = await uploadFile(selected, {
        onProgress: (progress) => {
          setUploadProgress(Math.round(progress));
        },
      });
      setFileURL(uploadedUrl);
    } catch (error) {
      toast.error("Image upload failed. Please try again.");
      setFileURL("");
      if (preview) URL.revokeObjectURL(preview);
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
      // ensure progress reaches 100 when complete
      setUploadProgress((p) => (p >= 100 ? 100 : p));
    }
  };

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className='flex flex-col gap-3'
    >
      <div className='w-full flex gap-2 '>
        <TextInput
          className='w-full'
          withAsterisk
          label='First Name'
          placeholder='First Name'
          {...form.getInputProps("firstName")}
        />
        <TextInput
          className='w-full'
          withAsterisk
          label='Last Name'
          placeholder='Last Name'
          {...form.getInputProps("lastName")}
        />
      </div>

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
        isSignin={false}
      />

      <Group className={`w-full flex  justify-between`} mt='md'>
        <div className={`flex flex-col items-center justify-between`}>
          <label
            className={clsx(
              "flex items-center gap-2 text-base cursor-pointer",
              theme ? "text-gray-400" : "text-slate-700"
            )}
            htmlFor='imgUpload'
          >
            <input
              type='file'
              onChange={handleFileSelect}
              className='hidden'
              id='imgUpload'
            />

            <BiImages />
            <span>{isUploading ? "Uploading..." : "Profile Picture"}</span>
          </label>

          </div>

        {isUploading && (
          <div className="flex flex-col items-start w-full ml-4">
            <Text size="sm">Uploading image: {uploadProgress}%</Text>
            <Progress value={uploadProgress} size="sm" className="w-48 mt-1" />
          </div>
        )}

        <Button
          type='submit'
          className={clsx(theme ? "bg-blue-600" : "bg-black")}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Submit"}
        </Button>
      </Group>

      <Divider label='Or continue with' labelPosition='center' my='sm' />

      <Stack>
        <Button
          variant='outline'
          onClick={() => googleSignup()}
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
          Continue with Google
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

export default SignUpForm;
