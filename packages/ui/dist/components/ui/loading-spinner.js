"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader2 = void 0;
exports.LoadingSpinner = LoadingSpinner;
var utils_1 = require("@/lib/utils");
function LoadingSpinner(_a) {
    var _b = _a.size, size = _b === void 0 ? 'md' : _b, className = _a.className;
    var sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };
    return (<div className={(0, utils_1.cn)('animate-spin rounded-full border-2 border-gray-300 border-t-primary', sizeClasses[size], className)}/>);
}
// Alias for backward compatibility
exports.Loader2 = LoadingSpinner;
