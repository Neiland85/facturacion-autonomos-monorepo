import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../types';

export const useTheme = (): [Theme, (theme: Theme) => void] => {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const storedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(storedTheme);
  }, []);

  const applyTheme = useCallback((selectedTheme: Theme) => {
    if (selectedTheme === 'dark' || (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  return [theme, handleSetTheme];
};
