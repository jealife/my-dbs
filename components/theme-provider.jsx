'use client'

import * as React from 'react'

const ThemeContext = React.createContext({
  theme: 'light',
  setTheme: () => {},
})

export const useTheme = () => React.useContext(ThemeContext)

function applyThemeClass(mode) {
  if (typeof window === 'undefined') return
  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
  } else {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }
}

export function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setThemeState] = React.useState(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  // On mount: read saved preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('dbs_theme') || defaultTheme
    setThemeState(saved)
    applyThemeClass(saved)
    setMounted(true)
  }, [defaultTheme])

  // When in 'auto' mode, listen to system preference changes
  React.useEffect(() => {
    if (theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => document.documentElement.classList.toggle('dark', e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = React.useCallback((newTheme) => {
    setThemeState(newTheme)
    localStorage.setItem('dbs_theme', newTheme)
    applyThemeClass(newTheme)
  }, [])

  const value = React.useMemo(() => ({ theme, setTheme, mounted }), [theme, setTheme, mounted])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
