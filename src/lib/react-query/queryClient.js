import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000, // 60 minute stale time
      cacheTime: 60 * 60 * 1000, // 60 minutes cache time
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      retry: 1, // Only retry failed queries once
    },
    mutations: {
      retry: 1, // Only retry failed mutations once
    },
  },
}); 
