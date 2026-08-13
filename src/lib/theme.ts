export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'chakra-test-theme-v1'

export const THEME_INITIALIZER_SCRIPT = `(function(){try{if('scrollRestoration' in window.history){window.history.scrollRestoration='manual'}}catch(error){}var stored=null;try{stored=window.localStorage.getItem('${THEME_STORAGE_KEY}')}catch(error){}var systemDark=false;try{systemDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches}catch(error){}var theme=stored==='light'||stored==='dark'?stored:(systemDark?'dark':'light');var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(theme);root.style.colorScheme=theme})();`

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

export function getThemeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
