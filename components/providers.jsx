'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }))

  return (
    <ThemeProvider defaultTheme="light" enableSystem={false} forcedTheme="light">
      <QueryClientProvider client={queryClient}>
        <div className="glow-mesh">
          <div className="glow-1"></div>
          <div className="glow-2"></div>
        </div>
        <main className="relative z-10 w-full min-h-screen">
          {children}
        </main>
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
