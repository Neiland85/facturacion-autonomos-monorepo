"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculadorFiscal = exports.logger = exports.BusinessError = exports.generateInvoiceNumber = exports.calculateTotalAmount = exports.calculateVAT = exports.INVOICE_STATUS = exports.VAT_RATES = exports.formatDate = exports.formatCurrency = exports.validateTaxId = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validateTaxId = (taxId) => {
    const taxIdRegex = /^[0-9]{8}[A-Z]$|^[A-Z][0-9]{7}[A-Z]$/;
    return taxIdRegex.test(taxId);
};
exports.validateTaxId = validateTaxId;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES').format(date);
};
exports.formatDate = formatDate;
exports.VAT_RATES = {
    GENERAL: 0.21,
    REDUCED: 0.10,
    SUPER_REDUCED: 0.04
};
exports.INVOICE_STATUS = {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue'
};
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
class BusinessError extends Error {
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'BusinessError';
    }
}
exports.BusinessError = BusinessError;
exports.logger = {
    info: (message, data) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
    },
    warn: (message, data) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data || '');
    }
};
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
    logger: exports.logger
};
//# sourceMappingURL=index.js.map