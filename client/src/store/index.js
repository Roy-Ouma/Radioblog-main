import { create } from "zustand";
import { setAuthHeader } from "../utils/apiCalls";

const AUTH_STORAGE_KEY = "masenoAuthState";

const loadAuthState = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    const legacy = localStorage.getItem("userInfo");
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.token && parsed?.user) {
        return parsed;
      }
    }
  } catch {
    return null;
  }
};

const persistAuthState = (value) => {
  try {
    if (value) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Swallow storage errors to avoid breaking auth flow in private browsing.
  }
};

const normalizeAuthPayload = (payload) => {
  if (!payload) return null;
  const candidate = payload?.token && payload?.user ? payload : payload?.data;
  if (candidate?.token && candidate?.user) {
    return {
      token: candidate.token,
      user: candidate.user,
    };
  }
  return null;
};

const initialAuthState = loadAuthState();
if (initialAuthState?.token) {
  setAuthHeader(initialAuthState.token);
}

const useStore = create((set) => ({
  user: initialAuthState,
  isLoading: false,
  theme: localStorage.getItem("theme") ?? "light",

  signIn: (payload) => {
    const normalized = normalizeAuthPayload(payload);
    if (!normalized) return;
    persistAuthState(normalized);
    setAuthHeader(normalized.token);
    set({ user: normalized });
  },

  signOut: () => {
    persistAuthState(null);
    setAuthHeader();
    set({ user: null });
  },

  setTheme: (value) => {
    localStorage.setItem("theme", value);
    set({ theme: value });
  },

  setIsLoading: (val) => set({ isLoading: Boolean(val) }),
}));

export default useStore;