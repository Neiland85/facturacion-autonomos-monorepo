"use strict";
// Componentes de negocio específicos para TributariApp
// Estos componentes están diseñados para funcionalidades de facturación y gestión empresarial
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTaxRate = exports.calculateTotalWithTax = exports.calculateTax = exports.PAYMENT_STATUS_CONFIG = exports.INVOICE_STATUS_CONFIG = exports.formatDateTime = exports.formatDate = exports.formatCurrency = exports.TaxCalculator = exports.QuickTaxCalculator = exports.PaymentStatusBadge = exports.InvoiceStatusBadge = exports.InvoiceCard = exports.ClientCard = exports.QuickActions = exports.InvoiceStats = exports.InvoiceActions = exports.QuickStats = exports.BusinessDashboard = void 0;
var dashboard_1 = require("./dashboard");
Object.defineProperty(exports, "BusinessDashboard", { enumerable: true, get: function () { return dashboard_1.BusinessDashboard; } });
Object.defineProperty(exports, "QuickStats", { enumerable: true, get: function () { return dashboard_1.QuickStats; } });
var invoice_actions_1 = require("./invoice-actions");
Object.defineProperty(exports, "InvoiceActions", { enumerable: true, get: function () { return invoice_actions_1.InvoiceActions; } });
Object.defineProperty(exports, "InvoiceStats", { enumerable: true, get: function () { return invoice_actions_1.InvoiceStats; } });
Object.defineProperty(exports, "QuickActions", { enumerable: true, get: function () { return invoice_actions_1.QuickActions; } });
var invoice_client_cards_1 = require("./invoice-client-cards");
Object.defineProperty(exports, "ClientCard", { enumerable: true, get: function () { return invoice_client_cards_1.ClientCard; } });
Object.defineProperty(exports, "InvoiceCard", { enumerable: true, get: function () { return invoice_client_cards_1.InvoiceCard; } });
Object.defineProperty(exports, "InvoiceStatusBadge", { enumerable: true, get: function () { return invoice_client_cards_1.InvoiceStatusBadge; } });
Object.defineProperty(exports, "PaymentStatusBadge", { enumerable: true, get: function () { return invoice_client_cards_1.PaymentStatusBadge; } });
var tax_calculator_1 = require("./tax-calculator");
Object.defineProperty(exports, "QuickTaxCalculator", { enumerable: true, get: function () { return tax_calculator_1.QuickTaxCalculator; } });
Object.defineProperty(exports, "TaxCalculator", { enumerable: true, get: function () { return tax_calculator_1.TaxCalculator; } });
// Utilidades para formateo
var formatCurrency = function (amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
var formatDate = function (date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
};
exports.formatDate = formatDate;
var formatDateTime = function (date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
};
exports.formatDateTime = formatDateTime;
// Constantes para estados y configuraciones
exports.INVOICE_STATUS_CONFIG = {
    draft: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-800' },
    sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
    paid: { label: 'Pagada', color: 'bg-green-100 text-green-800' },
    overdue: { label: 'Vencida', color: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
};
exports.PAYMENT_STATUS_CONFIG = {
    pending: { label: 'Pendiente', color: 'bg-orange-100 text-orange-800' },
    paid: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
    overdue: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
};
// Funciones de utilidad para cálculos fiscales
var calculateTax = function (baseAmount, taxRate) {
    return Math.round(((baseAmount * taxRate) / 100) * 100) / 100;
};
exports.calculateTax = calculateTax;
var calculateTotalWithTax = function (baseAmount, taxRate) {
    return baseAmount + (0, exports.calculateTax)(baseAmount, taxRate);
};
exports.calculateTotalWithTax = calculateTotalWithTax;
var calculateTaxRate = function (totalAmount, taxAmount) {
    if (totalAmount === 0)
        return 0;
    return Math.round((taxAmount / (totalAmount - taxAmount)) * 100 * 100) / 100;
};
exports.calculateTaxRate = calculateTaxRate;
