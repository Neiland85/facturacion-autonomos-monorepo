"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toastSystem = void 0;
exports.ToastNotification = ToastNotification;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
// Iconos personalizados
var XIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>);
};
function ToastNotification(_a) {
    var id = _a.id, title = _a.title, message = _a.message, _b = _a.type, type = _b === void 0 ? 'info' : _b, _c = _a.duration, duration = _c === void 0 ? 5000 : _c, onClose = _a.onClose;
    var _d = (0, react_1.useState)(100), progress = _d[0], setProgress = _d[1];
    (0, react_1.useEffect)(function () {
        var interval = setInterval(function () {
            setProgress(function (prev) {
                if (prev <= 0) {
                    onClose(id);
                    return 0;
                }
                return prev - (100 / (duration / 100));
            });
        }, 100);
        return function () { return clearInterval(interval); };
    }, [duration, id, onClose]);
    var getStyles = function () {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} className={"p-4 rounded-lg border shadow-lg max-w-sm ".concat(getStyles())}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{title}</h4>
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
        <button onClick={function () { return onClose(id); }} className="ml-4 text-gray-400 hover:text-gray-600">
          <XIcon className="w-4 h-4"/>
        </button>
      </div>
      <div className="mt-2 bg-gray-200 rounded-full h-1">
        <framer_motion_1.motion.div className="bg-current h-1 rounded-full" style={{ width: "".concat(progress, "%") }}/>
      </div>
    </framer_motion_1.motion.div>);
}
var toastId = 0;
var toasts = [];
var listeners = [];
exports.toastSystem = {
    show: function (toast) {
        var newToast = __assign(__assign({}, toast), { id: (++toastId).toString() });
        toasts.push(newToast);
        listeners.forEach(function (listener) { return listener(__spreadArray([], toasts, true)); });
        // Auto-remove after duration
        setTimeout(function () {
            exports.toastSystem.remove(newToast.id);
        }, toast.duration || 5000);
    },
    remove: function (id) {
        var index = toasts.findIndex(function (t) { return t.id === id; });
        if (index > -1) {
            toasts.splice(index, 1);
            listeners.forEach(function (listener) { return listener(__spreadArray([], toasts, true)); });
        }
    },
    subscribe: function (listener) {
        listeners.push(listener);
        return function () {
            var index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    },
    success: function (title, message) {
        exports.toastSystem.show({ title: title, message: message, type: 'success' });
    },
    error: function (title, message) {
        exports.toastSystem.show({ title: title, message: message, type: 'error' });
    },
    warning: function (title, message) {
        exports.toastSystem.show({ title: title, message: message, type: 'warning' });
    },
    info: function (title, message) {
        exports.toastSystem.show({ title: title, message: message, type: 'info' });
    },
};
