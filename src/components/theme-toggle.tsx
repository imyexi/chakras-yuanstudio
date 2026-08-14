'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb" />
        <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={14} strokeWidth={1.75} />
        <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={14} strokeWidth={1.75} />
      </span>
    </button>
  )
}
