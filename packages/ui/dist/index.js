"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = exports.LoadingSpinner = exports.Modal = exports.Card = exports.Input = exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button = ({ children, variant = 'primary', size = 'md', disabled = false, loading = false, onClick, type = 'button', className = '' }) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };
    const disabledClasses = 'opacity-50 cursor-not-allowed';
    const classes = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled || loading ? disabledClasses : '',
        className
    ].join(' ');
    return ((0, jsx_runtime_1.jsxs)("button", { type: type, className: classes, onClick: onClick, disabled: disabled || loading, children: [loading && ((0, jsx_runtime_1.jsxs)("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), children] }));
};
exports.Button = Button;
const Input = ({ label, placeholder, value, onChange, error, disabled = false, required = false, type = 'text', className = '' }) => {
    const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';
    const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';
    const disabledClasses = 'bg-gray-50 text-gray-500 cursor-not-allowed';
    const inputClasses = [
        baseClasses,
        error ? errorClasses : '',
        disabled ? disabledClasses : '',
        className
    ].join(' ');
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [label && ((0, jsx_runtime_1.jsxs)("label", { className: "block text-sm font-medium text-gray-700", children: [label, required && (0, jsx_runtime_1.jsx)("span", { className: "text-red-500 ml-1", children: "*" })] })), (0, jsx_runtime_1.jsx)("input", { type: type, className: inputClasses, placeholder: placeholder, value: value, onChange: (e) => onChange?.(e.target.value), disabled: disabled, required: required }), error && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-600", children: error }))] }));
};
exports.Input = Input;
const Card = ({ children, title, className = '' }) => {
    const baseClasses = 'bg-white rounded-lg shadow-md border border-gray-200';
    const classes = [baseClasses, className].join(' ');
    return ((0, jsx_runtime_1.jsxs)("div", { className: classes, children: [title && ((0, jsx_runtime_1.jsx)("div", { className: "px-6 py-4 border-b border-gray-200", children: (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: title }) })), (0, jsx_runtime_1.jsx)("div", { className: "px-6 py-4", children: children })] }));
};
exports.Card = Card;
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75", onClick: onClose }), (0, jsx_runtime_1.jsxs)("div", { className: `inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}`, children: [title && ((0, jsx_runtime_1.jsx)("div", { className: "px-6 py-4 border-b border-gray-200", children: (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: title }) })), (0, jsx_runtime_1.jsx)("div", { className: "px-6 py-4", children: children })] })] }) }));
};
exports.Modal = Modal;
const LoadingSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center", children: (0, jsx_runtime_1.jsxs)("svg", { className: `animate-spin ${sizeClasses[size]} text-blue-600`, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }) }));
};
exports.LoadingSpinner = LoadingSpinner;
const Alert = ({ type, title, message, onClose }) => {
    const typeClasses = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800'
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: `rounded-md border p-4 ${typeClasses[type]}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [title && ((0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium mb-1", children: title })), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: message })] }), onClose && ((0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "ml-4 text-sm font-medium underline hover:no-underline", children: "Cerrar" }))] }) }));
};
exports.Alert = Alert;
exports.default = {
    Button: exports.Button,
    Input: exports.Input,
    Card: exports.Card,
    Modal: exports.Modal,
    LoadingSpinner: exports.LoadingSpinner,
    Alert: exports.Alert
};
//# sourceMappingURL=index.js.map