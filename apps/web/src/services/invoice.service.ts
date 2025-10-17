import { apiClient } from '../lib/api-client';/**import { apiClient } from '@/lib/api-client';

import { httpClient } from './httpClient';

import { ApiError } from '../lib/api-error'; * @fileoverview Servicio para interactuar con la API de facturas.import type {

import { Invoice, InvoiceFilters } from '@facturacion/types';

 */  ApiResponse,

export interface ApiResponse<T> {

  success: boolean;  Invoice,

  data: T;

  message?: string;import { httpClient } from '../../services/httpClient';  InvoiceFilters,

}

import { ApiError } from '@/lib/api-error';  InvoiceStats,

export interface PaginatedResponse<T> {

  items: T[];import { Invoice, InvoiceFilters } from '@facturacion/types';  PaginatedResponse,

  total: number;

  page: number;} from '@/types';

  limit: number;

  totalPages: number;export const invoiceService = {

}

  /**export class InvoiceService {

export interface InvoiceStats {

  total: number;   * Descarga el archivo XML firmado de una factura.  private readonly baseEndpoint = '/api/invoices';

  paid: number;

  pending: number;   * @param invoiceId - El ID de la factura a descargar.

  overdue: number;

  totalAmount: number;   * @throws {ApiError} Si la descarga falla.  /**

  paidAmount: number;

  pendingAmount: number;   */   * Get all invoices with optional filtering

}

  async downloadSignedXml(invoiceId: string): Promise<void> {   */

class InvoiceService {

  private readonly baseEndpoint = '/api/invoices';    try {  async getInvoices(



  /**      const response = await httpClient.get(`/invoices/${invoiceId}/xml`, {    filters: InvoiceFilters = {}

   * Get all invoices with optional filtering

   */        responseType: 'blob'  ): Promise<PaginatedResponse<Invoice> & { invoices: Invoice[] }> {

  async getInvoices(

    filters: InvoiceFilters = {}      });    const params = new URLSearchParams();

  ): Promise<PaginatedResponse<Invoice> & { invoices: Invoice[] }> {

    const params = new URLSearchParams();



    if (filters.status) params.append('status', filters.status);      // Obtener el nombre del archivo del header Content-Disposition    if (filters.status) params.append('status', filters.status);

    if (filters.dateFrom)

      params.append('dateFrom', filters.dateFrom.toISOString());      const disposition = response.headers?.['content-disposition'];    if (filters.dateFrom)

    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());

    if (filters.series) params.append('series', filters.series);      let filename = `factura-${invoiceId}.xml`; // Nombre de fallback      params.append('dateFrom', filters.dateFrom.toISOString());

    if (filters.search) params.append('search', filters.search);

    if (filters.page) params.append('page', filters.page.toString());      if (disposition?.includes('attachment')) {    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());

    if (filters.limit) params.append('limit', filters.limit.toString());

        const filenameMatch = /filename="([^"]+)"/.exec(disposition);    if (filters.series) params.append('series', filters.series);

    const queryString = params.toString();

    const endpoint = queryString        if (filenameMatch && filenameMatch[1]) {    if (filters.search) params.append('search', filters.search);

      ? `${this.baseEndpoint}?${queryString}`

      : this.baseEndpoint;          filename = filenameMatch[1];    if (filters.page) params.append('page', filters.page.toString());



    return apiClient.get<PaginatedResponse<Invoice> & { invoices: Invoice[] }>(        }    if (filters.limit) params.append('limit', filters.limit.toString());

      endpoint

    );      }

  }

    const queryString = params.toString();

  /**

   * Get a single invoice by ID      const blob = response.data;    const endpoint = queryString

   */

  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {      const url = window.URL.createObjectURL(blob);      ? `${this.baseEndpoint}?${queryString}`

    return apiClient.get<ApiResponse<Invoice>>(`${this.baseEndpoint}/${id}`);

  }      const a = document.createElement('a');      : this.baseEndpoint;



  /**      a.style.display = 'none';

   * Create a new invoice

   */      a.href = url;    return apiClient.get<PaginatedResponse<Invoice> & { invoices: Invoice[] }>(

  async createInvoice(invoiceData: Partial<Invoice>): Promise<ApiResponse<Invoice>> {

    return apiClient.post<ApiResponse<Invoice>>(this.baseEndpoint, invoiceData);      a.download = filename;      endpoint

  }

      document.body.appendChild(a);    );

  /**

   * Update an existing invoice      a.click();  }

   */

  async updateInvoice(      window.URL.revokeObjectURL(url);

    id: string,

    invoiceData: Partial<Invoice>      a.remove();  /**

  ): Promise<ApiResponse<Invoice>> {

    return apiClient.put<ApiResponse<Invoice>>(    } catch (error) {   * Get a single invoice by ID

      `${this.baseEndpoint}/${id}`,

      invoiceData      console.error('Error al descargar el archivo XML:', error);   */

    );

  }      if (error instanceof ApiError) {  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {



  /**        throw error;    return apiClient.get<ApiResponse<Invoice>>(`${this.baseEndpoint}/${id}`);

   * Delete an invoice

   */      }  }

  async deleteInvoice(id: string): Promise<ApiResponse<void>> {

    return apiClient.delete<ApiResponse<void>>(`${this.baseEndpoint}/${id}`);      throw new ApiError('No se pudo descargar el archivo XML.', 500);

  }

    }  /**

  /**

   * Get invoice statistics  },   * Create a new invoice

   */

  async getStats(): Promise<ApiResponse<InvoiceStats>> {   */

    return apiClient.get<ApiResponse<InvoiceStats>>(`${this.baseEndpoint}/stats`);

  }  /**  async createInvoice(



  /**   * Obtiene lista de facturas con filtros opcionales    invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>

   * Descarga el archivo XML firmado de una factura usando httpClient con responseType blob

   * @param id - El ID de la factura a descargar   */  ): Promise<ApiResponse<Invoice>> {

   * @throws {ApiError} Si la descarga falla

   */  async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {    return apiClient.post<ApiResponse<Invoice>>(this.baseEndpoint, invoice);

  async downloadSignedXml(id: string): Promise<void> {

    try {    try {  }

      const response = await httpClient.get(`${this.baseEndpoint}/${id}/xml/signed`, {

        responseType: 'blob'      const params = new URLSearchParams();

      });

      if (filters?.status) params.append('status', filters.status);  /**

      // Obtener el nombre del archivo del header Content-Disposition

      const disposition = response.headers?.['content-disposition'];      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);   * Update an existing invoice

      let filename = `factura-${id}.xml`; // Nombre de fallback

            if (filters?.dateTo) params.append('dateTo', filters.dateTo);   */

      if (disposition?.includes('attachment')) {

        const filenameMatch = /filename="([^"]+)"/.exec(disposition);        async updateInvoice(

        if (filenameMatch && filenameMatch[1]) {

          filename = filenameMatch[1];      const queryString = params.toString();    id: string,

        }

      }      const url = queryString ? `/invoices?${queryString}` : '/invoices';    updates: Partial<Invoice>



      const blob = response.data;        ): Promise<ApiResponse<Invoice>> {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');      const response = await httpClient.get<{ data: Invoice[] }>(url);    return apiClient.put<ApiResponse<Invoice>>(

      a.style.display = 'none';

      a.href = url;      return response.data;      `${this.baseEndpoint}/${id}`,

      a.download = filename;

      document.body.appendChild(a);    } catch (error) {      updates

      a.click();

      window.URL.revokeObjectURL(url);      if (error instanceof ApiError) {    );

      a.remove();

    } catch (error) {        throw error;  }

      console.error('Error al descargar el archivo XML:', error);

      if (error instanceof ApiError) {      }

        throw error;

      }      throw new ApiError('Error al obtener facturas', 500);  /**

      throw new ApiError('No se pudo descargar el archivo XML.', 500);

    }    }   * Delete an invoice

  }

}  },   */



