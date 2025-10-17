
import React from 'react';
import { motion } from "framer-motion";

export default function TributariAppLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-cyan-500 dark:text-cyan-400"
        />
        <path
          d="M15 15 H 25 M20 15 V 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-slate-800 dark:text-white"
        />
      </motion.svg>
      <span className="text-xl font-semibold text-slate-800 dark:text-white">
        Tributari<span className="text-orange-500 dark:text-orange-400">App</span>
      </span>
    </div>
  )
}