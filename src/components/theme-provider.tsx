'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  readStoredTheme,
  resolveInitialTheme,
  type Theme,
  writeStoredTheme,
} from '@/lib/theme'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [{ theme, hasManualSelection }, setThemeState] = useState(() => {
    if (typeof window === 'undefined') {
      return { theme: 'light' as Theme, hasManualSelection: false }
    }

    const storedTheme = readStoredTheme(window.localStorage)
    return {
      theme: resolveInitialTheme(storedTheme, getSystemTheme()),
      hasManualSelection: storedTheme !== null,
    }
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (hasManualSelection) {
      return
    }

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const updateTheme = (event: MediaQueryListEvent) => {
        setThemeState((current) => ({
          ...current,
          theme: event.matches ? 'dark' : 'light',
        }))
      }

      mediaQuery.addEventListener('change', updateTheme)
      return () => mediaQuery.removeEventListener('change', updateTheme)
    } catch {
      return
    }
  }, [hasManualSelection])

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState({ theme: nextTheme, hasManualSelection: true })
    writeStoredTheme(window.localStorage, nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [setTheme, theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (context === null) {
    throw new Error('useTheme 必须在 ThemeProvider 内使用')
  }

  return context
}
