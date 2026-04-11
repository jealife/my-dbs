'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'react-hot-toast'
import { SplashScreen } from '@/components/splash-screen'
import { AnimatePresence } from 'framer-motion'

export function Providers({ children }) {
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    // Minimum 2s splash screen for brand consistency and initialization
    const timer = setTimeout(() => {
      setAppLoading(false)
      // Request browser notification permission after splash (if not yet decided)
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }, 2500)

    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => console.log('[MyDBS] PWA ServiceWorker: Registered', reg.scope),
          (err) => console.log('[MyDBS] PWA ServiceWorker: Failed', err)
        );
      });
    }

    return () => clearTimeout(timer)
  }, []);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }))

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AnimatePresence>
          {appLoading && <SplashScreen key="splash" />}
        </AnimatePresence>
        
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
