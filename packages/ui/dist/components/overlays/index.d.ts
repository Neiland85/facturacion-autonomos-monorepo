export { Alert, ConfirmDialog, LoadingOverlay, Modal } from './modal';
export { ToastNotification, toastSystem } from './toast';
export { Drawer, Dropdown, Popover, Tooltip } from './tooltip-drawer';
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
export declare const OVERLAY_DEFAULTS: {
    readonly modal: {
        readonly size: "md";
        readonly showCloseButton: true;
        readonly backdropOpacity: 0.5;
    };
    readonly drawer: {
        readonly position: "right";
        readonly size: "md";
        readonly showCloseButton: true;
    };
    readonly tooltip: {
        readonly position: "top";
        readonly delay: 300;
    };
    readonly alert: {
        readonly autoClose: false;
        readonly autoCloseDelay: 5000;
        readonly position: "top-right";
    };
};
export declare const getViewportDimensions: () => {
    width: number;
    height: number;
};
export declare const isElementInViewport: (element: HTMLElement) => boolean;
export declare const calculateOptimalPosition: (triggerRect: DOMRect, overlayRect: DOMRect, preferredPosition: "top" | "bottom" | "left" | "right") => OverlayPosition;
export declare const useOverlayState: (initialState?: boolean) => {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};
