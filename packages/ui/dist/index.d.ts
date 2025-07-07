import React from 'react';
export interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}
export interface InputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel';
    className?: string;
}
export interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}
export declare const Button: React.FC<ButtonProps>;
export declare const Input: React.FC<InputProps>;
export declare const Card: React.FC<CardProps>;
export declare const Modal: React.FC<ModalProps>;
export declare const LoadingSpinner: React.FC<{
    size?: 'sm' | 'md' | 'lg';
}>;
export interface AlertProps {
    type: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
    onClose?: () => void;
}
export declare const Alert: React.FC<AlertProps>;
declare const _default: {
    Button: React.FC<ButtonProps>;
    Input: React.FC<InputProps>;
    Card: React.FC<CardProps>;
    Modal: React.FC<ModalProps>;
    LoadingSpinner: React.FC<{
        size?: "sm" | "md" | "lg";
    }>;
    Alert: React.FC<AlertProps>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map