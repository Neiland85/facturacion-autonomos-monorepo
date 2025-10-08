import type { ReactNode } from 'react';
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

// Iconos personalizados
const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  onClick?: () => void;
}

interface NavigationProps {
  items: NavItem[];
  activePath?: string;
  onNavigate?: (href: string) => void;
  className?: string;
}

export function Navigation({
  items,
  activePath,
  onNavigate,
  className = '',
}: NavigationProps) {
  const handleClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (onNavigate) {
      onNavigate(item.href);
    }
  };

  return (
    <nav className={`flex items-center space-x-6 ${className}`}>
      {items.map(item => {
        const isActive = activePath === item.href;
        const Icon = item.icon;

        return (
          <button
            key={item.href}
            onClick={() => handleClick(item)}
            className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
            {item.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

interface MobileNavigationProps {
  items: NavItem[];
  activePath?: string;
  onNavigate?: (href: string) => void;
  trigger?: ReactNode;
}

export function MobileNavigation({
  items,
  activePath,
  onNavigate,
  trigger,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (onNavigate) {
      onNavigate(item.href);
    }
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <MenuIcon className="w-6 h-6" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menú</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <nav className="flex flex-col space-y-1 p-4">
          {items.map((item, index) => {
            const isActive = activePath === item.href;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleClick(item)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
}

export function Breadcrumbs({
  items,
  separator,
  className = '',
}: BreadcrumbsProps) {
  const defaultSeparator = (
    <svg
      className="w-4 h-4 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <span className="mx-2 text-muted-foreground">
              {separator || defaultSeparator}
            </span>
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({
  items,
  activeTab,
  onTabChange,
  className = '',
}: TabsProps) {
  return (
    <div className={`border-b ${className}`}>
      <div className="flex space-x-8">
        {items.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.label}
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
