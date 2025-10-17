import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon, LaptopIcon } from './icons';
import { Theme } from '../types';
import { useSound } from '../hooks/useSound';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { playSound } = useSound();

  const options: { name: Theme; icon: React.ReactNode }[] = [
    { name: 'light', icon: <SunIcon className="w-5 h-5" /> },
    { name: 'dark', icon: <MoonIcon className="w-5 h-5" /> },
    { name: 'system', icon: <LaptopIcon className="w-5 h-5" /> },
  ];

  const currentIcon = options.find(opt => opt.name === theme)?.icon;

  const handleToggleOpen = () => {
    playSound('click');
    setIsOpen(!isOpen);
  };

  const handleSelect = (newTheme: Theme) => {
    playSound('click');
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleOpen}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        aria-label="Toggle theme"
      >
        {currentIcon}
      </button>
      {isOpen && (
        <div 
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
            role="menu"
            aria-orientation="vertical"
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.name}
                onClick={() => handleSelect(option.name)}
                className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left ${
                    theme === option.name 
                        ? 'bg-slate-100 dark:bg-slate-700 text-orange-500' 
                        : 'text-slate-700 dark:text-slate-300'
                } hover:bg-slate-100 dark:hover:bg-slate-700`}
                role="menuitem"
              >
                {option.icon}
                <span className="capitalize">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;