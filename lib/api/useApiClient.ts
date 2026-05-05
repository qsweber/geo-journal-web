"use client";

import { useMemo } from "react";
import { useAuth } from "../auth/useAuth";
import { ApiClient } from "./client";

/**
 * Hook to get an authenticated API client, or null if NEXT_PUBLIC_API_URL is not configured.
 */
export const useApiClient = (): ApiClient | null => {
  const { getIdToken } = useAuth();

  return useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) return null;
    return new ApiClient({ baseUrl, getIdToken });
  }, [getIdToken]);
};
