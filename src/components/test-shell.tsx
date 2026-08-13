'use client'

import { ThemeToggle } from './theme-toggle'

export function TestShell({
  children,
  middleLabel = 'Chakra Archetype Test',
  actions,
}: {
  children: React.ReactNode
  middleLabel?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="test-shell">
      <header className="test-shell__header">
        <nav className="test-shell__nav" aria-label="主要导航">
          <span className="test-shell__brand">圆圆如意</span>
          <span className="test-shell__middle-label">{middleLabel}</span>
          <span className="test-shell__actions">
            {actions}
            <ThemeToggle />
          </span>
        </nav>
      </header>
      <main className="test-shell__main">{children}</main>
    </div>
  )
}
