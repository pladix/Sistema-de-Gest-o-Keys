import { create } from 'zustand';

interface ThemeStore {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { theme: newTheme };
    }),
}));