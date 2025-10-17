"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Info = Info;
var utils_1 = require("@/lib/utils");
function Info(_a) {
    var className = _a.className;
    return (<svg className={(0, utils_1.cn)('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>);
}
