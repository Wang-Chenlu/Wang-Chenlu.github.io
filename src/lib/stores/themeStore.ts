import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function normalizeTheme(theme: unknown): Theme {
  return theme === 'dark' ? 'dark' : 'light';
}

export function getDefaultThemeForLocale(locale: string | null | undefined): Theme {
  return locale?.toLowerCase().startsWith('zh') ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return getDefaultThemeForLocale(
    document.documentElement.getAttribute('data-locale') || document.documentElement.lang
  );
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme: Theme) => {
    const normalizedTheme = normalizeTheme(theme);
    set({ theme: normalizedTheme });
    updateTheme(normalizedTheme);
  },
  toggleTheme: () => {
    const current = get().theme;
    const newTheme = current === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    updateTheme(newTheme);
  },
}));

export function applyDefaultThemeForLocale(locale: string | null | undefined) {
  const theme = getDefaultThemeForLocale(locale);
  useThemeStore.setState({ theme });
  updateTheme(theme);
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  return normalizeTheme(theme);
}

function updateTheme(theme: Theme) {
  const effective = resolveTheme(theme);
  // Update DOM
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(effective);
  root.setAttribute('data-theme', effective);
}