export const invoiceService = new InvoiceService();  async deleteInvoice(id: string): Promise<ApiResponse<boolean>> {

  /**    return apiClient.delete<ApiResponse<boolean>>(`${this.baseEndpoint}/${id}`);

   * Obtiene una factura por ID  }

   */

  async getInvoiceById(invoiceId: string): Promise<Invoice> {  /**

    try {   * Duplicate an invoice

      const response = await httpClient.get<{ data: Invoice }>(`/invoices/${invoiceId}`);   */

      return response.data;  async duplicateInvoice(id: string): Promise<ApiResponse<Invoice>> {

    } catch (error) {    return apiClient.post<ApiResponse<Invoice>>(

      if (error instanceof ApiError) {      `${this.baseEndpoint}/${id}/duplicate`

        throw error;    );

      }  }

      throw new ApiError('Error al obtener factura', 500);

    }  /**

  },   * Generate PDF for an invoice

   */

  /**  async generatePDF(id: string): Promise<Blob> {

   * Crea una nueva factura    const response = await fetch(

   */      `${apiClient['baseURL']}${this.baseEndpoint}/${id}/pdf`,

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {      {

    try {        headers: {

      const response = await httpClient.post<{ data: Invoice }>('/invoices', invoiceData);          Authorization: apiClient['token']

      return response.data;            ? `Bearer ${apiClient['token']}`

    } catch (error) {            : '',

      if (error instanceof ApiError) {        },

        throw error;      }

      }    );

      throw new ApiError('Error al crear factura', 500);

    }    if (!response.ok) {

  }      throw new Error('Failed to generate PDF');

};    }

    return response.blob();
  }

  /**
   * Get invoice statistics
   */
  async getStatistics(): Promise<ApiResponse<InvoiceStats>> {
    return apiClient.get<ApiResponse<InvoiceStats>>(
      `${this.baseEndpoint}/statistics`
    );
  }

  /**
   * Download PDF for an invoice
   */
  async downloadPDF(id: string, filename?: string): Promise<void> {
    try {
      const blob = await this.generatePDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename ?? `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to download PDF:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
