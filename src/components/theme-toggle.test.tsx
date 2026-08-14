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
  it('用太阳、月亮和滑块呈现当前主题，并保留中文动作名称', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const toggle = screen.getByRole('button', { name: '切换到深色模式' })

    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(toggle.querySelectorAll('svg')).toHaveLength(2)
    expect(toggle.querySelector('.theme-toggle__track')).toBeInTheDocument()
    expect(toggle.querySelector('.theme-toggle__thumb')).toBeInTheDocument()
    expect(toggle.querySelector('.theme-toggle__track')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByText('浅色')).not.toBeInTheDocument()
    expect(screen.queryByText('深色')).not.toBeInTheDocument()
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
