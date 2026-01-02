import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { API_URI } from "../utils";

export const useSignUp = (toast, toggle) => {
  return useMutation({
    mutationFn: async (formData) => {
      toggle();
      // Server route is /auth/signup
      const { data } = await axios.post(`${API_URI}/auth/signup`, formData);

      return data;
    },
    onError: (error, data) => {
      toggle();
      toast.error(error?.response?.data?.message ?? error.message);
    },
    onSuccess: (data) => {
      toggle();
      console.log(data);
      // Persist auth response so signup behaves like OAuth (user is authenticated)
      if (data?.token) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      toast.success(data?.message || "Account created");

      // If OTP verification is required, the server returns a pending status.
      // We still store the auth token so the user is considered signed-in on the client.
      // Redirect to the app root (behaves like Google OAuth). If you prefer
      // to force OTP verification first, switch to the otp-verification flow below.
      setTimeout(() => {
        window.location.replace("/");
      }, 800);
    },
  });
};

export const useSignin = (toast, toggle) => {
  return useMutation({
    mutationFn: async (formData) => {
      toggle();
      const { data } = await axios.post(`${API_URI}/auth/login`, formData);

      localStorage.setItem("user", JSON.stringify(data));

      return data;
    },
    onError: (error) => {
      toggle();
      toast.error(error?.response?.data?.message ?? error.message);
    },
    onSuccess: (data) => {
      toggle();
      toast.success(data?.message);

      setTimeout(() => {
        window.location.replace("/");
      }, 1000);
    },
  });
};

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
