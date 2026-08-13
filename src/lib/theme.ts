export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'chakra-test-theme-v1'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function resolveInitialTheme(stored: unknown, systemDark: boolean): Theme {
  if (isTheme(stored)) {
    return stored
  }

  return systemDark ? 'dark' : 'light'
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'>): Theme | null {
  try {
    const theme = storage.getItem(THEME_STORAGE_KEY)
    return isTheme(theme) ? theme : null
  } catch {
    return null
  }
}

export function writeStoredTheme(
  storage: Pick<Storage, 'setItem'>,
  theme: Theme
): boolean {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme)
    return true
  } catch {
    return false
  }
}
