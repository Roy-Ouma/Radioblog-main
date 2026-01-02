import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { API_URI } from "../utils";

/**
 * Credentials-based authentication has been removed.
 * All users now authenticate via Google OAuth only.
 * 
 * The forms (LoginForm, SignUpForm) now show only Google sign-in buttons.
 * The /auth/google and /auth/google-signup endpoints handle all authentication.
 * Role assignment (writer vs user) is handled server-side based on app context.
 */

export const useResend = (toast, toggle) => {
  const mutation = useMutation({
    mutationFn: async (id) => {
      toggle();
      const { data } = await axios.post(`${API_URI}/users/resend-link/${id}`);

      return data;
    },
    onError: (error, data) => {
      toggle();
      toast.error(error?.response?.data?.message ?? error.message);
    },
    onSuccess: (data) => {
      toggle();
      toast.success(data?.message);

      localStorage.setItem(
        "otp_data",
        JSON.stringify({
          otpLevel: true,
          id: data.user._id,
        })
      );

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
  });
  
  return {
    ...mutation,
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useVerification = (toast) => {
  const mutation = useMutation({
    mutationFn: async ({ id, otp }) => {
      const { data } = await axios.post(`${API_URI}/users/verify/${id}/${otp}`);
      return data;
    },
    onError: (error, data) => {
      toast.error(error?.response?.data?.message ?? error.message);
    },
    onSuccess: (data) => {
      toast.success(data?.message);

      setTimeout(() => {
        localStorage.removeItem("otp_data");
        window.location.replace("/auth");
      }, 1000);
    },
  });
  
  return {
    ...mutation,
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
};
