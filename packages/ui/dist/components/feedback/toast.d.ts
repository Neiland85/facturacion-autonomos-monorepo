export type ToastType = "success" | "error" | "warning" | "info";
interface ToastProps {
    type: ToastType;
    title: string;
    description?: string;
    onClose?: () => void;
    duration?: number;
}
export declare function Toast({ type, title, description, onClose, duration }: ToastProps): import("react").JSX.Element;
interface ToastContainerProps {
    toasts: Array<ToastProps & {
        id: string;
    }>;
    onRemove: (id: string) => void;
}
export declare function ToastContainer({ toasts, onRemove }: ToastContainerProps): import("react").JSX.Element;
export {};
