import { create } from 'zustand';

// Same synchronous-init pattern as authStore: read localStorage and apply
// the theme immediately at module load, before React's first render —
// otherwise the page paints in the default theme first and flashes to the
// stored one a moment later.
const STORAGE_KEY = 'theme';
const storedTheme = localStorage.getItem(STORAGE_KEY);
const initialTheme = storedTheme === 'light' ? 'light' : 'dark';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

applyTheme(initialTheme);

const useThemeStore = create((set, get) => ({
  theme: initialTheme,

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));

export default useThemeStore;
