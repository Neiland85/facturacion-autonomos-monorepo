
import React from 'react';
import { HomeIcon, DocumentTextIcon, ChartBarIcon, CogIcon, AwardIcon } from './icons';
import { View } from '../types';
import { useSound } from '../hooks/useSound';

interface FooterProps {
  currentView: View;
  setView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ currentView, setView }) => {
  const { playSound } = useSound();

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: HomeIcon },
    { id: 'invoices', label: 'Facturas', icon: DocumentTextIcon },
    { id: 'fiscal', label: 'Análisis', icon: ChartBarIcon },
    { id: 'grants', label: 'Subvenciones', icon: AwardIcon },
    { id: 'settings', label: 'Ajustes', icon: CogIcon },
  ];

  const handleNavClick = (view: View) => {
    playSound('click');
    setView(view);
  };

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800">
      <nav className="flex justify-around max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as View)}
              className={`flex flex-col items-center justify-center p-3 w-full text-sm transition-colors duration-200 ${
                isActive ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400'
              }`}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;