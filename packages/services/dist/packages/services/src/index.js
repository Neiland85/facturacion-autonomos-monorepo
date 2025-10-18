"use strict";
/**
 * @fileoverview Shared services and API clients for the facturacion-autonomos project
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestampService = exports.XmlDSigSigner = exports.CertificateManager = exports.servicesVersion = exports.TAX_CALCULATOR_CONFIG = exports.DEFAULT_API_CONFIG = exports.ServiceFactory = exports.TaxCalculatorService = exports.ClientService = exports.InvoiceService = exports.AuthService = exports.HttpClient = void 0;
// Cliente HTTP base
class HttpClient {
    config;
    constructor(config) {
        this.config = config;
    }
    async get(endpoint) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.headers
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async post(endpoint, data) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.headers
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async put(endpoint, data) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.headers
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async delete(endpoint) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.headers
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
}
exports.HttpClient = HttpClient;
// Servicio de autenticación
class AuthService {
    httpClient;
    constructor(config) {
        this.httpClient = new HttpClient(config);
    }
    async login(email, password) {
        return this.httpClient.post('/auth/login', { email, password });
    }
    async register(userData) {
        return this.httpClient.post('/auth/register', userData);
    }
    async logout() {
        return this.httpClient.post('/auth/logout', {});
    }
    async refreshToken() {
        return this.httpClient.post('/auth/refresh', {});
    }
}
exports.AuthService = AuthService;
// Servicio de facturas
class InvoiceService {
    httpClient;
    constructor(config) {
        this.httpClient = new HttpClient(config);
    }
    async getInvoices() {
        return this.httpClient.get('/api/facturas');
    }
    async getInvoice(id) {
        return this.httpClient.get(`/api/facturas/${id}`);
    }
    async createInvoice(invoiceData) {
        return this.httpClient.post('/api/facturas', invoiceData);
    }
    async updateInvoice(id, invoiceData) {
        return this.httpClient.put(`/api/facturas/${id}`, invoiceData);
    }
    async deleteInvoice(id) {
        return this.httpClient.delete(`/api/facturas/${id}`);
    }
    async generatePDF(id) {
        const response = await fetch(`/api/facturas/${id}/pdf`);
        return response.blob();
    }
}
exports.InvoiceService = InvoiceService;
// Servicio de clientes
class ClientService {
    httpClient;
    constructor(config) {
        this.httpClient = new HttpClient(config);
    }
    async getClients() {
        return this.httpClient.get('/api/clients');
    }
    async getClient(id) {
        return this.httpClient.get(`/api/clients/${id}`);
    }
    async createClient(clientData) {
        return this.httpClient.post('/api/clients', clientData);
    }
    async updateClient(id, clientData) {
        return this.httpClient.put(`/api/clients/${id}`, clientData);
    }
    async deleteClient(id) {
        return this.httpClient.delete(`/api/clients/${id}`);
    }
}
exports.ClientService = ClientService;
// Servicio de cálculos fiscales
class TaxCalculatorService {
    httpClient;
    constructor(config) {
        this.httpClient = new HttpClient(config);
    }
    async calculateTax(data) {
        return this.httpClient.post('/api/calculate-tax', data);
    }
    async getTaxTypes() {
        return this.httpClient.get('/api/tax-types');
    }
}
exports.TaxCalculatorService = TaxCalculatorService;
// Factory para crear servicios con configuración
class ServiceFactory {
    config;
    constructor(config) {
        this.config = config;
    }
    createAuthService() {
        return new AuthService(this.config);
    }
    createInvoiceService() {
        return new InvoiceService(this.config);
    }
    createClientService() {
        return new ClientService(this.config);
    }
    createTaxCalculatorService() {
        return new TaxCalculatorService(this.config);
    }
}
exports.ServiceFactory = ServiceFactory;
// Configuraciones predeterminadas
exports.DEFAULT_API_CONFIG = {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};
exports.TAX_CALCULATOR_CONFIG = {
    baseUrl: process.env.TAX_CALCULATOR_URL || 'http://localhost:3002',
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};
exports.default = {
    HttpClient,
    AuthService,
    InvoiceService,
    ClientService,
    TaxCalculatorService,
    ServiceFactory,
    DEFAULT_API_CONFIG: exports.DEFAULT_API_CONFIG,
    TAX_CALCULATOR_CONFIG: exports.TAX_CALCULATOR_CONFIG
};
// Placeholder for services
exports.servicesVersion = "1.0.0";
// Digital Signing Services
var certificate_manager_1 = require("./digital-signing/certificate-manager");
Object.defineProperty(exports, "CertificateManager", { enumerable: true, get: function () { return certificate_manager_1.CertificateManager; } });
var xmldsig_signer_1 = require("./digital-signing/xmldsig-signer");
Object.defineProperty(exports, "XmlDSigSigner", { enumerable: true, get: function () { return xmldsig_signer_1.XmlDSigSigner; } });
var timestamp_service_1 = require("./digital-signing/timestamp-service");
Object.defineProperty(exports, "TimestampService", { enumerable: true, get: function () { return timestamp_service_1.TimestampService; } });
const a = 1; // Selecciona la versión correcta
