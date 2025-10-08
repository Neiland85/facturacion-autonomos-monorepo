import type { ReactNode } from 'react';
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';

// Iconos personalizados
const ChevronLeftIcon = ({ className }: { className?: string }) => (
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
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
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
      d="M9 5l7 7-7 7"
    />
  </svg>
);

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const getPositionStyles = () => {
    if (!triggerRef.current || !tooltipRef.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    switch (position) {
      case 'top':
        return {
          top: triggerRect.top - tooltipRect.height - 8,
          left:
            triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
        };
      case 'bottom':
        return {
          top: triggerRect.bottom + 8,
          left:
            triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
        };
      case 'left':
        return {
          top:
            triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
          left: triggerRect.left - tooltipRect.width - 8,
        };
      case 'right':
        return {
          top:
            triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
          left: triggerRect.right + 8,
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg max-w-xs ${className}`}
            style={getPositionStyles()}
          >
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === 'top'
                  ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                  : position === 'bottom'
                    ? 'top-[-4px] left-1/2 -translate-x-1/2'
                    : position === 'left'
                      ? 'right-[-4px] top-1/2 -translate-y-1/2'
                      : 'left-[-4px] top-1/2 -translate-y-1/2'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  showCloseButton?: boolean;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'md',
  title,
  showCloseButton = true,
  className = '',
}: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getSizeClasses = () => {
    const sizeMap = {
      sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
      md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
      lg:
        position === 'left' || position === 'right' ? 'w-[32rem]' : 'h-[32rem]',
      xl:
        position === 'left' || position === 'right' ? 'w-[40rem]' : 'h-[40rem]',
      full: position === 'left' || position === 'right' ? 'w-full' : 'h-full',
    };
    return sizeMap[size];
  };

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 bg-white shadow-xl';

    switch (position) {
      case 'left':
        return `${baseClasses} left-0 top-0 h-full ${getSizeClasses()}`;
      case 'right':
        return `${baseClasses} right-0 top-0 h-full ${getSizeClasses()}`;
      case 'top':
        return `${baseClasses} top-0 left-0 w-full ${getSizeClasses()}`;
      case 'bottom':
        return `${baseClasses} bottom-0 left-0 w-full ${getSizeClasses()}`;
      default:
        return baseClasses;
    }
  };

  const getInitialAnimation = () => {
    switch (position) {
      case 'left':
        return { x: '-100%' };
      case 'right':
        return { x: '100%' };
      case 'top':
        return { y: '-100%' };
      case 'bottom':
        return { y: '100%' };
      default:
        return {};
    }
  };

  const getAnimateAnimation = () => {
    switch (position) {
      case 'left':
      case 'right':
        return { x: 0 };
      case 'top':
      case 'bottom':
        return { y: 0 };
      default:
        return {};
    }
  };

  const getExitAnimation = () => {
    return getInitialAnimation();
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={getInitialAnimation()}
            animate={getAnimateAnimation()}
            exit={getExitAnimation()}
            transition={{ type: 'tween', duration: 0.3 }}
            className={getPositionClasses() + ' ' + className}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Popover({
  isOpen,
  onClose,
  trigger,
  children,
  position = 'bottom',
  className = '',
}: PopoverProps) {
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const getPositionStyles = () => {
    if (!triggerRect) return {};

    const popoverRect = popoverRef.current?.getBoundingClientRect();
    if (!popoverRect) return {};

    switch (position) {
      case 'top':
        return {
          top: triggerRect.top - popoverRect.height - 8,
          left:
            triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2,
        };
      case 'bottom':
        return {
          top: triggerRect.bottom + 8,
          left:
            triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2,
        };
      case 'left':
        return {
          top:
            triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2,
          left: triggerRect.left - popoverRect.width - 8,
        };
      case 'right':
        return {
          top:
            triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2,
          left: triggerRect.right + 8,
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => onClose()}
        className="inline-block cursor-pointer"
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={onClose}
            />

            {/* Popover */}
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}
              style={getPositionStyles()}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  isOpen,
  onToggle,
  position = 'bottom',
  className = '',
}: DropdownProps) {
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const getPositionStyles = () => {
    if (!triggerRect) return {};

    switch (position) {
      case 'top':
        return {
          bottom: window.innerHeight - triggerRect.top + 8,
          left: triggerRect.left,
        };
      case 'bottom':
        return {
          top: triggerRect.bottom + 8,
          left: triggerRect.left,
        };
      case 'left':
        return {
          top: triggerRect.top,
          right: window.innerWidth - triggerRect.left + 8,
        };
      case 'right':
        return {
          top: triggerRect.top,
          left: triggerRect.right + 8,
        };
      default:
        return {};
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div className="relative">
      <div ref={triggerRef} onClick={onToggle} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] ${className}`}
            style={getPositionStyles()}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
