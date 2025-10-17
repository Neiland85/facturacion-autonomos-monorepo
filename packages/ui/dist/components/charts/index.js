"use strict";
// Componentes de gráficos y visualización de datos para TributariApp
// Gráficos personalizados sin dependencias externas, usando SVG puro
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
exports.animateValue = exports.CHART_DEFAULTS = exports.truncateLabel = exports.calculatePercentages = exports.generateChartColors = exports.formatChartValue = exports.RevenueChart = exports.MonthlyComparison = exports.InvoiceStatusChart = exports.CashFlowChart = exports.PieChart = exports.LineChart = exports.BarChart = void 0;
var basic_charts_1 = require("./basic-charts");
Object.defineProperty(exports, "BarChart", { enumerable: true, get: function () { return basic_charts_1.BarChart; } });
Object.defineProperty(exports, "LineChart", { enumerable: true, get: function () { return basic_charts_1.LineChart; } });
Object.defineProperty(exports, "PieChart", { enumerable: true, get: function () { return basic_charts_1.PieChart; } });
var business_charts_1 = require("./business-charts");
Object.defineProperty(exports, "CashFlowChart", { enumerable: true, get: function () { return business_charts_1.CashFlowChart; } });
Object.defineProperty(exports, "InvoiceStatusChart", { enumerable: true, get: function () { return business_charts_1.InvoiceStatusChart; } });
Object.defineProperty(exports, "MonthlyComparison", { enumerable: true, get: function () { return business_charts_1.MonthlyComparison; } });
Object.defineProperty(exports, "RevenueChart", { enumerable: true, get: function () { return business_charts_1.RevenueChart; } });
// Utilidades para formateo de datos en gráficos
var formatChartValue = function (value, type) {
    if (type === void 0) { type = 'number'; }
    switch (type) {
        case 'currency':
            return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        case 'percentage':
            return "".concat(value.toFixed(1), "%");
        case 'number':
        default:
            return value.toLocaleString('es-ES');
    }
};
exports.formatChartValue = formatChartValue;
var generateChartColors = function (count) {
    var baseColors = [
        '#3B82F6',
        '#EF4444',
        '#10B981',
        '#F59E0B',
        '#8B5CF6',
        '#06B6D4',
        '#F97316',
        '#84CC16',
        '#EC4899',
        '#6366F1',
        '#14B8A6',
        '#F59E0B',
    ];
    var colors = [];
    for (var i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
};
exports.generateChartColors = generateChartColors;
// Función para calcular porcentajes automáticamente
var calculatePercentages = function (data) {
    var total = data.reduce(function (sum, item) { return sum + item.value; }, 0);
    return data.map(function (item) { return (__assign(__assign({}, item), { value: total > 0 ? (item.value / total) * 100 : 0 })); });
};
exports.calculatePercentages = calculatePercentages;
// Función para truncar etiquetas largas
var truncateLabel = function (label, maxLength) {
    if (maxLength === void 0) { maxLength = 15; }
    return label.length > maxLength
        ? "".concat(label.substring(0, maxLength), "...")
        : label;
};
exports.truncateLabel = truncateLabel;
// Configuraciones predeterminadas para diferentes tipos de gráficos
exports.CHART_DEFAULTS = {
    barChart: {
        height: 300,
        showValues: true,
        barSpacing: 0.8,
    },
    lineChart: {
        height: 300,
        showPoints: true,
        showArea: false,
        strokeWidth: 3,
    },
    pieChart: {
        size: 200,
        showLabels: true,
        showLegend: true,
        minPercentageForLabel: 5,
    },
    businessCharts: {
        height: 300,
        animationDuration: 800,
        delayBetweenItems: 100,
    },
};
// Función para animar valores progresivamente
var animateValue = function (startValue, endValue, duration, callback) {
    if (duration === void 0) { duration = 1000; }
    var startTime = Date.now();
    var difference = endValue - startValue;
    var animate = function () {
        var elapsed = Date.now() - startTime;
        var progress = Math.min(elapsed / duration, 1);
        // Función de easing (ease-out)
        var easedProgress = 1 - Math.pow(1 - progress, 3);
        var currentValue = startValue + difference * easedProgress;
        callback(currentValue);
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    animate();
    // Función de cleanup
    return function () {
        callback(endValue);
    };
};
exports.animateValue = animateValue;
