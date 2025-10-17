interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
    className?: string;
}
export declare function Modal({ isOpen, onClose, title, children, size, showCloseButton, className, }: ModalProps): import("react").JSX.Element;
interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'default' | 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}
export declare function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type, isLoading, }: ConfirmDialogProps): import("react").JSX.Element;
interface AlertProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    autoClose?: boolean;
    autoCloseDelay?: number;
}
export declare function Alert({ isOpen, onClose, title, message, type, autoClose, autoCloseDelay, }: AlertProps): import("react").JSX.Element;
interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
    fullScreen?: boolean;
}
export declare function LoadingOverlay({ isVisible, message, fullScreen, }: LoadingOverlayProps): import("react").JSX.Element;
export {};
