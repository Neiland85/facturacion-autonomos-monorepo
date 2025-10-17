"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueChart = RevenueChart;
exports.InvoiceStatusChart = InvoiceStatusChart;
exports.MonthlyComparison = MonthlyComparison;
exports.CashFlowChart = CashFlowChart;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var badge_1 = require("../ui/badge");
var card_1 = require("../ui/card");
// Iconos personalizados
var TrendingUpIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
  </svg>);
};
var TrendingDownIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
  </svg>);
};
function RevenueChart(_a) {
    var data = _a.data, _b = _a.title, title = _b === void 0 ? "Evolución de Ingresos" : _b, _c = _a.height, height = _c === void 0 ? 300 : _c, _d = _a.className, className = _d === void 0 ? "" : _d;
    var _e = (0, react_1.useState)(data.map(function () { return ({ revenue: 0, expenses: 0, profit: 0 }); })), animatedData = _e[0], setAnimatedData = _e[1];
    var maxValue = Math.max.apply(Math, data.flatMap(function (d) { return [d.revenue, d.expenses, d.profit]; }));
    var padding = 80;
    (0, react_1.useEffect)(function () {
        var timer = setTimeout(function () {
            setAnimatedData(data);
        }, 100);
        return function () { return clearTimeout(timer); };
    }, [data]);
    var getPoint = function (index, value) {
        var x = padding + (320 / (data.length - 1)) * index;
        var y = height - padding - (value / maxValue) * (height - 2 * padding);
        return { x: x, y: y };
    };
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg">{title}</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div style={{ height: height }} className="w-full">
          <svg width="100%" height="100%" viewBox={"0 0 400 ".concat(height)}>
            {/* Ejes */}
            <line x1={padding} y1={height - padding} x2={380} y2={height - padding} stroke="#E5E7EB" strokeWidth="1"/>
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1"/>

            {/* Área de beneficio */}
            {data.map(function (_, index) {
            var _a, _b;
            if (index === 0)
                return null;
            var current = (_a = animatedData[index]) !== null && _a !== void 0 ? _a : { revenue: 0, expenses: 0, profit: 0 };
            var prev = (_b = animatedData[index - 1]) !== null && _b !== void 0 ? _b : { revenue: 0, expenses: 0, profit: 0 };
            var currentPoint = getPoint(index, current.profit);
            var prevPoint = getPoint(index - 1, prev.profit);
            return (<framer_motion_1.motion.line key={"profit-".concat(index)} x1={prevPoint.x} y1={prevPoint.y} x2={currentPoint.x} y2={currentPoint.y} stroke="#10B981" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: index * 0.1 }}/>);
        })}

            {/* Área de ingresos */}
            {data.map(function (_, index) {
            var _a, _b;
            if (index === 0)
                return null;
            var current = (_a = animatedData[index]) !== null && _a !== void 0 ? _a : { revenue: 0, expenses: 0, profit: 0 };
            var prev = (_b = animatedData[index - 1]) !== null && _b !== void 0 ? _b : { revenue: 0, expenses: 0, profit: 0 };
            var currentPoint = getPoint(index, current.revenue);
            var prevPoint = getPoint(index - 1, prev.revenue);
            return (<framer_motion_1.motion.line key={"revenue-".concat(index)} x1={prevPoint.x} y1={prevPoint.y} x2={currentPoint.x} y2={currentPoint.y} stroke="#3B82F6" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: index * 0.1 }}/>);
        })}

            {/* Área de gastos */}
            {data.map(function (_, index) {
            var _a, _b;
            if (index === 0)
                return null;
            var current = (_a = animatedData[index]) !== null && _a !== void 0 ? _a : { revenue: 0, expenses: 0, profit: 0 };
            var prev = (_b = animatedData[index - 1]) !== null && _b !== void 0 ? _b : { revenue: 0, expenses: 0, profit: 0 };
            var currentPoint = getPoint(index, current.expenses);
            var prevPoint = getPoint(index - 1, prev.expenses);
            return (<framer_motion_1.motion.line key={"expenses-".concat(index)} x1={prevPoint.x} y1={prevPoint.y} x2={currentPoint.x} y2={currentPoint.y} stroke="#EF4444" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: index * 0.1 }}/>);
        })}

            {/* Puntos */}
            {data.map(function (item, index) {
            var _a;
            var currentData = (_a = animatedData[index]) !== null && _a !== void 0 ? _a : { revenue: 0, expenses: 0, profit: 0 };
            if (!currentData)
                return null;
            var revenuePoint = getPoint(index, currentData.revenue);
            var expensesPoint = getPoint(index, currentData.expenses);
            var profitPoint = getPoint(index, currentData.profit);
            return (<g key={"points-".concat(index)}>
                  <framer_motion_1.motion.circle cx={revenuePoint.x} cy={revenuePoint.y} r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + index * 0.1 }}/>
                  <framer_motion_1.motion.circle cx={expensesPoint.x} cy={expensesPoint.y} r="4" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + index * 0.1 }}/>
                  <framer_motion_1.motion.circle cx={profitPoint.x} cy={profitPoint.y} r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + index * 0.1 }}/>
                </g>);
        })}

            {/* Etiquetas del eje X */}
            {data.map(function (item, index) {
            var x = padding + (320 / (data.length - 1)) * index;
            var y = height - padding + 20;
            return (<text key={"label-".concat(index)} x={x} y={y} textAnchor="middle" fontSize="12" fill="#6B7280">
                  {item.month}
                </text>);
        })}
          </svg>
        </div>

        {/* Leyenda */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"/>
            <span className="text-sm text-gray-600">Ingresos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"/>
            <span className="text-sm text-gray-600">Gastos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"/>
            <span className="text-sm text-gray-600">Beneficio</span>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function InvoiceStatusChart(_a) {
    var data = _a.data, _b = _a.title, title = _b === void 0 ? "Estado de Facturas" : _b, _c = _a.className, className = _c === void 0 ? "" : _c;
    var total = Object.values(data).reduce(function (sum, value) { return sum + value; }, 0);
    var _d = (0, react_1.useState)({
        draft: 0,
        sent: 0,
        paid: 0,
        overdue: 0,
        cancelled: 0,
    }), animatedValues = _d[0], setAnimatedValues = _d[1];
    (0, react_1.useEffect)(function () {
        var timer = setTimeout(function () {
            setAnimatedValues(data);
        }, 100);
        return function () { return clearTimeout(timer); };
    }, [data]);
    var statusConfig = {
        draft: { label: 'Borrador', color: '#F59E0B', bgColor: 'bg-yellow-100' },
        sent: { label: 'Enviada', color: '#3B82F6', bgColor: 'bg-blue-100' },
        paid: { label: 'Pagada', color: '#10B981', bgColor: 'bg-green-100' },
        overdue: { label: 'Vencida', color: '#EF4444', bgColor: 'bg-red-100' },
        cancelled: { label: 'Cancelada', color: '#6B7280', bgColor: 'bg-gray-100' },
    };
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg">{title}</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          {Object.entries(statusConfig).map(function (_a, index) {
            var key = _a[0], config = _a[1];
            var value = animatedValues[key];
            var percentage = total > 0 ? (value / total) * 100 : 0;
            return (<framer_motion_1.motion.div key={key} className="flex items-center space-x-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{config.label}</span>
                    <span className="text-sm text-gray-600">
                      {value} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <framer_motion_1.motion.div className="h-2 rounded-full" style={{ backgroundColor: config.color }} initial={{ width: 0 }} animate={{ width: "".concat(percentage, "%") }} transition={{ duration: 1, delay: 0.5 + index * 0.1 }}/>
                  </div>
                </div>
                <badge_1.Badge className={"".concat(config.bgColor, " text-gray-800 border-0")} variant="secondary">
                  {value}
                </badge_1.Badge>
              </framer_motion_1.motion.div>);
        })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Total de Facturas</span>
            <span className="text-lg font-bold">{total}</span>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function MonthlyComparison(_a) {
    var currentMonth = _a.currentMonth, previousMonth = _a.previousMonth, _b = _a.title, title = _b === void 0 ? "Comparación Mensual" : _b, _c = _a.className, className = _c === void 0 ? "" : _c;
    var calculateChange = function (current, previous) {
        if (previous === 0)
            return { value: 0, percentage: 0, isPositive: true };
        var change = current - previous;
        var percentage = (change / previous) * 100;
        return {
            value: change,
            percentage: Math.abs(percentage),
            isPositive: change >= 0,
        };
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };
    var metrics = [
        {
            label: 'Ingresos',
            current: currentMonth.revenue,
            previous: previousMonth.revenue,
            format: formatCurrency,
        },
        {
            label: 'Facturas',
            current: currentMonth.invoices,
            previous: previousMonth.invoices,
            format: function (value) { return value.toString(); },
        },
        {
            label: 'Clientes',
            current: currentMonth.clients,
            previous: previousMonth.clients,
            format: function (value) { return value.toString(); },
        },
    ];
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg">{title}</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-6">
          {metrics.map(function (metric, index) {
            var change = calculateChange(metric.current, metric.previous);
            return (<framer_motion_1.motion.div key={metric.label} className="flex items-center justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.format(metric.current)}</p>
                  <div className="flex items-center mt-1">
                    {change.isPositive ? (<TrendingUpIcon className="w-4 h-4 text-green-600 mr-1"/>) : (<TrendingDownIcon className="w-4 h-4 text-red-600 mr-1"/>)}
                    <span className={"text-sm font-medium ".concat(change.isPositive ? 'text-green-600' : 'text-red-600')}>
                      {change.isPositive ? '+' : '-'}{change.percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      vs mes anterior
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Mes anterior</p>
                  <p className="text-lg text-gray-600">{metric.format(metric.previous)}</p>
                </div>
              </framer_motion_1.motion.div>);
        })}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function CashFlowChart(_a) {
    var data = _a.data, _b = _a.title, title = _b === void 0 ? "Flujo de Caja" : _b, _c = _a.height, height = _c === void 0 ? 300 : _c, _d = _a.className, className = _d === void 0 ? "" : _d;
    var _e = (0, react_1.useState)(data.map(function () { return ({ inflow: 0, outflow: 0, balance: 0 }); })), animatedData = _e[0], setAnimatedData = _e[1];
    var values = data.flatMap(function (d) { return [d.inflow, d.outflow, d.balance]; });
    var maxValue = Math.max.apply(Math, values);
    var minValue = Math.min.apply(Math, values);
    var range = maxValue - minValue || 1;
    var padding = 80;
    (0, react_1.useEffect)(function () {
        var timer = setTimeout(function () {
            setAnimatedData(data);
        }, 100);
        return function () { return clearTimeout(timer); };
    }, [data]);
    var getPoint = function (index, value) {
        var x = padding + (320 / (data.length - 1)) * index;
        var y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
        return { x: x, y: y };
    };
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg">{title}</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div style={{ height: height }} className="w-full">
          <svg width="100%" height="100%" viewBox={"0 0 400 ".concat(height)}>
            {/* Ejes */}
            <line x1={padding} y1={height - padding} x2={380} y2={height - padding} stroke="#E5E7EB" strokeWidth="1"/>
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1"/>

            {/* Línea de cero */}
            <line x1={padding} y1={height - padding - ((0 - minValue) / range) * (height - 2 * padding)} x2={380} y2={height - padding - ((0 - minValue) / range) * (height - 2 * padding)} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="5,5"/>

            {/* Área de entradas */}
            {data.map(function (_, index) {
            var _a, _b;
            if (index === 0)
                return null;
            var current = (_a = animatedData[index]) !== null && _a !== void 0 ? _a : { inflow: 0, outflow: 0, balance: 0 };
            var prev = (_b = animatedData[index - 1]) !== null && _b !== void 0 ? _b : { inflow: 0, outflow: 0, balance: 0 };
            var currentPoint = getPoint(index, current.inflow);
            var prevPoint = getPoint(index - 1, prev.inflow);
            return (<framer_motion_1.motion.line key={"inflow-".concat(index)} x1={prevPoint.x} y1={prevPoint.y} x2={currentPoint.x} y2={currentPoint.y} stroke="#10B981" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: index * 0.1 }}/>);
        })}

            {/* Área de salidas */}
            {data.map(function (_, index) {
            var _a, _b;
            if (index === 0)
                return null;
            var current = (_a = animatedData[index]) !== null && _a !== void 0 ? _a : { inflow: 0, outflow: 0, balance: 0 };
            var prev = (_b = animatedData[index - 1]) !== null && _b !== void 0 ? _b : { inflow: 0, outflow: 0, balance: 0 };
            var currentPoint = getPoint(index, current.outflow);
            var prevPoint = getPoint(index - 1, prev.outflow);
            return (<framer_motion_1.motion.line key={"outflow-".concat(index)} x1={prevPoint.x} y1={prevPoint.y} x2={currentPoint.x} y2={currentPoint.y} stroke="#EF4444" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: index * 0.1 }}/>);
        })}

            {/* Área de balance */}
            {data.map(function (_, index) {
            var _a, _b;
            if (index === 0)
                return null;
            var current = (_a = animatedData[index]) !== null && _a !== void 0 ? _a : { inflow: 0, outflow: 0, balance: 0 };
            var prev = (_b = animatedData[index - 1]) !== null && _b !== void 0 ? _b : { inflow: 0, outflow: 0, balance: 0 };
            var currentPoint = getPoint(index, current.balance);
            var prevPoint = getPoint(index - 1, prev.balance);
            return (<framer_motion_1.motion.line key={"balance-".concat(index)} x1={prevPoint.x} y1={prevPoint.y} x2={currentPoint.x} y2={currentPoint.y} stroke="#3B82F6" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: index * 0.1 }}/>);
        })}

            {/* Etiquetas del eje X */}
            {data.map(function (item, index) {
            var x = padding + (320 / (data.length - 1)) * index;
            var y = height - padding + 20;
            return (<text key={"label-".concat(index)} x={x} y={y} textAnchor="middle" fontSize="12" fill="#6B7280">
                  {item.date}
                </text>);
        })}
          </svg>
        </div>

        {/* Leyenda */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"/>
            <span className="text-sm text-gray-600">Entradas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"/>
            <span className="text-sm text-gray-600">Salidas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-blue-500 rounded"/>
            <span className="text-sm text-gray-600">Balance</span>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
