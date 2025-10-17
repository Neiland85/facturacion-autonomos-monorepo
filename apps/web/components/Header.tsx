import React from 'react';
import TributariAppLogo from './TributariAppLogo';
import ThemeToggle from './ThemeToggle';
import { useSound } from '../hooks/useSound';

interface HeaderProps {
  onOcrClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOcrClick }) => {
  const { playSound } = useSound();
  
  const handleClick = () => {
    playSound('click');
    onOcrClick();
  }

  return (
    <header className="sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
      <div className="md:hidden">
        <TributariAppLogo />
      </div>
      <div className="hidden md:block">
        {/* Placeholder for breadcrumbs or page title */}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleClick}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">OCR</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;