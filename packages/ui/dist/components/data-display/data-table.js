"use client";
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = DataTable;
exports.StatCard = StatCard;
exports.EmptyState = EmptyState;
var input_1 = require("@/components/ui/input");
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var button_1 = require("../ui/button");
// Iconos personalizados
var SearchIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>);
};
var FilterIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
  </svg>);
};
var SortIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
  </svg>);
};
function DataTable(_a) {
    var data = _a.data, columns = _a.columns, _b = _a.searchable, searchable = _b === void 0 ? false : _b, _c = _a.searchPlaceholder, searchPlaceholder = _c === void 0 ? "Buscar..." : _c, onRowClick = _a.onRowClick, _d = _a.className, className = _d === void 0 ? "" : _d;
    var _e = (0, react_1.useState)(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = (0, react_1.useState)(null), sortColumn = _f[0], setSortColumn = _f[1];
    var _g = (0, react_1.useState)("asc"), sortDirection = _g[0], setSortDirection = _g[1];
    var filteredData = data.filter(function (item) {
        return Object.values(item).some(function (value) {
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
    });
    var sortedData = __spreadArray([], filteredData, true).sort(function (a, b) {
        if (!sortColumn)
            return 0;
        var aValue = a[sortColumn];
        var bValue = b[sortColumn];
        if (aValue < bValue)
            return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue)
            return sortDirection === "asc" ? 1 : -1;
        return 0;
    });
    var handleSort = function (column) {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        }
        else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };
    return (<div className={"space-y-4 ".concat(className)}>
      {searchable && (<div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <input_1.Input placeholder={searchPlaceholder} value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
        </div>)}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              {columns.map(function (column) { return (<th key={String(column.key)} className="text-left p-4 font-medium text-muted-foreground">
                  {column.sortable ? (<button onClick={function () { return handleSort(column.key); }} className="flex items-center gap-2 hover:text-foreground transition-colors">
                      {column.label}
                      <SortIcon className="w-4 h-4"/>
                    </button>) : (column.label)}
                </th>); })}
            </tr>
          </thead>
          <tbody>
            <framer_motion_1.AnimatePresence>
              {sortedData.map(function (item, index) { return (<framer_motion_1.motion.tr key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.05 }} onClick={function () { return onRowClick === null || onRowClick === void 0 ? void 0 : onRowClick(item); }} className={"border-b hover:bg-muted/50 transition-colors ".concat(onRowClick ? "cursor-pointer" : "")}>
                  {columns.map(function (column) { return (<td key={String(column.key)} className="p-4">
                      {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key] || "")}
                    </td>); })}
                </framer_motion_1.motion.tr>); })}
            </framer_motion_1.AnimatePresence>
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (<div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "No se encontraron resultados" : "No hay datos disponibles"}
        </div>)}
    </div>);
}
function StatCard(_a) {
    var title = _a.title, value = _a.value, description = _a.description, Icon = _a.icon, trend = _a.trend, _b = _a.className, className = _b === void 0 ? "" : _b;
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={"p-6 bg-card rounded-lg border shadow-sm ".concat(className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (<p className="text-sm text-muted-foreground mt-1">{description}</p>)}
          {trend && (<p className={"text-sm mt-2 ".concat(trend.positive ? "text-green-600" : "text-red-600")}>
              {trend.positive ? "+" : ""}{trend.value}% {trend.label}
            </p>)}
        </div>
        {Icon && (<div className="p-3 bg-primary/10 rounded-full">
            <Icon className="w-6 h-6 text-primary"/>
          </div>)}
      </div>
    </framer_motion_1.motion.div>);
}
function EmptyState(_a) {
    var Icon = _a.icon, title = _a.title, description = _a.description, action = _a.action, _b = _a.className, className = _b === void 0 ? "" : _b;
    return (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={"text-center py-12 ".concat(className)}>
      {Icon && (<div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground"/>
        </div>)}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (<p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>)}
      {action && (<button_1.Button onClick={action.onClick}>
          {action.label}
        </button_1.Button>)}
    </framer_motion_1.motion.div>);
}
