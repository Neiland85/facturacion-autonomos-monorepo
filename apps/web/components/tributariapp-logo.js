"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TributariAppLogo;
const framer_motion_1 = require("framer-motion");
function TributariAppLogo({ className }) {
    return (<div className={`flex items-center gap-2 ${className}`}>
      <framer_motion_1.motion.svg width="32" // Adjusted size for mobile header
     height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}>
        {/* Outer circle - uses primary color from theme */}
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" className="text-primary"/>
        {/* Inner decorative element - example: a stylized 'T' or abstract shape */}
        <path d="M15 15 H 25 M20 15 V 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary-foreground" // Or a specific accent color if desired
    />
        {/* You can replace the path above with a more complex design if desired */}
      </framer_motion_1.motion.svg>
      <span className="text-xl font-semibold text-primary">
        Tributari<span className="text-primary-foreground">App</span>
      </span>
    </div>);
}
