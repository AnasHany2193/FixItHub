// src/providers/QueryClientProvider.jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds for faster updates
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: false,
    },
  },
});

// 🏆 Persist cache using localStorage
const persister = createSyncStoragePersister({ storage: window.localStorage });

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 30, // ⏳ Cache expires after 30 minutes
});

export const QueryProvider = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
