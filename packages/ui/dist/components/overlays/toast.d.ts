interface ToastNotificationProps {
    id: string;
    title: string;
    message?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose: (id: string) => void;
}
export declare function ToastNotification({ id, title, message, type, duration, onClose, }: ToastNotificationProps): import("react").JSX.Element;
interface ToastNotificationItem extends Omit<ToastNotificationProps, 'onClose'> {
}
export declare const toastSystem: {
    show: (toast: Omit<ToastNotificationItem, "id">) => void;
    remove: (id: string) => void;
    subscribe: (listener: (toasts: ToastNotificationItem[]) => void) => () => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
};
export {};
