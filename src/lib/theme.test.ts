import {
  isTheme,
  readStoredTheme,
  resolveInitialTheme,
  THEME_INITIALIZER_SCRIPT,
  THEME_STORAGE_KEY,
  writeStoredTheme,
} from './theme'
import { describe, expect, it } from 'vitest'

describe('主题存储与解析', () => {
  it('仅接受浅色和深色主题值', () => {
    expect(isTheme('light')).toBe(true)
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('system')).toBe(false)
    expect(isTheme(null)).toBe(false)
  })

  it('优先使用合法的手动本地主题值', () => {
    expect(resolveInitialTheme('dark', false)).toBe('dark')
    expect(resolveInitialTheme('light', true)).toBe('light')
  })

  it('在本地值缺失或非法时跟随系统主题', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark')
    expect(resolveInitialTheme('system', false)).toBe('light')
  })

  it('读取本地存储异常时返回空值，供解析函数安全回退', () => {
    const storage = {
      getItem: () => {
        throw new Error('存储不可用')
      },
    }

    expect(readStoredTheme(storage)).toBeNull()
    expect(resolveInitialTheme(readStoredTheme(storage), false)).toBe('light')
  })

  it('写入本地存储异常时返回失败而不抛错', () => {
    const storage = {
      setItem: () => {
        throw new Error('存储不可用')
      },
    }

    expect(writeStoredTheme(storage, 'dark')).toBe(false)
  })

  it('将主题写入固定的本地存储键', () => {
    const stored: Record<string, string> = {}
    const storage = {
      setItem: (key: string, value: string) => {
        stored[key] = value
      },
    }

    expect(writeStoredTheme(storage, 'dark')).toBe(true)
    expect(stored).toEqual({ [THEME_STORAGE_KEY]: 'dark' })
  })

  it('首屏脚本在存储不可用时仍按系统深色主题初始化', () => {
    const root = document.documentElement
    root.className = ''
    root.style.colorScheme = ''
    const fakeWindow = {
      matchMedia: () => ({ matches: true }),
      get localStorage(): Storage {
        throw new Error('存储不可用')
      },
    }

    new Function('window', 'document', THEME_INITIALIZER_SCRIPT)(fakeWindow, document)

    expect(root).toHaveClass('dark')
    expect(root.style.colorScheme).toBe('dark')
  })

  it('首屏脚本在存储和媒体查询都不可用时安全回退浅色', () => {
    const root = document.documentElement
    root.className = 'dark'
    const fakeWindow = {
      matchMedia: () => {
        throw new Error('媒体查询不可用')
      },
      get localStorage(): Storage {
        throw new Error('存储不可用')
      },
    }

    new Function('window', 'document', THEME_INITIALIZER_SCRIPT)(fakeWindow, document)

    expect(root).toHaveClass('light')
    expect(root.style.colorScheme).toBe('light')
  })
})
