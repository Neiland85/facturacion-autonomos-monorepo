"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawerDescription = exports.DrawerTitle = exports.DrawerFooter = exports.DrawerHeader = exports.DrawerContent = exports.DrawerClose = exports.DrawerTrigger = exports.DrawerOverlay = exports.DrawerPortal = exports.Drawer = void 0;
const React = require("react");
const vaul_1 = require("vaul");
const utils_1 = require("@/lib/utils");
const Drawer = ({ shouldScaleBackground = true, ...props }) => (<vaul_1.Drawer.Root shouldScaleBackground={shouldScaleBackground} {...props}/>);
exports.Drawer = Drawer;
Drawer.displayName = "Drawer";
const DrawerTrigger = vaul_1.Drawer.Trigger;
exports.DrawerTrigger = DrawerTrigger;
const DrawerPortal = vaul_1.Drawer.Portal;
exports.DrawerPortal = DrawerPortal;
const DrawerClose = vaul_1.Drawer.Close;
exports.DrawerClose = DrawerClose;
const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => (<vaul_1.Drawer.Overlay ref={ref} className={(0, utils_1.cn)("fixed inset-0 z-50 bg-black/80", className)} {...props}/>));
exports.DrawerOverlay = DrawerOverlay;
DrawerOverlay.displayName = vaul_1.Drawer.Overlay.displayName;
const DrawerContent = React.forwardRef(({ className, children, ...props }, ref) => (<DrawerPortal>
    <DrawerOverlay />
    <vaul_1.Drawer.Content ref={ref} className={(0, utils_1.cn)("fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background", className)} {...props}>
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted"/>
      {children}
    </vaul_1.Drawer.Content>
  </DrawerPortal>));
exports.DrawerContent = DrawerContent;
DrawerContent.displayName = "DrawerContent";
const DrawerHeader = ({ className, ...props }) => (<div className={(0, utils_1.cn)("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props}/>);
exports.DrawerHeader = DrawerHeader;
DrawerHeader.displayName = "DrawerHeader";
const DrawerFooter = ({ className, ...props }) => (<div className={(0, utils_1.cn)("mt-auto flex flex-col gap-2 p-4", className)} {...props}/>);
exports.DrawerFooter = DrawerFooter;
DrawerFooter.displayName = "DrawerFooter";
const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (<vaul_1.Drawer.Title ref={ref} className={(0, utils_1.cn)("text-lg font-semibold leading-none tracking-tight", className)} {...props}/>));
exports.DrawerTitle = DrawerTitle;
DrawerTitle.displayName = vaul_1.Drawer.Title.displayName;
const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (<vaul_1.Drawer.Description ref={ref} className={(0, utils_1.cn)("text-sm text-muted-foreground", className)} {...props}/>));
exports.DrawerDescription = DrawerDescription;
DrawerDescription.displayName = vaul_1.Drawer.Description.displayName;
