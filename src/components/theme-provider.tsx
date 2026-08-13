'use client'

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react'
import { MotionConfig } from 'framer-motion'
import {
  getThemeStorage,
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

function getPreferredTheme(): Theme {
  const storage = getThemeStorage()
  const storedTheme = storage === null ? null : readStoredTheme(storage)
  return resolveInitialTheme(storedTheme, getSystemTheme())
}

function getServerTheme(): Theme {
  return 'light'
}

function subscribeToSystemTheme(onStoreChange: () => void) {
  const storage = getThemeStorage()
  if (storage !== null && readStoredTheme(storage) !== null) {
    return () => {}
  }

  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', onStoreChange)
    return () => mediaQuery.removeEventListener('change', onStoreChange)
  } catch {
    return () => {}
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [manualTheme, setManualTheme] = useState<Theme | null>(null)
  const subscribe = useCallback((onStoreChange: () => void) => {
    return manualTheme === null ? subscribeToSystemTheme(onStoreChange) : () => {}
  }, [manualTheme])
  const preferredTheme = useSyncExternalStore(
    subscribe,
    getPreferredTheme,
    getServerTheme
  )
  const theme = manualTheme ?? preferredTheme

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((nextTheme: Theme) => {
    setManualTheme(nextTheme)
    const storage = getThemeStorage()
    if (storage !== null) {
      writeStoredTheme(storage, nextTheme)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [setTheme, theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
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
