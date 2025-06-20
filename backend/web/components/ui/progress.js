"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
const React = require("react");
const ProgressPrimitive = require("@radix-ui/react-progress");
const utils_1 = require("@/lib/utils");
const Progress = React.forwardRef(({ className, value, ...props }, ref) => (<ProgressPrimitive.Root ref={ref} className={(0, utils_1.cn)("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
    <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }}/>
  </ProgressPrimitive.Root>));
exports.Progress = Progress;
Progress.displayName = ProgressPrimitive.Root.displayName;
