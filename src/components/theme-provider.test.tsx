import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from './theme-provider'
import { ThemeToggle } from './theme-toggle'

type MediaListener = (event: MediaQueryListEvent) => void

function installMatchMedia(matches: boolean) {
  const listeners = new Set<MediaListener>()
  const mediaQuery = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_: string, listener: MediaListener) => listeners.add(listener),
    removeEventListener: (_: string, listener: MediaListener) => listeners.delete(listener),
    dispatchEvent: () => false,
  }

  window.matchMedia = (() => mediaQuery as unknown as MediaQueryList) as typeof window.matchMedia

  return {
    change(nextMatches: boolean) {
      Object.assign(mediaQuery, { matches: nextMatches })
      listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent))
    },
  }
}

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.style.colorScheme = ''
})

describe('ThemeProvider', () => {
  it('没有手动选择时响应系统主题变化', () => {
    const systemTheme = installMatchMedia(false)

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    expect(document.documentElement).toHaveClass('light')

    act(() => systemTheme.change(true))

    expect(document.documentElement).toHaveClass('dark')
  })

  it('手动切换后持久化并停止跟随系统', async () => {
    const user = userEvent.setup()
    const systemTheme = installMatchMedia(false)

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    await user.click(screen.getByRole('button', { name: '切换到深色模式' }))

    expect(document.documentElement).toHaveClass('dark')
    expect(window.localStorage.getItem('chakra-test-theme-v1')).toBe('dark')

    act(() => systemTheme.change(false))

    expect(document.documentElement).toHaveClass('dark')
  })
})
