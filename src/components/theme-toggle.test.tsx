import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from './theme-provider'
import { ThemeToggle } from './theme-toggle'

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.style.colorScheme = ''
})

describe('ThemeToggle', () => {
  it('有中文动作名称和 aria-pressed', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    expect(screen.getByRole('button', { name: '切换到深色模式' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByText('浅色')).toBeInTheDocument()
  })

  it.each(['{Enter}', ' '])('按 %s 可以切换主题', async (key) => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const toggle = screen.getByRole('button', { name: '切换到深色模式' })
    toggle.focus()
    await user.keyboard(key)

    expect(screen.getByRole('button', { name: '切换到浅色模式' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(window.localStorage.getItem('chakra-test-theme-v1')).toBe('dark')
  })
})
