'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="dash-theme-toggle"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
    >
      <div className="dash-toggle-track">
        <div className={`dash-toggle-thumb ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
          {theme === 'light' ? (
            <Moon className="h-3.5 w-3.5" />
          ) : (
            <Sun className="h-3.5 w-3.5" />
          )}
        </div>
        <span className="dash-toggle-label">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      </div>
    </button>
  );
}
