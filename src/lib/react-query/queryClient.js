import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — navigate without blank flash
      gcTime: 30 * 60 * 1000, // 30 minutes cache
      refetchOnWindowFocus: false,
      refetchOnMount: false, // use cache when available
      retry: 1,
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      retry: 1,
    },
  },
}); 
