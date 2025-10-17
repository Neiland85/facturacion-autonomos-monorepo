"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOverlayState = exports.calculateOptimalPosition = exports.isElementInViewport = exports.getViewportDimensions = exports.OVERLAY_DEFAULTS = exports.Tooltip = exports.Popover = exports.Dropdown = exports.Drawer = exports.toastSystem = exports.ToastNotification = exports.Modal = exports.LoadingOverlay = exports.ConfirmDialog = exports.Alert = void 0;
var react_1 = require("react");
// Componentes de overlays y elementos superpuestos para TributariApp
// Modales, tooltips, drawers y otros componentes de interfaz superpuesta
var modal_1 = require("./modal");
Object.defineProperty(exports, "Alert", { enumerable: true, get: function () { return modal_1.Alert; } });
Object.defineProperty(exports, "ConfirmDialog", { enumerable: true, get: function () { return modal_1.ConfirmDialog; } });
Object.defineProperty(exports, "LoadingOverlay", { enumerable: true, get: function () { return modal_1.LoadingOverlay; } });
Object.defineProperty(exports, "Modal", { enumerable: true, get: function () { return modal_1.Modal; } });
var toast_1 = require("./toast");
Object.defineProperty(exports, "ToastNotification", { enumerable: true, get: function () { return toast_1.ToastNotification; } });
Object.defineProperty(exports, "toastSystem", { enumerable: true, get: function () { return toast_1.toastSystem; } });
var tooltip_drawer_1 = require("./tooltip-drawer");
Object.defineProperty(exports, "Drawer", { enumerable: true, get: function () { return tooltip_drawer_1.Drawer; } });
Object.defineProperty(exports, "Dropdown", { enumerable: true, get: function () { return tooltip_drawer_1.Dropdown; } });
Object.defineProperty(exports, "Popover", { enumerable: true, get: function () { return tooltip_drawer_1.Popover; } });
Object.defineProperty(exports, "Tooltip", { enumerable: true, get: function () { return tooltip_drawer_1.Tooltip; } });
// Configuraciones predeterminadas para overlays
exports.OVERLAY_DEFAULTS = {
    modal: {
        size: 'md',
        showCloseButton: true,
        backdropOpacity: 0.5,
    },
    drawer: {
        position: 'right',
        size: 'md',
        showCloseButton: true,
    },
    tooltip: {
        position: 'top',
        delay: 300,
    },
    alert: {
        autoClose: false,
        autoCloseDelay: 5000,
        position: 'top-right',
    },
};
// Utilidades para overlays
var getViewportDimensions = function () {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
};
exports.getViewportDimensions = getViewportDimensions;
var isElementInViewport = function (element) {
    var rect = element.getBoundingClientRect();
    return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth));
};
exports.isElementInViewport = isElementInViewport;
var calculateOptimalPosition = function (triggerRect, overlayRect, preferredPosition) {
    var viewport = (0, exports.getViewportDimensions)();
    var positions = {
        top: {
            top: triggerRect.top - overlayRect.height - 8,
            left: triggerRect.left + triggerRect.width / 2 - overlayRect.width / 2,
        },
        bottom: {
            top: triggerRect.bottom + 8,
            left: triggerRect.left + triggerRect.width / 2 - overlayRect.width / 2,
        },
        left: {
            top: triggerRect.top + triggerRect.height / 2 - overlayRect.height / 2,
            left: triggerRect.left - overlayRect.width - 8,
        },
        right: {
            top: triggerRect.top + triggerRect.height / 2 - overlayRect.height / 2,
            left: triggerRect.right + 8,
        },
    };
    // Verificar si la posición preferida cabe en el viewport
    var preferred = positions[preferredPosition];
    var fitsPreferred = preferred.left >= 0 &&
        preferred.left + overlayRect.width <= viewport.width &&
        preferred.top >= 0 &&
        preferred.top + overlayRect.height <= viewport.height;
    if (fitsPreferred) {
        return preferred;
    }
    // Si no cabe, probar posiciones alternativas
    var alternatives = ['top', 'bottom', 'left', 'right'].filter(function (pos) { return pos !== preferredPosition; });
    for (var _i = 0, alternatives_1 = alternatives; _i < alternatives_1.length; _i++) {
        var alt = alternatives_1[_i];
        var altPos = positions[alt];
        var fits = altPos.left >= 0 &&
            altPos.left + overlayRect.width <= viewport.width &&
            altPos.top >= 0 &&
            altPos.top + overlayRect.height <= viewport.height;
        if (fits) {
            return altPos;
        }
    }
    // Si ninguna posición perfecta, devolver la preferida ajustada
    return {
        top: Math.max(8, Math.min(preferred.top, viewport.height - overlayRect.height - 8)),
        left: Math.max(8, Math.min(preferred.left, viewport.width - overlayRect.width - 8)),
    };
};
exports.calculateOptimalPosition = calculateOptimalPosition;
// Hook personalizado para manejar estado de overlays
var useOverlayState = function (initialState) {
    if (initialState === void 0) { initialState = false; }
    var _a = (0, react_1.useState)(initialState), isOpen = _a[0], setIsOpen = _a[1];
    var open = function () { return setIsOpen(true); };
    var close = function () { return setIsOpen(false); };
    var toggle = function () { return setIsOpen(function (prev) { return !prev; }); };
    (0, react_1.useEffect)(function () {
        var handleEscape = function (e) {
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return function () { return document.removeEventListener('keydown', handleEscape); };
    }, [isOpen]);
    return {
        isOpen: isOpen,
        open: open,
        close: close,
        toggle: toggle,
    };
};
exports.useOverlayState = useOverlayState;
