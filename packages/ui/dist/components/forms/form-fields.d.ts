interface FormFieldProps {
    name: string;
    label: string;
    type?: "text" | "email" | "password" | "number" | "tel" | "url";
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
}
export declare function FormField({ name, label, type, placeholder, required, disabled, error, value, onChange, className, }: FormFieldProps): import("react").JSX.Element;
interface TextAreaFieldProps {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    rows?: number;
    className?: string;
}
export declare function TextAreaField({ name, label, placeholder, required, disabled, error, value, onChange, rows, className, }: TextAreaFieldProps): import("react").JSX.Element;
interface SelectFieldProps {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    options: Array<{
        value: string;
        label: string;
    }>;
    className?: string;
}
export declare function SelectField({ name, label, placeholder, required, disabled, error, value, onChange, options, className, }: SelectFieldProps): import("react").JSX.Element;
interface CheckboxFieldProps {
    name: string;
    label: string;
    description?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}
export declare function CheckboxField({ name, label, description, checked, onChange, disabled, className, }: CheckboxFieldProps): import("react").JSX.Element;
interface RadioFieldProps {
    name: string;
    label: string;
    value?: string;
    onChange?: (value: string) => void;
    options: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
    disabled?: boolean;
    className?: string;
}
export declare function RadioField({ name, label, value, onChange, options, disabled, className, }: RadioFieldProps): import("react").JSX.Element;
export {};
