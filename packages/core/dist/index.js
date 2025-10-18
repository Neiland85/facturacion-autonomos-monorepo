"use strict";
/**
 * @fileoverview Core business logic and utilities for the facturacion-autonomos project
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.CalculadorFiscal = exports.logger = exports.BusinessError = exports.generateInvoiceNumber = exports.calculateTotalAmount = exports.calculateVAT = exports.INVOICE_STATUS = exports.VAT_RATES = exports.formatDate = exports.formatCurrency = exports.validateTaxId = exports.validateEmail = void 0;
// Utilidades de validación
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validateTaxId = (taxId) => {
    // Validación básica de NIF/CIF español
    const taxIdRegex = /^\d{8}[A-Z]$|^[A-Z]\d{7}[A-Z]$/;
    return taxIdRegex.test(taxId);
};
exports.validateTaxId = validateTaxId;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES').format(date);
};
exports.formatDate = formatDate;
// Constantes de negocio
exports.VAT_RATES = {
    GENERAL: 0.21,
    REDUCED: 0.1,
    SUPER_REDUCED: 0.04,
};
exports.INVOICE_STATUS = {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue',
};
// Utilidades de cálculo
const calculateVAT = (amount, rate = exports.VAT_RATES.GENERAL) => {
    return amount * rate;
};
exports.calculateVAT = calculateVAT;
const calculateTotalAmount = (amount, vatRate = exports.VAT_RATES.GENERAL) => {
    return amount + (0, exports.calculateVAT)(amount, vatRate);
};
exports.calculateTotalAmount = calculateTotalAmount;
const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `FAC-${year}-${timestamp}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
// Clase para manejo de errores de negocio
class BusinessError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'BusinessError';
    }
}
exports.BusinessError = BusinessError;
// Utilidades de logging
exports.logger = {
    info: (message, data) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
    },
    warn: (message, data) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data || '');
    },
};
// Exportar calculador fiscal
var calculador_1 = require("./fiscal/calculador");
Object.defineProperty(exports, "CalculadorFiscal", { enumerable: true, get: function () { return calculador_1.CalculadorFiscal; } });
exports.default = {
    validateEmail: exports.validateEmail,
    validateTaxId: exports.validateTaxId,
    formatCurrency: exports.formatCurrency,
    formatDate: exports.formatDate,
    VAT_RATES: exports.VAT_RATES,
    INVOICE_STATUS: exports.INVOICE_STATUS,
    calculateVAT: exports.calculateVAT,
    calculateTotalAmount: exports.calculateTotalAmount,
    generateInvoiceNumber: exports.generateInvoiceNumber,
    BusinessError,
    logger: exports.logger,
};
// Placeholder for core functionality
exports.version = '1.0.0';
