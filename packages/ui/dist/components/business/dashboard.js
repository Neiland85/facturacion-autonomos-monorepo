"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessDashboard = BusinessDashboard;
exports.QuickStats = QuickStats;
var framer_motion_1 = require("framer-motion");
var badge_1 = require("../ui/badge");
var card_1 = require("../ui/card");
var progress_1 = require("../ui/progress");
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
var DollarIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v22m5-18H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>);
};
var UsersIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>);
};
var FileTextIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>);
};
var ClockIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>);
};
function MetricCard(_a) {
    var title = _a.title, value = _a.value, change = _a.change, icon = _a.icon, color = _a.color, bgColor = _a.bgColor, _b = _a.className, className = _b === void 0 ? "" : _b;
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <card_1.Card className={"".concat(bgColor, " border-0 ").concat(className)}>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <p className={"text-3xl font-bold ".concat(color)}>
                {value}
              </p>
              {change && (<div className="flex items-center mt-2">
                  {change.isPositive ? (<TrendingUpIcon className="w-4 h-4 text-green-600 mr-1"/>) : (<TrendingDownIcon className="w-4 h-4 text-red-600 mr-1"/>)}
                  <span className={"text-sm font-medium ".concat(change.isPositive ? 'text-green-600' : 'text-red-600')}>
                    {change.value > 0 ? '+' : ''}{change.value}% {change.label}
                  </span>
                </div>)}
            </div>
            <div className={"".concat(color, " opacity-20")}>
              {icon}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </framer_motion_1.motion.div>);
}
function BusinessDashboard(_a) {
    var metrics = _a.metrics, _b = _a.className, className = _b === void 0 ? "" : _b;
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };
    var formatPercentage = function (value) {
        return "".concat(value.toFixed(1), "%");
    };
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Ingresos Totales" value={formatCurrency(metrics.totalRevenue)} change={{
            value: 12.5,
            label: "vs mes anterior",
            isPositive: true,
        }} icon={<DollarIcon className="w-8 h-8"/>} color="text-green-600" bgColor="bg-green-50"/>

        <MetricCard title="Ingresos Mensuales" value={formatCurrency(metrics.monthlyRevenue)} change={{
            value: 8.2,
            label: "vs mes anterior",
            isPositive: true,
        }} icon={<TrendingUpIcon className="w-8 h-8"/>} color="text-blue-600" bgColor="bg-blue-50"/>

        <MetricCard title="Total Clientes" value={metrics.totalClients} change={{
            value: 5.1,
            label: "vs mes anterior",
            isPositive: true,
        }} icon={<UsersIcon className="w-8 h-8"/>} color="text-purple-600" bgColor="bg-purple-50"/>

        <MetricCard title="Facturas Totales" value={metrics.totalInvoices} change={{
            value: -2.3,
            label: "vs mes anterior",
            isPositive: false,
        }} icon={<FileTextIcon className="w-8 h-8"/>} color="text-orange-600" bgColor="bg-orange-50"/>
      </div>

      {/* Métricas secundarias y gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de cobros */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5"/>
              Estado de Cobros
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Facturas Pendientes</span>
              <badge_1.Badge variant="outline" className="text-orange-600 border-orange-600">
                {metrics.pendingInvoices}
              </badge_1.Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Facturas Vencidas</span>
              <badge_1.Badge variant="outline" className="text-red-600 border-red-600">
                {metrics.overdueInvoices}
              </badge_1.Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tasa de Cobro</span>
                <span className="font-medium">{formatPercentage(metrics.collectionRate)}</span>
              </div>
              <progress_1.Progress value={metrics.collectionRate} className="h-2"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Resumen de rendimiento */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Rendimiento del Mes</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.averageInvoiceValue)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Valor Promedio Factura
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(metrics.totalInvoices / metrics.totalClients)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Facturas por Cliente
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Objetivo Mensual</span>
                <span className="text-sm font-medium">
                  {formatCurrency(metrics.monthlyRevenue)} / {formatCurrency(50000)}
                </span>
              </div>
              <progress_1.Progress value={(metrics.monthlyRevenue / 50000) * 100} className="h-2"/>
              <p className="text-xs text-muted-foreground text-center">
                {formatPercentage((metrics.monthlyRevenue / 50000) * 100)} del objetivo alcanzado
              </p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Alertas importantes */}
      <card_1.Card className="border-orange-200 bg-orange-50">
        <card_1.CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-orange-600 mt-0.5"/>
            <div>
              <h4 className="font-medium text-orange-900">
                Recordatorios Importantes
              </h4>
              <ul className="mt-2 text-sm text-orange-800 space-y-1">
                <li>• {metrics.overdueInvoices} facturas pendientes de cobro</li>
                <li>• {metrics.pendingInvoices} facturas enviadas sin pagar</li>
                <li>• Próxima fecha de declaración de impuestos: 20 de este mes</li>
              </ul>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
function QuickStats(_a) {
    var stats = _a.stats, _b = _a.className, className = _b === void 0 ? "" : _b;
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            notation: 'compact',
        }).format(amount);
    };
    return (<div className={"grid grid-cols-2 md:grid-cols-5 gap-4 ".concat(className)}>
      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <card_1.Card className="text-center">
          <card_1.CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.todayRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </card_1.CardContent>
        </card_1.Card>
      </framer_motion_1.motion.div>

      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <card_1.Card className="text-center">
          <card_1.CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.weekRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">Esta Semana</p>
          </card_1.CardContent>
        </card_1.Card>
      </framer_motion_1.motion.div>

      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
        <card_1.Card className="text-center">
          <card_1.CardContent className="p-4">
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.monthRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">Este Mes</p>
          </card_1.CardContent>
        </card_1.Card>
      </framer_motion_1.motion.div>

      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
        <card_1.Card className="text-center">
          <card_1.CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">
              {stats.pendingPayments}
            </p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </card_1.CardContent>
        </card_1.Card>
      </framer_motion_1.motion.div>

      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
        <card_1.Card className="text-center">
          <card_1.CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">
              {stats.overduePayments}
            </p>
            <p className="text-xs text-muted-foreground">Vencidas</p>
          </card_1.CardContent>
        </card_1.Card>
      </framer_motion_1.motion.div>
    </div>);
}
