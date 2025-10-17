"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = Modal;
exports.ConfirmDialog = ConfirmDialog;
exports.Alert = Alert;
exports.LoadingOverlay = LoadingOverlay;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
// Iconos personalizados
var XIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>);
};
var CheckIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
  </svg>);
};
var AlertTriangleIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
  </svg>);
};
var InfoIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>);
};
function Modal(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, title = _a.title, children = _a.children, _b = _a.size, size = _b === void 0 ? 'md' : _b, _c = _a.showCloseButton, showCloseButton = _c === void 0 ? true : _c, _d = _a.className, className = _d === void 0 ? "" : _d;
    (0, react_1.useEffect)(function () {
        var handleEscape = function (e) {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return function () {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);
    var sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };
    return (<framer_motion_1.AnimatePresence>
      {isOpen && (<>
          {/* Backdrop */}
          <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}/>

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className={"w-full ".concat(sizeClasses[size], " ").concat(className)} onClick={function (e) { return e.stopPropagation(); }}>
              <card_1.Card className="shadow-xl">
                {(title || showCloseButton) && (<card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    {title && <card_1.CardTitle className="text-lg">{title}</card_1.CardTitle>}
                    {showCloseButton && (<button_1.Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <XIcon className="h-4 w-4"/>
                      </button_1.Button>)}
                  </card_1.CardHeader>)}
                <card_1.CardContent>
                  {children}
                </card_1.CardContent>
              </card_1.Card>
            </framer_motion_1.motion.div>
          </div>
        </>)}
    </framer_motion_1.AnimatePresence>);
}
function ConfirmDialog(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onConfirm = _a.onConfirm, title = _a.title, message = _a.message, _b = _a.confirmText, confirmText = _b === void 0 ? 'Confirmar' : _b, _c = _a.cancelText, cancelText = _c === void 0 ? 'Cancelar' : _c, _d = _a.type, type = _d === void 0 ? 'default' : _d, _e = _a.isLoading, isLoading = _e === void 0 ? false : _e;
    var handleConfirm = function () {
        onConfirm();
        if (!isLoading) {
            onClose();
        }
    };
    var getIcon = function () {
        switch (type) {
            case 'danger':
                return <XIcon className="h-6 w-6 text-red-600"/>;
            case 'warning':
                return <AlertTriangleIcon className="h-6 w-6 text-yellow-600"/>;
            case 'info':
                return <InfoIcon className="h-6 w-6 text-blue-600"/>;
            default:
                return <CheckIcon className="h-6 w-6 text-green-600"/>;
        }
    };
    var getConfirmButtonVariant = function () {
        switch (type) {
            case 'danger':
                return 'destructive';
            case 'warning':
                return 'default';
            case 'info':
                return 'default';
            default:
                return 'default';
        }
    };
    return (<Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          {getIcon()}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>
        <div className="flex space-x-3 justify-center">
          <button_1.Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </button_1.Button>
          <button_1.Button variant={getConfirmButtonVariant()} onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Procesando...' : confirmText}
          </button_1.Button>
        </div>
      </div>
    </Modal>);
}
function Alert(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, title = _a.title, message = _a.message, _b = _a.type, type = _b === void 0 ? 'info' : _b, _c = _a.autoClose, autoClose = _c === void 0 ? false : _c, _d = _a.autoCloseDelay, autoCloseDelay = _d === void 0 ? 5000 : _d;
    var _e = (0, react_1.useState)(100), progress = _e[0], setProgress = _e[1];
    (0, react_1.useEffect)(function () {
        if (autoClose && isOpen) {
            var interval_1 = setInterval(function () {
                setProgress(function (prev) {
                    if (prev <= 0) {
                        onClose();
                        return 0;
                    }
                    return prev - (100 / (autoCloseDelay / 100));
                });
            }, 100);
            return function () { return clearInterval(interval_1); };
        }
    }, [autoClose, autoCloseDelay, isOpen, onClose]);
    var getStyles = function () {
        switch (type) {
            case 'success':
                return {
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    iconColor: 'text-green-600',
                    icon: <CheckIcon className="h-5 w-5"/>,
                };
            case 'error':
                return {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    iconColor: 'text-red-600',
                    icon: <XIcon className="h-5 w-5"/>,
                };
            case 'warning':
                return {
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    iconColor: 'text-yellow-600',
                    icon: <AlertTriangleIcon className="h-5 w-5"/>,
                };
            case 'info':
            default:
                return {
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    iconColor: 'text-blue-600',
                    icon: <InfoIcon className="h-5 w-5"/>,
                };
        }
    };
    var styles = getStyles();
    return (<framer_motion_1.AnimatePresence>
      {isOpen && (<framer_motion_1.motion.div initial={{ opacity: 0, y: -50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.95 }} className={"fixed top-4 right-4 z-50 max-w-sm ".concat(styles.bgColor, " border ").concat(styles.borderColor, " rounded-lg shadow-lg")}>
          <div className="p-4">
            <div className="flex items-start">
              <div className={"flex-shrink-0 ".concat(styles.iconColor)}>
                {styles.icon}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {title}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button onClick={onClose} className="inline-flex text-gray-400 hover:text-gray-600">
                  <XIcon className="h-5 w-5"/>
                </button>
              </div>
            </div>
            {autoClose && (<div className="mt-3">
                <div className="bg-gray-200 rounded-full h-1">
                  <framer_motion_1.motion.div className="bg-blue-600 h-1 rounded-full" initial={{ width: '100%' }} animate={{ width: "".concat(progress, "%") }} transition={{ duration: 0.1 }}/>
                </div>
              </div>)}
          </div>
        </framer_motion_1.motion.div>)}
    </framer_motion_1.AnimatePresence>);
}
function LoadingOverlay(_a) {
    var isVisible = _a.isVisible, _b = _a.message, message = _b === void 0 ? 'Cargando...' : _b, _c = _a.fullScreen, fullScreen = _c === void 0 ? false : _c;
    if (!isVisible)
        return null;
    var containerClasses = fullScreen
        ? 'fixed inset-0 z-50'
        : 'absolute inset-0 z-10';
    return (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={"".concat(containerClasses, " bg-white bg-opacity-80 flex items-center justify-center")}>
      <div className="text-center">
        <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"/>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </framer_motion_1.motion.div>);
}
