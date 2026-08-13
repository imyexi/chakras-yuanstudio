import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

function makeLocalStorageUnavailable() {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('存储不可用')
    },
  })

  return () => {
    Object.defineProperty(window, 'localStorage', descriptor!)
  }
}

describe('ThemeProvider', () => {
  it('服务端浅色标记在客户端深色首屏接管后无 hydration 错误', async () => {
    const serverMarkup = renderToString(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    const container = document.createElement('div')
    container.innerHTML = serverMarkup
    document.body.appendChild(container)
    installMatchMedia(true)
    window.localStorage.setItem('chakra-test-theme-v1', 'dark')
    document.documentElement.className = 'dark'
    document.documentElement.style.colorScheme = 'dark'
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      await act(async () => {
        hydrateRoot(
          container,
          <ThemeProvider>
            <ThemeToggle />
          </ThemeProvider>
        )
      })

      expect(screen.getByRole('button', { name: '切换到浅色模式' })).toHaveTextContent('深色')
      expect(document.documentElement).toHaveClass('dark')
      expect(consoleError).not.toHaveBeenCalled()
    } finally {
      consoleError.mockRestore()
      container.remove()
    }
  })

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

  it('localStorage 属性访问失败时仍跟随系统主题', () => {
    const systemTheme = installMatchMedia(true)
    const restoreStorage = makeLocalStorageUnavailable()

    try {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      )

      expect(document.documentElement).toHaveClass('dark')
      act(() => systemTheme.change(false))
      expect(document.documentElement).toHaveClass('light')
    } finally {
      restoreStorage()
    }
  })

  it('getItem 失败时仍跟随系统主题', () => {
    const systemTheme = installMatchMedia(true)
    const storage = window.localStorage
    const getItem = storage.getItem
    storage.getItem = () => {
      throw new Error('读取失败')
    }

    try {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      )

      expect(document.documentElement).toHaveClass('dark')
      act(() => systemTheme.change(false))
      expect(document.documentElement).toHaveClass('light')
    } finally {
      storage.getItem = getItem
    }
  })

  it('matchMedia 失败时安全回退浅色', () => {
    window.matchMedia = (() => {
      throw new Error('媒体查询不可用')
    }) as typeof window.matchMedia

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    expect(document.documentElement).toHaveClass('light')
  })

  it('手动切换在存储不可用时仍更新主题', async () => {
    const user = userEvent.setup()
    installMatchMedia(false)
    const restoreStorage = makeLocalStorageUnavailable()

    try {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      )

      await user.click(screen.getByRole('button', { name: '切换到深色模式' }))
      expect(document.documentElement).toHaveClass('dark')
    } finally {
      restoreStorage()
    }
  })
})
