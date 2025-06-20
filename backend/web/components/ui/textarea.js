"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Textarea = void 0;
const React = require("react");
const utils_1 = require("@/lib/utils");
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
    return (<textarea className={(0, utils_1.cn)("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)} ref={ref} {...props}/>);
});
exports.Textarea = Textarea;
Textarea.displayName = "Textarea";
