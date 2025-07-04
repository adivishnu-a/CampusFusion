'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-dark-bg-secondary dark:hover:bg-dark-bg-tertiary transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-700 dark:text-dark-text" />
      ) : (
        <Sun className="h-5 w-5 text-gray-700 dark:text-dark-text" />
      )}
    </button>
  );
};

export default ThemeSwitcher;