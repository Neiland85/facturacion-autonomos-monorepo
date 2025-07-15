"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkbox = void 0;
const React = require("react");
const CheckboxPrimitive = require("@radix-ui/react-checkbox");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const Checkbox = React.forwardRef(({ className, ...props }, ref) => (<CheckboxPrimitive.Root ref={ref} className={(0, utils_1.cn)("peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)} {...props}>
    <CheckboxPrimitive.Indicator className={(0, utils_1.cn)("flex items-center justify-center text-current")}>
      <lucide_react_1.Check className="h-4 w-4"/>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>));
exports.Checkbox = Checkbox;
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
