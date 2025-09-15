import { useEffect, useState } from 'react';

// Componentes de overlays y elementos superpuestos para TributariApp
// Modales, tooltips, drawers y otros componentes de interfaz superpuesta

export { Alert, ConfirmDialog, LoadingOverlay, Modal } from './modal';
export { ToastNotification, toastSystem } from './toast';
export { Drawer, Dropdown, Popover, Tooltip } from './tooltip-drawer';

// Tipos comunes para overlays
export interface OverlayPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export interface OverlayAnimation {
  initial: any;
  animate: any;
  exit: any;
  transition?: any;
}

// Configuraciones predeterminadas para overlays
export const OVERLAY_DEFAULTS = {
  modal: {
    size: 'md' as const,
    showCloseButton: true,
    backdropOpacity: 0.5,
  },
  drawer: {
    position: 'right' as const,
    size: 'md' as const,
    showCloseButton: true,
  },
  tooltip: {
    position: 'top' as const,
    delay: 300,
  },
  alert: {
    autoClose: false,
    autoCloseDelay: 5000,
    position: 'top-right' as const,
  },
} as const;

// Utilidades para overlays
export const getViewportDimensions = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const isElementInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const calculateOptimalPosition = (
  triggerRect: DOMRect,
  overlayRect: DOMRect,
  preferredPosition: 'top' | 'bottom' | 'left' | 'right'
): OverlayPosition => {
  const viewport = getViewportDimensions();
  const positions = {
    top: {
      top: triggerRect.top - overlayRect.height - 8,
      left: triggerRect.left + triggerRect.width / 2 - overlayRect.width / 2,
    },
    bottom: {
      top: triggerRect.bottom + 8,
      left: triggerRect.left + triggerRect.width / 2 - overlayRect.width / 2,
    },
    left: {
      top: triggerRect.top + triggerRect.height / 2 - overlayRect.height / 2,
      left: triggerRect.left - overlayRect.width - 8,
    },
    right: {
      top: triggerRect.top + triggerRect.height / 2 - overlayRect.height / 2,
      left: triggerRect.right + 8,
    },
  };

  // Verificar si la posición preferida cabe en el viewport
  const preferred = positions[preferredPosition];
  const fitsPreferred =
    preferred.left >= 0 &&
    preferred.left + overlayRect.width <= viewport.width &&
    preferred.top >= 0 &&
    preferred.top + overlayRect.height <= viewport.height;

  if (fitsPreferred) {
    return preferred;
  }

  // Si no cabe, probar posiciones alternativas
  const alternatives = ['top', 'bottom', 'left', 'right'].filter(
    pos => pos !== preferredPosition
  );
  for (const alt of alternatives) {
    const altPos = positions[alt as keyof typeof positions];
    const fits =
      altPos.left >= 0 &&
      altPos.left + overlayRect.width <= viewport.width &&
      altPos.top >= 0 &&
      altPos.top + overlayRect.height <= viewport.height;
    if (fits) {
      return altPos;
    }
  }

  // Si ninguna posición perfecta, devolver la preferida ajustada
  return {
    top: Math.max(
      8,
      Math.min(preferred.top, viewport.height - overlayRect.height - 8)
    ),
    left: Math.max(
      8,
      Math.min(preferred.left, viewport.width - overlayRect.width - 8)
    ),
  };
};

// Hook personalizado para manejar estado de overlays
export const useOverlayState = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev: boolean) => !prev);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
