"use client";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

// Create QueryClient with persistence configuration
// This is created the same way on both server and client to avoid hydration issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache for 24 hours
    },
  },
});

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Only set up persistence on the client side after mount
    // This ensures persistence doesn't interfere with SSR
    if (typeof window !== "undefined") {
      const localStoragePersister = createAsyncStoragePersister({
        storage: window.localStorage,
      });

      // Persist the query client to localStorage
      // React Query will automatically restore cached data in the background
      // We don't wait for restoration - React Query handles it gracefully
      // Queries will show loading states initially, then update when restored
      persistQueryClient({
        queryClient,
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours - cache expires after 24 hours
        buster: "", // Optional: add a version string to bust cache when needed (e.g., "v1.0.0")
      });
    }
  }, []);

  // Always render children immediately
  // React Query handles persistence restoration automatically without causing hydration issues
  // The queries will start in loading state and update when persistence is restored
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

