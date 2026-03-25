'use client'

import * as React from 'react'

const ThemeContext = React.createContext({
  theme: 'dark',
  setTheme: (theme) => {},
})

export const useTheme = () => React.useContext(ThemeContext)

export function ThemeProvider({ children, defaultTheme = 'dark' }) {
  const [theme, setTheme] = React.useState(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || defaultTheme
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    setMounted(true)
  }, [defaultTheme])

  const toggleTheme = React.useCallback((newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }, [])

  const value = React.useMemo(() => ({
    theme,
    setTheme: toggleTheme
  }), [theme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
