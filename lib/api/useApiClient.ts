"use client";

import { useMemo } from "react";
import { useAuth } from "../auth/useAuth";
import { ApiClient } from "./client";

/**
 * Hook to get an authenticated API client
 */
export const useApiClient = () => {
  const { getIdToken } = useAuth();

  const apiClient = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_URL environment variable is not set. It must be defined to configure the API client base URL.",
      );
    }

    return new ApiClient({
      baseUrl,
      getIdToken,
    });
  }, [getIdToken]);

  return apiClient;
};
