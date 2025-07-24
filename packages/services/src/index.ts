/**
 * @fileoverview Shared services and API clients for the facturacion-autonomos project
 * @version 1.0.0
 */

<<<<<<< HEAD
import { Client, Invoice, User } from '@facturacion/core';
=======
import type { Client, Invoice, User } from '@facturacion/core';
>>>>>>> origin/develop

// Configuración base para APIs
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers?: Record<string, string>;
}

// Cliente HTTP base
export class HttpClient {
  private readonly config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Servicio de autenticación
export class AuthService {
  private readonly httpClient: HttpClient;

  constructor(config: ApiConfig) {
    this.httpClient = new HttpClient(config);
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    return this.httpClient.post('/auth/login', { email, password });
  }

  async register(
    userData: Partial<User>
  ): Promise<{ token: string; user: User }> {
    return this.httpClient.post('/auth/register', userData);
  }

  async logout(): Promise<void> {
    return this.httpClient.post('/auth/logout', {});
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.httpClient.post('/auth/refresh', {});
  }
}

// Servicio de facturas
export class InvoiceService {
  private readonly httpClient: HttpClient;

  constructor(config: ApiConfig) {
    this.httpClient = new HttpClient(config);
  }

  async getInvoices(): Promise<Invoice[]> {
    return this.httpClient.get('/api/facturas');
  }

  async getInvoice(id: string): Promise<Invoice> {
    return this.httpClient.get(`/api/facturas/${id}`);
  }

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    return this.httpClient.post('/api/facturas', invoiceData);
  }

  async updateInvoice(
    id: string,
    invoiceData: Partial<Invoice>
  ): Promise<Invoice> {
    return this.httpClient.put(`/api/facturas/${id}`, invoiceData);
  }

  async deleteInvoice(id: string): Promise<void> {
    return this.httpClient.delete(`/api/facturas/${id}`);
  }

  async generatePDF(id: string): Promise<Blob> {
    const response = await fetch(`/api/facturas/${id}/pdf`);
    return response.blob();
  }
}

// Servicio de clientes
export class ClientService {
  private readonly httpClient: HttpClient;

  constructor(config: ApiConfig) {
    this.httpClient = new HttpClient(config);
  }

  async getClients(): Promise<Client[]> {
    return this.httpClient.get('/api/clients');
  }

  async getClient(id: string): Promise<Client> {
    return this.httpClient.get(`/api/clients/${id}`);
  }

  async createClient(clientData: Partial<Client>): Promise<Client> {
    return this.httpClient.post('/api/clients', clientData);
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    return this.httpClient.put(`/api/clients/${id}`, clientData);
  }

  async deleteClient(id: string): Promise<void> {
    return this.httpClient.delete(`/api/clients/${id}`);
  }
}

// Servicio de cálculos fiscales
export class TaxCalculatorService {
  private readonly httpClient: HttpClient;

  constructor(config: ApiConfig) {
    this.httpClient = new HttpClient(config);
  }

  async calculateTax(data: {
    income: number;
    expenses: number;
    taxYear: number;
    taxpayerType: 'individual' | 'company';
  }): Promise<{
    grossIncome: number;
    netIncome: number;
    irpf: number;
    vat: number;
    socialSecurity: number;
    totalTax: number;
    netAfterTax: number;
  }> {
    return this.httpClient.post('/api/calculate-tax', data);
  }

  async getTaxTypes(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
    }>
  > {
    return this.httpClient.get('/api/tax-types');
  }
}

// Factory para crear servicios con configuración
export class ServiceFactory {
  private readonly config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  createAuthService(): AuthService {
    return new AuthService(this.config);
  }

  createInvoiceService(): InvoiceService {
    return new InvoiceService(this.config);
  }

  createClientService(): ClientService {
    return new ClientService(this.config);
  }

  createTaxCalculatorService(): TaxCalculatorService {
    return new TaxCalculatorService(this.config);
  }
}

// Configuraciones predeterminadas
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

export const TAX_CALCULATOR_CONFIG: ApiConfig = {
  baseUrl: process.env.TAX_CALCULATOR_URL || 'http://localhost:3002',
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

// Versión del paquete
export const servicesVersion = '1.0.0';

export default {
  HttpClient,
  AuthService,
  InvoiceService,
  ClientService,
  TaxCalculatorService,
  ServiceFactory,
  DEFAULT_API_CONFIG,
  TAX_CALCULATOR_CONFIG,
  servicesVersion,
};
<<<<<<< HEAD
// Placeholder for services
export const servicesVersion = "1.0.0";

const a = 1; // Selecciona la versión correcta
=======
>>>>>>> origin/develop
