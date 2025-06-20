"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioGroupItem = exports.RadioGroup = void 0;
const React = require("react");
const RadioGroupPrimitive = require("@radix-ui/react-radio-group");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
    return (<RadioGroupPrimitive.Root className={(0, utils_1.cn)("grid gap-2", className)} {...props} ref={ref}/>);
});
exports.RadioGroup = RadioGroup;
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
    return (<RadioGroupPrimitive.Item ref={ref} className={(0, utils_1.cn)("aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <lucide_react_1.Circle className="h-2.5 w-2.5 fill-current text-current"/>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>);
});
exports.RadioGroupItem = RadioGroupItem;
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
