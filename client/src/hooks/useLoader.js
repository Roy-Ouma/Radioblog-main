import useStore from "../store";
import { useCallback } from "react";

/**
 * Custom hook to manage loading state across the app
 * Usage: const { withLoader, isLoading } = useLoader();
 * Then: await withLoader(async () => { ... });
 */
export const useLoader = () => {
  const store = useStore() || {};
  const isLoading = store?.isLoading ?? false;
  const setIsLoading = typeof store?.setIsLoading === "function" ? store.setIsLoading : null;

  const withLoader = useCallback(
    async (asyncFn) => {
      if (!setIsLoading) return asyncFn();
      try {
        setIsLoading(true);
        return await asyncFn();
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading]
  );

  return { withLoader, isLoading, setIsLoading };
};

export default useLoader;
