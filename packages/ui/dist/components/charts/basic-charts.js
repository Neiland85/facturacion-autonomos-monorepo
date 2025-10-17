"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarChart = BarChart;
exports.LineChart = LineChart;
exports.PieChart = PieChart;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
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
function BarChart(_a) {
    var data = _a.data, title = _a.title, _b = _a.height, height = _b === void 0 ? 300 : _b, _c = _a.showValues, showValues = _c === void 0 ? true : _c, _d = _a.className, className = _d === void 0 ? "" : _d;
    var _e = (0, react_1.useState)(data.map(function () { return 0; })), animatedValues = _e[0], setAnimatedValues = _e[1];
    var maxValue = Math.max.apply(Math, data.map(function (d) { return d.value; }));
    var padding = 60;
    (0, react_1.useEffect)(function () {
        var timer = setTimeout(function () {
            setAnimatedValues(data.map(function (d) { return d.value; }));
        }, 100);
        return function () { return clearTimeout(timer); };
    }, [data]);
    var getBarColor = function (index, customColor) {
        if (customColor)
            return customColor;
        var colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
            '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
        ];
        return colors[index % colors.length];
    };
    return (<card_1.Card className={className}>
      {title && (<card_1.CardHeader>
          <card_1.CardTitle className="text-lg">{title}</card_1.CardTitle>
        </card_1.CardHeader>)}
      <card_1.CardContent>
        <div style={{ height: height }} className="w-full">
          <svg width="100%" height="100%" viewBox={"0 0 400 ".concat(height)}>
            {/* Ejes */}
            <line x1={padding} y1={height - padding} x2={380} y2={height - padding} stroke="#E5E7EB" strokeWidth="1"/>
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1"/>

            {/* Barras */}
            {data.map(function (item, index) {
            var barWidth = (320 / data.length) * 0.8;
            var barHeight = ((animatedValues[index] || 0) / maxValue) * (height - 2 * padding);
            var x = padding + (320 / data.length) * index + (320 / data.length) * 0.1;
            var y = height - padding - barHeight;
            return (<framer_motion_1.motion.rect key={item.label} x={x} y={y} width={barWidth} height={barHeight} fill={getBarColor(index, item.color)} initial={{ height: 0, y: height - padding }} animate={{ height: barHeight, y: y }} transition={{ duration: 0.8, delay: index * 0.1 }} className="hover:opacity-80 cursor-pointer"/>);
        })}

            {/* Etiquetas del eje X */}
            {data.map(function (item, index) {
            var x = padding + (320 / data.length) * index + (320 / data.length) * 0.5;
            var y = height - padding + 20;
            return (<text key={"label-".concat(index)} x={x} y={y} textAnchor="middle" fontSize="12" fill="#6B7280" className="truncate" style={{ maxWidth: '60px' }}>
                  {item.label.length > 8 ? "".concat(item.label.substring(0, 8), "...") : item.label}
                </text>);
        })}

            {/* Valores sobre las barras */}
            {showValues && data.map(function (item, index) {
            var barHeight = (animatedValues[index] || 0) / maxValue * (height - 2 * padding);
            var x = padding + (320 / data.length) * index + (320 / data.length) * 0.5;
            var y = height - padding - barHeight - 10;
            if (barHeight < 30)
                return null; // No mostrar si la barra es muy pequeña
            return (<framer_motion_1.motion.text key={"value-".concat(index)} x={x} y={y} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#374151" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + index * 0.1 }}>
                  {item.value.toLocaleString()}
                </framer_motion_1.motion.text>);
        })}
          </svg>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function LineChart(_a) {
    var data = _a.data, title = _a.title, _b = _a.height, height = _b === void 0 ? 300 : _b, _c = _a.showPoints, showPoints = _c === void 0 ? true : _c, _d = _a.showArea, showArea = _d === void 0 ? false : _d, _e = _a.className, className = _e === void 0 ? "" : _e;
    var _f = (0, react_1.useState)(data.map(function () { return 0; })), animatedValues = _f[0], setAnimatedValues = _f[1];
    var maxValue = Math.max.apply(Math, data.map(function (d) { return d.value; }));
    var minValue = Math.min.apply(Math, data.map(function (d) { return d.value; }));
    var range = maxValue - minValue || 1;
    var padding = 60;
    (0, react_1.useEffect)(function () {
        var timer = setTimeout(function () {
            setAnimatedValues(data.map(function (d) { return d.value; }));
        }, 100);
        return function () { return clearTimeout(timer); };
    }, [data]);
    var getPoint = function (index) {
        var _a;
        var x = padding + (320 / (data.length - 1)) * index;
        var y = height - padding - (((_a = animatedValues[index]) !== null && _a !== void 0 ? _a : 0 - minValue) / range) * (height - 2 * padding);
        return { x: x, y: y };
    };
    var pathData = data.map(function (_, index) {
        var point = getPoint(index);
        return "".concat(index === 0 ? 'M' : 'L', " ").concat(point.x, " ").concat(point.y);
    }).join(' ');
    var areaPathData = pathData + " L ".concat(getPoint(data.length - 1).x, " ").concat(height - padding, " L ").concat(getPoint(0).x, " ").concat(height - padding, " Z");
    return (<card_1.Card className={className}>
      {title && (<card_1.CardHeader>
          <card_1.CardTitle className="text-lg">{title}</card_1.CardTitle>
        </card_1.CardHeader>)}
      <card_1.CardContent>
        <div style={{ height: height }} className="w-full">
          <svg width="100%" height="100%" viewBox={"0 0 400 ".concat(height)}>
            {/* Ejes */}
            <line x1={padding} y1={height - padding} x2={380} y2={height - padding} stroke="#E5E7EB" strokeWidth="1"/>
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1"/>

            {/* Área bajo la línea */}
            {showArea && (<framer_motion_1.motion.path d={areaPathData} fill="url(#areaGradient)" fillOpacity="0.1" initial={{ d: '' }} animate={{ d: areaPathData }} transition={{ duration: 1 }}/>)}

            {/* Gradiente para el área */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
              </linearGradient>
            </defs>

            {/* Línea */}
            <framer_motion_1.motion.path d={pathData} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}/>

            {/* Puntos */}
            {showPoints && data.map(function (item, index) {
            var point = getPoint(index);
            return (<framer_motion_1.motion.circle key={"point-".concat(index)} cx={point.x} cy={point.y} r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + index * 0.1 }} className="hover:r-6 cursor-pointer"/>);
        })}

            {/* Etiquetas del eje X */}
            {data.map(function (item, index) {
            var x = padding + (320 / (data.length - 1)) * index;
            var y = height - padding + 20;
            return (<text key={"label-".concat(index)} x={x} y={y} textAnchor="middle" fontSize="12" fill="#6B7280">
                  {item.label}
                </text>);
        })}
          </svg>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function PieChart(_a) {
    var data = _a.data, title = _a.title, _b = _a.size, size = _b === void 0 ? 200 : _b, _c = _a.showLabels, showLabels = _c === void 0 ? true : _c, _d = _a.showLegend, showLegend = _d === void 0 ? true : _d, _e = _a.className, className = _e === void 0 ? "" : _e;
    var total = data.reduce(function (sum, item) { return sum + item.value; }, 0);
    var _f = (0, react_1.useState)(data.map(function () { return 0; })), animatedAngles = _f[0], setAnimatedAngles = _f[1];
    (0, react_1.useEffect)(function () {
        var timer = setTimeout(function () {
            var currentAngle = 0;
            var angles = data.map(function (item) {
                var angle = currentAngle;
                currentAngle += (item.value / total) * 360;
                return angle;
            });
            setAnimatedAngles(angles);
        }, 100);
        return function () { return clearTimeout(timer); };
    }, [data, total]);
    var getSliceColor = function (index, customColor) {
        if (customColor)
            return customColor;
        var colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
            '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
        ];
        return colors[index % colors.length];
    };
    var createSlice = function (startAngle, endAngle, radius) {
        var startAngleRad = (startAngle * Math.PI) / 180;
        var endAngleRad = (endAngle * Math.PI) / 180;
        var x1 = Math.cos(startAngleRad) * radius;
        var y1 = Math.sin(startAngleRad) * radius;
        var x2 = Math.cos(endAngleRad) * radius;
        var y2 = Math.sin(endAngleRad) * radius;
        var largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        return "M 0 0 L ".concat(x1, " ").concat(y1, " A ").concat(radius, " ").concat(radius, " 0 ").concat(largeArcFlag, " 1 ").concat(x2, " ").concat(y2, " Z");
    };
    return (<card_1.Card className={className}>
      {title && (<card_1.CardHeader>
          <card_1.CardTitle className="text-lg">{title}</card_1.CardTitle>
        </card_1.CardHeader>)}
      <card_1.CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div style={{ width: size, height: size }} className="relative">
            <svg width={size} height={size} viewBox={"-".concat(size / 2, " -").concat(size / 2, " ").concat(size, " ").concat(size)}>
              {data.map(function (item, index) {
            var startAngle = animatedAngles[index] || 0;
            var endAngle = startAngle + (item.value / total) * 360;
            var path = createSlice(startAngle, endAngle, size / 2 - 10);
            return (<framer_motion_1.motion.path key={item.label} d={path} fill={getSliceColor(index, item.color)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="hover:opacity-80 cursor-pointer"/>);
        })}
            </svg>

            {/* Etiquetas */}
            {showLabels && data.map(function (item, index) {
            var _a;
            var percentage = (item.value / total) * 100;
            if (percentage < 5)
                return null; // No mostrar etiquetas para slices muy pequeñas
            var angle = ((_a = animatedAngles[index]) !== null && _a !== void 0 ? _a : 0) + (item.value / total) * 180;
            var angleRad = (angle * Math.PI) / 180;
            var radius = size / 2 - 30;
            var x = Math.cos(angleRad) * radius;
            var y = Math.sin(angleRad) * radius;
            return (<framer_motion_1.motion.text key={"label-".concat(index)} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="#FFFFFF" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + index * 0.1 }}>
                  {Math.round(percentage)}%
                </framer_motion_1.motion.text>);
        })}
          </div>

          {/* Leyenda */}
          {showLegend && (<div className="flex flex-wrap justify-center gap-4">
              {data.map(function (item, index) { return (<div key={item.label} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSliceColor(index, item.color) }}/>
                  <span className="text-sm text-gray-600">
                    {item.label} ({((item.value / total) * 100).toFixed(1)}%)
                  </span>
                </div>); })}
            </div>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
