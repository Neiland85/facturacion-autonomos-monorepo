"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigation = Navigation;
exports.MobileNavigation = MobileNavigation;
exports.Breadcrumbs = Breadcrumbs;
exports.Tabs = Tabs;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var button_1 = require("../ui/button");
var sheet_1 = require("../ui/sheet");
// Iconos personalizados
var MenuIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
  </svg>);
};
var XIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>);
};
function Navigation(_a) {
    var items = _a.items, activePath = _a.activePath, onNavigate = _a.onNavigate, _b = _a.className, className = _b === void 0 ? "" : _b;
    var handleClick = function (item) {
        if (item.onClick) {
            item.onClick();
        }
        else if (onNavigate) {
            onNavigate(item.href);
        }
    };
    return (<nav className={"flex items-center space-x-6 ".concat(className)}>
      {items.map(function (item) {
            var isActive = activePath === item.href;
            var Icon = item.icon;
            return (<button key={item.href} onClick={function () { return handleClick(item); }} className={"relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ".concat(isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
            {Icon && <Icon className="w-4 h-4"/>}
            {item.label}
            {item.badge && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>)}
          </button>);
        })}
    </nav>);
}
function MobileNavigation(_a) {
    var items = _a.items, activePath = _a.activePath, onNavigate = _a.onNavigate, trigger = _a.trigger;
    var _b = (0, react_1.useState)(false), isOpen = _b[0], setIsOpen = _b[1];
    var handleClick = function (item) {
        if (item.onClick) {
            item.onClick();
        }
        else if (onNavigate) {
            onNavigate(item.href);
        }
        setIsOpen(false);
    };
    return (<sheet_1.Sheet open={isOpen} onOpenChange={setIsOpen}>
      <sheet_1.SheetTrigger asChild>
        {trigger || (<button_1.Button variant="ghost" size="icon">
            <MenuIcon className="w-6 h-6"/>
            <span className="sr-only">Abrir menú</span>
          </button_1.Button>)}
      </sheet_1.SheetTrigger>
      <sheet_1.SheetContent side="right" className="w-[280px] p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menú</h2>
            <button_1.Button variant="ghost" size="icon" onClick={function () { return setIsOpen(false); }}>
              <XIcon className="w-5 h-5"/>
            </button_1.Button>
          </div>
        </div>
        <nav className="flex flex-col space-y-1 p-4">
          {items.map(function (item, index) {
            var isActive = activePath === item.href;
            var Icon = item.icon;
            return (<framer_motion_1.motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                <button onClick={function () { return handleClick(item); }} className={"w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors text-left ".concat(isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground")}>
                  {Icon && <Icon className="w-5 h-5"/>}
                  {item.label}
                  {item.badge && (<span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>)}
                </button>
              </framer_motion_1.motion.div>);
        })}
        </nav>
      </sheet_1.SheetContent>
    </sheet_1.Sheet>);
}
function Breadcrumbs(_a) {
    var items = _a.items, separator = _a.separator, _b = _a.className, className = _b === void 0 ? "" : _b;
    var defaultSeparator = (<svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
    </svg>);
    return (<nav className={"flex items-center space-x-2 text-sm ".concat(className)}>
      {items.map(function (item, index) { return (<div key={index} className="flex items-center">
          {index > 0 && (<span className="mx-2 text-muted-foreground">
              {separator || defaultSeparator}
            </span>)}
          {item.onClick ? (<button onClick={item.onClick} className="text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </button>) : (<span className="text-foreground font-medium">{item.label}</span>)}
        </div>); })}
    </nav>);
}
function Tabs(_a) {
    var items = _a.items, activeTab = _a.activeTab, onTabChange = _a.onTabChange, _b = _a.className, className = _b === void 0 ? "" : _b;
    return (<div className={"border-b ".concat(className)}>
      <div className="flex space-x-8">
        {items.map(function (item) {
            var isActive = activeTab === item.id;
            var Icon = item.icon;
            return (<button key={item.id} onClick={function () { return onTabChange(item.id); }} className={"relative flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ".concat(isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border")}>
              {Icon && <Icon className="w-4 h-4"/>}
              {item.label}
              {item.badge && (<span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>)}
              {isActive && (<framer_motion_1.motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" initial={false} transition={{ type: "spring", stiffness: 500, damping: 30 }}/>)}
            </button>);
        })}
      </div>
    </div>);
}
