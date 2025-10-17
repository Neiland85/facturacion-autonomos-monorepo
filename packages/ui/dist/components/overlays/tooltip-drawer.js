"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tooltip = Tooltip;
exports.Drawer = Drawer;
exports.Popover = Popover;
exports.Dropdown = Dropdown;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var button_1 = require("../ui/button");
// Iconos personalizados
var ChevronLeftIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
  </svg>);
};
var ChevronRightIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
  </svg>);
};
function Tooltip(_a) {
    var content = _a.content, children = _a.children, _b = _a.position, position = _b === void 0 ? 'top' : _b, _c = _a.delay, delay = _c === void 0 ? 300 : _c, _d = _a.className, className = _d === void 0 ? "" : _d;
    var _e = (0, react_1.useState)(false), isVisible = _e[0], setIsVisible = _e[1];
    var _f = (0, react_1.useState)(null), timeoutId = _f[0], setTimeoutId = _f[1];
    var triggerRef = (0, react_1.useRef)(null);
    var tooltipRef = (0, react_1.useRef)(null);
    var showTooltip = function () {
        if (timeoutId)
            clearTimeout(timeoutId);
        var id = setTimeout(function () { return setIsVisible(true); }, delay);
        setTimeoutId(id);
    };
    var hideTooltip = function () {
        if (timeoutId)
            clearTimeout(timeoutId);
        setIsVisible(false);
    };
    var getPositionStyles = function () {
        if (!triggerRef.current || !tooltipRef.current)
            return {};
        var triggerRect = triggerRef.current.getBoundingClientRect();
        var tooltipRect = tooltipRef.current.getBoundingClientRect();
        switch (position) {
            case 'top':
                return {
                    top: triggerRect.top - tooltipRect.height - 8,
                    left: triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2),
                };
            case 'bottom':
                return {
                    top: triggerRect.bottom + 8,
                    left: triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2),
                };
            case 'left':
                return {
                    top: triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2),
                    left: triggerRect.left - tooltipRect.width - 8,
                };
            case 'right':
                return {
                    top: triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2),
                    left: triggerRect.right + 8,
                };
            default:
                return {};
        }
    };
    return (<>
      <div ref={triggerRef} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip} className="inline-block">
        {children}
      </div>

      <framer_motion_1.AnimatePresence>
        {isVisible && (<framer_motion_1.motion.div ref={tooltipRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className={"fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg max-w-xs ".concat(className)} style={getPositionStyles()}>
            {content}
            {/* Arrow */}
            <div className={"absolute w-2 h-2 bg-gray-900 transform rotate-45 ".concat(position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                    position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                        'left-[-4px] top-1/2 -translate-y-1/2')}/>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </>);
}
function Drawer(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, children = _a.children, _b = _a.position, position = _b === void 0 ? 'right' : _b, _c = _a.size, size = _c === void 0 ? 'md' : _c, title = _a.title, _d = _a.showCloseButton, showCloseButton = _d === void 0 ? true : _d, _e = _a.className, className = _e === void 0 ? "" : _e;
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
    var getSizeClasses = function () {
        var sizeMap = {
            sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
            md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
            lg: position === 'left' || position === 'right' ? 'w-[32rem]' : 'h-[32rem]',
            xl: position === 'left' || position === 'right' ? 'w-[40rem]' : 'h-[40rem]',
            full: position === 'left' || position === 'right' ? 'w-full' : 'h-full',
        };
        return sizeMap[size];
    };
    var getPositionClasses = function () {
        var baseClasses = 'fixed z-50 bg-white shadow-xl';
        switch (position) {
            case 'left':
                return "".concat(baseClasses, " left-0 top-0 h-full ").concat(getSizeClasses());
            case 'right':
                return "".concat(baseClasses, " right-0 top-0 h-full ").concat(getSizeClasses());
            case 'top':
                return "".concat(baseClasses, " top-0 left-0 w-full ").concat(getSizeClasses());
            case 'bottom':
                return "".concat(baseClasses, " bottom-0 left-0 w-full ").concat(getSizeClasses());
            default:
                return baseClasses;
        }
    };
    var getInitialAnimation = function () {
        switch (position) {
            case 'left':
                return { x: '-100%' };
            case 'right':
                return { x: '100%' };
            case 'top':
                return { y: '-100%' };
            case 'bottom':
                return { y: '100%' };
            default:
                return {};
        }
    };
    var getAnimateAnimation = function () {
        switch (position) {
            case 'left':
            case 'right':
                return { x: 0 };
            case 'top':
            case 'bottom':
                return { y: 0 };
            default:
                return {};
        }
    };
    var getExitAnimation = function () {
        return getInitialAnimation();
    };
    return (<>
      {/* Backdrop */}
      <framer_motion_1.AnimatePresence>
        {isOpen && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}/>)}
      </framer_motion_1.AnimatePresence>

      {/* Drawer */}
      <framer_motion_1.AnimatePresence>
        {isOpen && (<framer_motion_1.motion.div initial={getInitialAnimation()} animate={getAnimateAnimation()} exit={getExitAnimation()} transition={{ type: "tween", duration: 0.3 }} className={getPositionClasses() + ' ' + className}>
            {/* Header */}
            {(title || showCloseButton) && (<div className="flex items-center justify-between p-4 border-b">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {showCloseButton && (<button_1.Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                    <ChevronRightIcon className="h-4 w-4"/>
                  </button_1.Button>)}
              </div>)}

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {children}
            </div>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </>);
}
function Popover(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, trigger = _a.trigger, children = _a.children, _b = _a.position, position = _b === void 0 ? 'bottom' : _b, _c = _a.className, className = _c === void 0 ? "" : _c;
    var _d = (0, react_1.useState)(null), triggerRect = _d[0], setTriggerRect = _d[1];
    var triggerRef = (0, react_1.useRef)(null);
    var popoverRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (triggerRef.current) {
            setTriggerRect(triggerRef.current.getBoundingClientRect());
        }
    }, [isOpen]);
    var getPositionStyles = function () {
        var _a;
        if (!triggerRect)
            return {};
        var popoverRect = (_a = popoverRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (!popoverRect)
            return {};
        switch (position) {
            case 'top':
                return {
                    top: triggerRect.top - popoverRect.height - 8,
                    left: triggerRect.left + (triggerRect.width / 2) - (popoverRect.width / 2),
                };
            case 'bottom':
                return {
                    top: triggerRect.bottom + 8,
                    left: triggerRect.left + (triggerRect.width / 2) - (popoverRect.width / 2),
                };
            case 'left':
                return {
                    top: triggerRect.top + (triggerRect.height / 2) - (popoverRect.height / 2),
                    left: triggerRect.left - popoverRect.width - 8,
                };
            case 'right':
                return {
                    top: triggerRect.top + (triggerRect.height / 2) - (popoverRect.height / 2),
                    left: triggerRect.right + 8,
                };
            default:
                return {};
        }
    };
    return (<>
      <div ref={triggerRef} onClick={function () { return onClose(); }} className="inline-block cursor-pointer">
        {trigger}
      </div>

      <framer_motion_1.AnimatePresence>
        {isOpen && (<>
            {/* Backdrop */}
            <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={onClose}/>

            {/* Popover */}
            <framer_motion_1.motion.div ref={popoverRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className={"fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg ".concat(className)} style={getPositionStyles()}>
              {children}
            </framer_motion_1.motion.div>
          </>)}
      </framer_motion_1.AnimatePresence>
    </>);
}
function Dropdown(_a) {
    var trigger = _a.trigger, children = _a.children, isOpen = _a.isOpen, onToggle = _a.onToggle, _b = _a.position, position = _b === void 0 ? 'bottom' : _b, _c = _a.className, className = _c === void 0 ? "" : _c;
    var _d = (0, react_1.useState)(null), triggerRect = _d[0], setTriggerRect = _d[1];
    var triggerRef = (0, react_1.useRef)(null);
    var dropdownRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (triggerRef.current) {
            setTriggerRect(triggerRef.current.getBoundingClientRect());
        }
    }, [isOpen]);
    var getPositionStyles = function () {
        if (!triggerRect)
            return {};
        switch (position) {
            case 'top':
                return {
                    bottom: window.innerHeight - triggerRect.top + 8,
                    left: triggerRect.left,
                };
            case 'bottom':
                return {
                    top: triggerRect.bottom + 8,
                    left: triggerRect.left,
                };
            case 'left':
                return {
                    top: triggerRect.top,
                    right: window.innerWidth - triggerRect.left + 8,
                };
            case 'right':
                return {
                    top: triggerRect.top,
                    left: triggerRect.right + 8,
                };
            default:
                return {};
        }
    };
    (0, react_1.useEffect)(function () {
        var handleClickOutside = function (event) {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)) {
                onToggle();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return function () {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onToggle]);
    return (<div className="relative">
      <div ref={triggerRef} onClick={onToggle} className="cursor-pointer">
        {trigger}
      </div>

      <framer_motion_1.AnimatePresence>
        {isOpen && (<framer_motion_1.motion.div ref={dropdownRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className={"absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] ".concat(className)} style={getPositionStyles()}>
            {children}
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </div>);
}
