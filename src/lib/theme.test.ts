import {
  isTheme,
  readStoredTheme,
  resolveInitialTheme,
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
})
