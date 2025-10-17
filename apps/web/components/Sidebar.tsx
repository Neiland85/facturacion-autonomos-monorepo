
import React from 'react';
import TributariAppLogo from './TributariAppLogo';
import { HomeIcon, DocumentTextIcon, ChartBarIcon, CogIcon, AwardIcon, SwitchHorizontalIcon } from './icons';
import { View, SubscriptionTier, UserProfile } from '../types';
import { useSound } from '../hooks/useSound';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  subscriptionTier: SubscriptionTier;
  userProfile: UserProfile | null;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors duration-200 ${
        isActive
          ? 'bg-orange-500 text-white shadow-md'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-semibold">{label}</span>
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, subscriptionTier, userProfile }) => {
  const { playSound } = useSound();

  const baseNavItems = [
    { id: 'dashboard', label: 'Inicio', icon: HomeIcon },
    { id: 'invoices', label: 'Facturas', icon: DocumentTextIcon },
    { id: 'fiscal', label: 'Análisis', icon: ChartBarIcon },
    { id: 'grants', label: 'Subvenciones', icon: AwardIcon },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Ajustes', icon: CogIcon },
  ];

  if (subscriptionTier === 'enterprise') {
    baseNavItems.push({ id: 'multi-account', label: 'Multi-Cuenta', icon: SwitchHorizontalIcon });
  }

  const handleNavClick = (view: View) => {
    playSound('click');
    setView(view);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4">
      <div className="p-2 mb-8">
        <TributariAppLogo />
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {baseNavItems.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={currentView === item.id}
              onClick={() => handleNavClick(item.id as View)}
            />
          ))}
        </ul>
      </nav>
      <div className="flex-shrink-0">
         <ul className="space-y-2 mb-4">
            {bottomNavItems.map((item) => (
                <NavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                isActive={currentView === item.id}
                onClick={() => handleNavClick(item.id as View)}
                />
            ))}
        </ul>
        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={userProfile?.companyName || 'Usuario'}>
                {userProfile?.companyName || 'Mi Empresa'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                Plan {subscriptionTier}
            </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;