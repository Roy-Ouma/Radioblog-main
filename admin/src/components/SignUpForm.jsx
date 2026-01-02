import {
  Button,
  Group,
  TextInput,
  Select,
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
      accountType: "Writer",
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

    // Ensure only allowed account types are sent
    const allowed = ["Writer", "Admin"];
    const chosen = allowed.includes(values.accountType) ? values.accountType : "Writer";

    const res = mutate({
      ...values,
      password: passValue,
      image: fileURL,
      accountType: chosen,
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
      className={clsx(
        'w-full rounded-2xl p-6 md:p-8 shadow-2xl',
        'border border-opacity-20',
        theme
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-blue-500'
          : 'bg-gradient-to-br from-white via-slate-50 to-white border-blue-200'
      )}
    >
      <div className='mb-4'>
        <h2 className={clsx(
          'text-xl font-bold mb-1',
          theme ? 'text-white' : 'text-gray-900'
        )}>
          Create Account
        </h2>
        <p className={clsx(
          'text-xs',
          theme ? 'text-gray-400' : 'text-gray-600'
        )}>
          Join our admin community
        </p>
      </div>

      <div className='w-full flex gap-3 mb-2'>
        <TextInput
          className='w-full'
          withAsterisk
          label='First Name'
          placeholder='John'
          styles={{
            input: {
              borderRadius: '0.5rem',
              height: '2.25rem',
              fontSize: '0.875rem',
              backgroundColor: theme ? '#1f2937' : '#f8fafc',
              borderColor: theme ? '#374151' : '#e2e8f0',
              color: theme ? '#f3f4f6' : '#1f2937',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
            },
            label: {
              fontWeight: 600,
              fontSize: '0.75rem',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            },
          }}
          {...form.getInputProps("firstName")}
        />
        <TextInput
          className='w-full'
          withAsterisk
          label='Last Name'
          placeholder='Doe'
          styles={{
            input: {
              borderRadius: '0.5rem',
              height: '2.25rem',
              fontSize: '0.875rem',
              backgroundColor: theme ? '#1f2937' : '#f8fafc',
              borderColor: theme ? '#374151' : '#e2e8f0',
              color: theme ? '#f3f4f6' : '#1f2937',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
            },
            label: {
              fontWeight: 600,
              fontSize: '0.75rem',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            },
          }}
          {...form.getInputProps("lastName")}
        />
      </div>

      <TextInput
        withAsterisk
        label='Email'
        placeholder='admin@example.com'
        className='mb-2'
        styles={{
          input: {
            borderRadius: '0.5rem',
            height: '2.25rem',
            fontSize: '0.875rem',
            backgroundColor: theme ? '#1f2937' : '#f8fafc',
            borderColor: theme ? '#374151' : '#e2e8f0',
            color: theme ? '#f3f4f6' : '#1f2937',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
          },
          label: {
            fontWeight: 600,
            fontSize: '0.75rem',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
          },
        }}
        {...form.getInputProps("email")}
      />

      <Select
        label="Account Type"
        placeholder="Select role"
        data={[{ value: "Writer", label: "Writer" }, { value: "Admin", label: "Admin" }]}
        className='mb-2'
        styles={{
          input: {
            borderRadius: '0.5rem',
            height: '2.25rem',
            fontSize: '0.875rem',
            backgroundColor: theme ? '#1f2937' : '#f8fafc',
            borderColor: theme ? '#374151' : '#e2e8f0',
            color: theme ? '#f3f4f6' : '#1f2937',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
          },
          label: {
            fontWeight: 600,
            fontSize: '0.75rem',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
          },
        }}
        {...form.getInputProps("accountType")}
      />

      <div className='mb-4'>
        <PasswordStrength
          value={passValue}
          setValue={setPassValue}
          setStrength={setStrength}
          isSignin={false}
        />
      </div>

      <Group className={`w-full mb-4 flex flex-col md:flex-row items-center justify-between gap-3`} mt='md'>
        <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed transition-colors ${theme ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'}`}>
          <label
            className={clsx(
              "flex items-center gap-2 text-sm cursor-pointer font-medium whitespace-nowrap",
              theme ? "text-gray-200 hover:text-blue-400" : "text-slate-700 hover:text-blue-600"
            )}
            htmlFor='imgUpload'
          >
            <input
              type='file'
              onChange={handleFileSelect}
              className='hidden'
              id='imgUpload'
            />

            <BiImages className='text-lg flex-shrink-0' />
            <span>{isUploading ? "Uploading..." : "Profile Pic"}</span>
          </label>

          </div>

        {isUploading && (
          <div className="flex flex-col items-start w-full md:w-auto">
            <Text size="xs" className={theme ? 'text-gray-400' : 'text-gray-700'}>Uploading: {uploadProgress}%</Text>
            <Progress value={uploadProgress} size="xs" className="w-40 mt-1" />
          </div>
        )}

        <Button
          type='submit'
          className={clsx(
            'h-12 font-semibold rounded-lg transition-all duration-200 flex-shrink-0',
            'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-600/50 text-white'
          )}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Create"}
        </Button>
      </Group>

      <Divider label='Or continue with' labelPosition='center' my='xs' className={theme ? 'opacity-50' : ''} />

      <Stack className='mt-4' gap='xs'>
        <Button
          variant='outline'
          onClick={() => googleSignup()}
          className={clsx(
            'w-full flex items-center justify-center gap-2 h-12 font-medium rounded-lg transition-all duration-200',
            theme
              ? 'border-gray-600 hover:bg-gray-700 text-gray-200'
              : 'border-gray-300 hover:bg-slate-50'
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
          Continue with Google
        </Button>
      </Stack>
      <p className={clsx(
        'text-sm mt-4 text-center font-medium',
        theme ? 'text-gray-300' : 'text-gray-700'
      )}>
        {isSignin ? "Don't have an account?" : "Already have an account?"}
        <span
          className='ml-2 text-blue-600 hover:text-blue-700 cursor-pointer font-semibold transition-colors'
          onClick={() => setIsSignin((prev) => !prev)}
        >
          {isSignin ? "Sign up" : "Sign in"}
        </span>
      </p>
    </form>
  );
};

export default SignUpForm;
