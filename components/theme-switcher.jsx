'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-xl glass-card transition-all opacity-0">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-xl glass-card hover:bg-(--glass-border) transition-all flex items-center justify-center cursor-pointer group"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400 group-hover:scale-110 transition-transform" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-primary group-hover:scale-110 transition-transform" />
      )}
    </button>
  )
}
