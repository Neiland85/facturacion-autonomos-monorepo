"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskTrafficLight = RiskTrafficLight;
const utils_1 = require("@/lib/utils");
const levelConfig = {
    low: { color: "bg-green-500", text: "Bajo", labelColor: "text-green-700 dark:text-green-400" },
    medium: { color: "bg-yellow-500", text: "Medio", labelColor: "text-yellow-700 dark:text-yellow-400" },
    high: { color: "bg-red-500", text: "Alto", labelColor: "text-red-700 dark:text-red-400" },
    unknown: { color: "bg-gray-400", text: "Desconocido", labelColor: "text-gray-700 dark:text-gray-400" },
};
function RiskTrafficLight({ level, size = "md", showLabel = false, className }) {
    const currentRisk = level && level.toLowerCase() in levelConfig
        ? levelConfig[level.toLowerCase()]
        : levelConfig.unknown;
    const lightSizeClasses = {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4",
    };
    const containerSizeClasses = {
        sm: "gap-1",
        md: "gap-1.5",
        lg: "gap-2",
    };
    const labelSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };
    return (<div className={(0, utils_1.cn)("flex items-center", containerSizeClasses[size], className)}>
      <div className="flex space-x-1 p-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
        <span className={(0, utils_1.cn)("rounded-full transition-opacity", lightSizeClasses[size], currentRisk.text === "Alto" ? levelConfig.high.color : "bg-gray-300 dark:bg-gray-500 opacity-30")} title="Riesgo Alto"/>
        <span className={(0, utils_1.cn)("rounded-full transition-opacity", lightSizeClasses[size], currentRisk.text === "Medio" ? levelConfig.medium.color : "bg-gray-300 dark:bg-gray-500 opacity-30")} title="Riesgo Medio"/>
        <span className={(0, utils_1.cn)("rounded-full transition-opacity", lightSizeClasses[size], currentRisk.text === "Bajo" ? levelConfig.low.color : "bg-gray-300 dark:bg-gray-500 opacity-30")} title="Riesgo Bajo"/>
      </div>
      {showLabel && (<span className={(0, utils_1.cn)("ml-2 font-medium", labelSizeClasses[size], currentRisk.labelColor)}>
          Riesgo: {currentRisk.text}
        </span>)}
    </div>);
}
