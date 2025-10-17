interface TooltipProps {
    content: string | React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
}
export declare function Tooltip({ content, children, position, delay, className, }: TooltipProps): import("react").JSX.Element;
interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    position?: 'left' | 'right' | 'top' | 'bottom';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    title?: string;
    showCloseButton?: boolean;
    className?: string;
}
export declare function Drawer({ isOpen, onClose, children, position, size, title, showCloseButton, className, }: DrawerProps): import("react").JSX.Element;
interface PopoverProps {
    isOpen: boolean;
    onClose: () => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}
export declare function Popover({ isOpen, onClose, trigger, children, position, className, }: PopoverProps): import("react").JSX.Element;
interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}
export declare function Dropdown({ trigger, children, isOpen, onToggle, position, className, }: DropdownProps): import("react").JSX.Element;
export {};
