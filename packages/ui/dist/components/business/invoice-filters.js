"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceFilters = InvoiceFilters;
exports.InvoiceSearch = InvoiceSearch;
exports.FilterChips = FilterChips;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var badge_1 = require("../ui/badge");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
var input_1 = require("../ui/input");
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
var XIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>);
};
var CalendarIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>);
};
function InvoiceFilters(_a) {
    var filters = _a.filters, onFiltersChange = _a.onFiltersChange, onReset = _a.onReset, _b = _a.className, className = _b === void 0 ? "" : _b;
    var _c = (0, react_1.useState)(false), isExpanded = _c[0], setIsExpanded = _c[1];
    var updateFilter = function (key, value) {
        var _a;
        onFiltersChange(__assign(__assign({}, filters), (_a = {}, _a[key] = value, _a)));
    };
    var statusOptions = [
        { value: 'all', label: 'Todas', color: 'bg-gray-100 text-gray-800' },
        { value: 'draft', label: 'Borrador', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'sent', label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
        { value: 'paid', label: 'Pagada', color: 'bg-green-100 text-green-800' },
        { value: 'overdue', label: 'Vencida', color: 'bg-red-100 text-red-800' },
        { value: 'cancelled', label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
    ];
    var paymentStatusOptions = [
        { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-800' },
        { value: 'pending', label: 'Pendiente', color: 'bg-orange-100 text-orange-800' },
        { value: 'paid', label: 'Pagado', color: 'bg-green-100 text-green-800' },
        { value: 'overdue', label: 'Vencido', color: 'bg-red-100 text-red-800' },
    ];
    var activeFiltersCount = Object.entries(filters).filter(function (_a) {
        var key = _a[0], value = _a[1];
        if (key === 'search')
            return value.length > 0;
        if (key === 'status' || key === 'paymentStatus')
            return value !== 'all';
        return value.length > 0;
    }).length;
    return (<card_1.Card className={className}>
      <card_1.CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <FilterIcon className="w-5 h-5"/>
            Filtros de Facturas
            {activeFiltersCount > 0 && (<badge_1.Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </badge_1.Badge>)}
          </card_1.CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (<button_1.Button variant="outline" size="sm" onClick={onReset} className="text-sm">
                <XIcon className="w-4 h-4 mr-1"/>
                Limpiar
              </button_1.Button>)}
            <button_1.Button variant="outline" size="sm" onClick={function () { return setIsExpanded(!isExpanded); }}>
              {isExpanded ? 'Menos filtros' : 'Más filtros'}
            </button_1.Button>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        {/* Búsqueda básica */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
          <input_1.Input placeholder="Buscar por número, cliente o descripción..." value={filters.search} onChange={function (e) { return updateFilter('search', e.target.value); }} className="pl-10"/>
        </div>

        {/* Filtros principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Estado de Factura
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(function (option) { return (<button key={option.value} onClick={function () { return updateFilter('status', option.value); }} className={"px-3 py-1 rounded-full text-xs font-medium transition-colors ".concat(filters.status === option.value
                ? option.color
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>
                  {option.label}
                </button>); })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Estado de Pago
            </label>
            <div className="flex flex-wrap gap-2">
              {paymentStatusOptions.map(function (option) { return (<button key={option.value} onClick={function () { return updateFilter('paymentStatus', option.value); }} className={"px-3 py-1 rounded-full text-xs font-medium transition-colors ".concat(filters.paymentStatus === option.value
                ? option.color
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>
                  {option.label}
                </button>); })}
            </div>
          </div>
        </div>

        {/* Filtros avanzados */}
        <framer_motion_1.motion.div initial={false} animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Fecha Desde
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                <input_1.Input type="date" value={filters.dateFrom} onChange={function (e) { return updateFilter('dateFrom', e.target.value); }} className="pl-10"/>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Fecha Hasta
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                <input_1.Input type="date" value={filters.dateTo} onChange={function (e) { return updateFilter('dateTo', e.target.value); }} className="pl-10"/>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Importe Mínimo (€)
              </label>
              <input_1.Input type="number" placeholder="0.00" value={filters.minAmount} onChange={function (e) { return updateFilter('minAmount', e.target.value); }} min="0" step="0.01"/>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Importe Máximo (€)
              </label>
              <input_1.Input type="number" placeholder="0.00" value={filters.maxAmount} onChange={function (e) { return updateFilter('maxAmount', e.target.value); }} min="0" step="0.01"/>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                ID Cliente
              </label>
              <input_1.Input placeholder="Buscar por ID de cliente..." value={filters.clientId} onChange={function (e) { return updateFilter('clientId', e.target.value); }}/>
            </div>
          </div>
        </framer_motion_1.motion.div>
      </card_1.CardContent>
    </card_1.Card>);
}
function InvoiceSearch(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.placeholder, placeholder = _b === void 0 ? "Buscar facturas..." : _b, _c = _a.className, className = _c === void 0 ? "" : _c;
    return (<div className={"relative ".concat(className)}>
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
      <input_1.Input type="text" placeholder={placeholder} value={value} onChange={function (e) { return onChange(e.target.value); }} className="pl-10 pr-4 py-2 w-full"/>
      {value && (<button onClick={function () { return onChange(''); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <XIcon className="w-4 h-4"/>
        </button>)}
    </div>);
}
function FilterChips(_a) {
    var filters = _a.filters, onRemoveFilter = _a.onRemoveFilter, _b = _a.className, className = _b === void 0 ? "" : _b;
    var activeFilters = Object.entries(filters).filter(function (_a) {
        var key = _a[0], value = _a[1];
        if (key === 'search')
            return value.length > 0;
        if (key === 'status' || key === 'paymentStatus')
            return value !== 'all';
        return value.length > 0;
    });
    if (activeFilters.length === 0)
        return null;
    var getFilterLabel = function (key, value) {
        switch (key) {
            case 'search':
                return "B\u00FAsqueda: \"".concat(value, "\"");
            case 'status':
                return "Estado: ".concat(value);
            case 'paymentStatus':
                return "Pago: ".concat(value);
            case 'dateFrom':
                return "Desde: ".concat(value);
            case 'dateTo':
                return "Hasta: ".concat(value);
            case 'minAmount':
                return "M\u00EDn: \u20AC".concat(value);
            case 'maxAmount':
                return "M\u00E1x: \u20AC".concat(value);
            case 'clientId':
                return "Cliente: ".concat(value);
            default:
                return "".concat(key, ": ").concat(value);
        }
    };
    return (<div className={"flex flex-wrap gap-2 ".concat(className)}>
      {activeFilters.map(function (_a) {
            var key = _a[0], value = _a[1];
            return (<framer_motion_1.motion.div key={key} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
          <badge_1.Badge variant="secondary" className="flex items-center gap-1 pr-1">
            {getFilterLabel(key, value)}
            <button onClick={function () { return onRemoveFilter(key); }} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
              <XIcon className="w-3 h-3"/>
            </button>
          </badge_1.Badge>
        </framer_motion_1.motion.div>);
        })}
    </div>);
}
