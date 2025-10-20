import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from '@tanstack/react-query';
import type { FC, ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

interface QueryClientProviderProps {
  children: ReactNode;
}

export const QueryClientProvider: FC<QueryClientProviderProps> = ({ children }) => {
  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
};

export default queryClient;
