import { apiClient } from '@/lib/api-client';import { apiClient } from '@/lib/api-client';import { apiClient } from '@/lib/api-client';import { apiClient } from '../lib/api-client';/**import { apiClient } from '@/lib/api-client';

import { httpClient } from '../../services/httpClient';

import { ApiError } from '@/lib/api-error';import { httpClient } from '../../services/httpClient';

import type {

  Invoice,import { ApiError } from '@/lib/api-error';import { httpClient } from '../../services/httpClient';

  ApiResponse,

  InvoiceFilters,import type {

  InvoiceStats,

  PaginatedResponse,  Invoice,import { ApiError } from '@/lib/api-error';import { httpClient } from './httpClient';

} from '@/types';

  ApiResponse,

/**

 * Service for managing invoices  InvoiceFilters,import type {

 * Implements singleton pattern for consistent state management

 */  InvoiceStats,

export class InvoiceService {

  private static instance: InvoiceService;  PaginatedResponse,  Invoice,import { ApiError } from '../lib/api-error'; * @fileoverview Servicio para interactuar con la API de facturas.import type {

  private readonly baseEndpoint = '/api/invoices';

} from '@/types';

  private constructor() {}

  ApiResponse,

  /**

   * Get or create the singleton instance/**

   */

  static getInstance(): InvoiceService { * Service for managing invoices} from '@/types';import { Invoice, InvoiceFilters } from '@facturacion/types';

    if (!InvoiceService.instance) {

      InvoiceService.instance = new InvoiceService(); * Implements singleton pattern for consistent state management

    }

    return InvoiceService.instance; */

  }

export class InvoiceService {

  /**

   * Get all invoices with optional filtering and pagination  private static instance: InvoiceService;/** */  ApiResponse,

   * @param filters - Optional filters for invoices

   * @returns Promise containing paginated invoices  private readonly baseEndpoint = '/api/invoices';

   */

  async getInvoices( * Interface for invoice filtering parameters

    filters?: InvoiceFilters

  ): Promise<PaginatedResponse<Invoice>> {  private constructor() {}

    const params = new URLSearchParams();

 */export interface ApiResponse<T> {

    if (filters?.status) params.append('status', filters.status);

    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);  /**

    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    if (filters?.series) params.append('series', filters.series);   * Get or create the singleton instanceexport interface InvoiceFilters {

    if (filters?.search) params.append('search', filters.search);

    if (filters?.page) params.append('page', filters.page.toString());   */

    if (filters?.limit) params.append('limit', filters.limit.toString());

  static getInstance(): InvoiceService {  page?: number;  success: boolean;  Invoice,

    const queryString = params.toString();

    const endpoint = queryString    if (!InvoiceService.instance) {

      ? `${this.baseEndpoint}?${queryString}`

      : this.baseEndpoint;      InvoiceService.instance = new InvoiceService();  limit?: number;



    const response = await apiClient.get<ApiResponse<PaginatedResponse<Invoice>>>(    }

      endpoint

    );    return InvoiceService.instance;  status?: string;  data: T;



    return response.data;  }

  }

  search?: string;

  /**

   * Get a single invoice by ID  /**

   * @param id - Invoice ID

   * @returns Promise containing the invoice   * Get all invoices with optional filtering and pagination  series?: string;  message?: string;import { httpClient } from '../../services/httpClient';  InvoiceFilters,

   */

  async getInvoice(id: string): Promise<Invoice> {   * @param filters - Optional filters for invoices

    const response = await apiClient.get<ApiResponse<Invoice>>(

      `${this.baseEndpoint}/${id}`   * @returns Promise containing paginated invoices  dateFrom?: string;

    );

    return response.data;   */

  }

  async getInvoices(  dateTo?: string;}

  /**

   * Create a new invoice    filters?: InvoiceFilters

   * @param invoiceData - Invoice data to create

   * @returns Promise containing the created invoice  ): Promise<PaginatedResponse<Invoice>> {}

   */

  async createInvoice(    const params = new URLSearchParams();

    invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>

  ): Promise<Invoice> {import { ApiError } from '@/lib/api-error';  InvoiceStats,

    const response = await apiClient.post<ApiResponse<Invoice>>(

      this.baseEndpoint,    if (filters?.status) params.append('status', filters.status);

      invoiceData

    );    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);/**

    return response.data;

  }    if (filters?.dateTo) params.append('dateTo', filters.dateTo);



  /**    if (filters?.series) params.append('series', filters.series); * Interface for paginated responsesexport interface PaginatedResponse<T> {

   * Update an existing invoice

   * @param id - Invoice ID    if (filters?.search) params.append('search', filters.search);

   * @param updates - Partial invoice data to update

   * @returns Promise containing the updated invoice    if (filters?.page) params.append('page', filters.page.toString()); */

   */

  async updateInvoice(    if (filters?.limit) params.append('limit', filters.limit.toString());

    id: string,

    updates: Partial<Invoice>export interface PaginatedResponse<T> {  items: T[];import { Invoice, InvoiceFilters } from '@facturacion/types';  PaginatedResponse,

  ): Promise<Invoice> {

    const response = await apiClient.put<ApiResponse<Invoice>>(    const queryString = params.toString();

      `${this.baseEndpoint}/${id}`,

      updates    const endpoint = queryString  items: T[];

    );

    return response.data;      ? `${this.baseEndpoint}?${queryString}`

  }

      : this.baseEndpoint;  total: number;  total: number;

  /**

   * Delete an invoice

   * @param id - Invoice ID

   * @returns Promise that resolves when deletion is complete    const response = await apiClient.get<ApiResponse<PaginatedResponse<Invoice>>>(  page: number;

   */

  async deleteInvoice(id: string): Promise<void> {      endpoint

    await apiClient.delete<ApiResponse<void>>(

      `${this.baseEndpoint}/${id}`    );  limit: number;  page: number;} from '@/types';

    );

  }



  /**    return response.data;  totalPages: number;

   * Download the signed XML file for an invoice

   * @param id - Invoice ID  }

   * @throws {ApiError} If the download fails

   */}  limit: number;

  async downloadSignedXml(id: string): Promise<void> {

    try {  /**

      const response = await httpClient.get(

        `${this.baseEndpoint}/${id}/xml`,   * Get a single invoice by ID

        {

          responseType: 'blob',   * @param id - Invoice ID

        }

      );   * @returns Promise containing the invoice/**  totalPages: number;export const invoiceService = {



      // Get filename from Content-Disposition header   */

      const disposition = response.headers?.['content-disposition'];

      let filename = `factura-${id}.xml`; // Fallback filename  async getInvoice(id: string): Promise<Invoice> { * Interface for invoice statistics



      if (disposition?.includes('attachment')) {    const response = await apiClient.get<ApiResponse<Invoice>>(

        const filenameMatch = /filename="([^"]+)"/.exec(disposition);

        if (filenameMatch && filenameMatch[1]) {      `${this.baseEndpoint}/${id}` */}

          filename = filenameMatch[1];

        }    );

      }

    return response.data;export interface InvoiceStats {

      // Create download link

      const blob = response.data;  }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');  total: number;  /**export class InvoiceService {

      link.style.display = 'none';

      link.href = url;  /**

      link.download = filename;

      document.body.appendChild(link);   * Create a new invoice  paid: number;

      link.click();

   * @param invoiceData - Invoice data to create

      // Cleanup

      window.URL.revokeObjectURL(url);   * @returns Promise containing the created invoice  pending: number;export interface InvoiceStats {

      link.remove();

    } catch (error) {   */

      console.error(`Error downloading XML for invoice ${id}:`, error);

  async createInvoice(  overdue: number;

      if (error instanceof ApiError) {

        throw error;    invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>

      }

  ): Promise<Invoice> {  totalAmount: number;  total: number;   * Descarga el archivo XML firmado de una factura.  private readonly baseEndpoint = '/api/invoices';

      throw new ApiError(

        'No se pudo descargar el archivo XML.',    const response = await apiClient.post<ApiResponse<Invoice>>(

        500

      );      this.baseEndpoint,  paidAmount: number;

    }

  }      invoiceData



  /**    );  pendingAmount: number;  paid: number;

   * Get invoice statistics

   * @returns Promise containing invoice statistics    return response.data;

   */

  async getStatistics(): Promise<InvoiceStats> {  }}

    const response = await apiClient.get<ApiResponse<InvoiceStats>>(

      `${this.baseEndpoint}/stats`

    );

    return response.data;  /**  pending: number;   * @param invoiceId - El ID de la factura a descargar.

  }

   * Update an existing invoice

  /**

   * Generate PDF for an invoice   * @param id - Invoice ID/**

   * @param id - Invoice ID

   * @returns Promise containing PDF blob   * @param updates - Partial invoice data to update

   */

  async generatePDF(id: string): Promise<Blob> {   * @returns Promise containing the updated invoice * Service for managing invoices  overdue: number;

    try {

      const response = await httpClient.get(   */

        `${this.baseEndpoint}/${id}/pdf`,

        {  async updateInvoice( * Implements singleton pattern for consistent state management

          responseType: 'blob',

        }    id: string,

      );

      return response.data;    updates: Partial<Invoice> */  totalAmount: number;   * @throws {ApiError} Si la descarga falla.  /**

    } catch (error) {

      console.error(`Error generating PDF for invoice ${id}:`, error);  ): Promise<Invoice> {

      if (error instanceof ApiError) {

        throw error;    const response = await apiClient.put<ApiResponse<Invoice>>(export class InvoiceService {

      }

      throw new ApiError('No se pudo generar el PDF.', 500);      `${this.baseEndpoint}/${id}`,

    }

  }      updates  private static instance: InvoiceService;  paidAmount: number;



  /**    );

   * Download PDF for an invoice

   * @param id - Invoice ID    return response.data;  private readonly baseEndpoint = '/api/invoices';

   * @param filename - Optional custom filename

   * @returns Promise that resolves when download is complete  }

   */

  async downloadPDF(id: string, filename?: string): Promise<void> {  pendingAmount: number;   */   * Get all invoices with optional filtering

    try {

      const blob = await this.generatePDF(id);  /**

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');   * Delete an invoice  private constructor() {}

      link.href = url;

      link.download = filename ?? `factura-${id}.pdf`;   * @param id - Invoice ID

      document.body.appendChild(link);

      link.click();   * @returns Promise that resolves when deletion is complete}

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);   */

    } catch (error) {

      console.error(`Error downloading PDF for invoice ${id}:`, error);  async deleteInvoice(id: string): Promise<void> {  /**

      throw error;

    }    await apiClient.delete<ApiResponse<void>>(

  }

}      `${this.baseEndpoint}/${id}`   * Get or create the singleton instance  async downloadSignedXml(invoiceId: string): Promise<void> {   */



/**    );

 * Singleton instance of InvoiceService

 */  }   */

export const invoiceService = InvoiceService.getInstance();



  /**  static getInstance(): InvoiceService {class InvoiceService {

   * Download the signed XML file for an invoice

   * @param id - Invoice ID    if (!InvoiceService.instance) {

   * @throws {ApiError} If the download fails

   */      InvoiceService.instance = new InvoiceService();  private readonly baseEndpoint = '/api/invoices';    try {  async getInvoices(

  async downloadSignedXml(id: string): Promise<void> {

    try {    }

      const response = await httpClient.get(

        `${this.baseEndpoint}/${id}/xml`,    return InvoiceService.instance;

        {

          responseType: 'blob',  }

        }

      );  /**      const response = await httpClient.get(`/invoices/${invoiceId}/xml`, {    filters: InvoiceFilters = {}



      // Get filename from Content-Disposition header  /**

      const disposition = response.headers?.['content-disposition'];

      let filename = `factura-${id}.xml`; // Fallback filename   * Get all invoices with optional filtering and pagination   * Get all invoices with optional filtering



      if (disposition?.includes('attachment')) {   * @param filters - Optional filters for invoices

        const filenameMatch = /filename="([^"]+)"/.exec(disposition);

        if (filenameMatch && filenameMatch[1]) {   * @returns Promise containing paginated invoices   */        responseType: 'blob'  ): Promise<PaginatedResponse<Invoice> & { invoices: Invoice[] }> {

          filename = filenameMatch[1];

        }   */

      }

  async getInvoices(  async getInvoices(

      // Create download link

      const blob = response.data;    filters?: InvoiceFilters

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');  ): Promise<PaginatedResponse<Invoice>> {    filters: InvoiceFilters = {}      });    const params = new URLSearchParams();

      link.style.display = 'none';

      link.href = url;    const params = new URLSearchParams();

      link.download = filename;

      document.body.appendChild(link);  ): Promise<PaginatedResponse<Invoice> & { invoices: Invoice[] }> {

      link.click();

    if (filters?.status) params.append('status', filters.status);

      // Cleanup

      window.URL.revokeObjectURL(url);    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);    const params = new URLSearchParams();

      link.remove();

    } catch (error) {    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      console.error(`Error downloading XML for invoice ${id}:`, error);

    if (filters?.series) params.append('series', filters.series);

      if (error instanceof ApiError) {

        throw error;    if (filters?.search) params.append('search', filters.search);

      }

    if (filters?.page) params.append('page', filters.page.toString());    if (filters.status) params.append('status', filters.status);      // Obtener el nombre del archivo del header Content-Disposition    if (filters.status) params.append('status', filters.status);

      throw new ApiError(

        'No se pudo descargar el archivo XML.',    if (filters?.limit) params.append('limit', filters.limit.toString());

        500

      );    if (filters.dateFrom)

    }

  }    const queryString = params.toString();



  /**    const endpoint = queryString      params.append('dateFrom', filters.dateFrom.toISOString());      const disposition = response.headers?.['content-disposition'];    if (filters.dateFrom)

   * Get invoice statistics

   * @returns Promise containing invoice statistics      ? `${this.baseEndpoint}?${queryString}`

   */

  async getStatistics(): Promise<InvoiceStats> {      : this.baseEndpoint;    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());

    const response = await apiClient.get<ApiResponse<InvoiceStats>>(

      `${this.baseEndpoint}/stats`

    );

    return response.data;    const response = await apiClient.get<ApiResponse<PaginatedResponse<Invoice>>>(    if (filters.series) params.append('series', filters.series);      let filename = `factura-${invoiceId}.xml`; // Nombre de fallback      params.append('dateFrom', filters.dateFrom.toISOString());

  }

      endpoint

  /**

   * Generate PDF for an invoice    );    if (filters.search) params.append('search', filters.search);

   * @param id - Invoice ID

   * @returns Promise containing PDF blob

   */

  async generatePDF(id: string): Promise<Blob> {    return response.data;    if (filters.page) params.append('page', filters.page.toString());      if (disposition?.includes('attachment')) {    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());

    try {

      const response = await httpClient.get(  }

        `${this.baseEndpoint}/${id}/pdf`,

        {    if (filters.limit) params.append('limit', filters.limit.toString());

          responseType: 'blob',

        }  /**

      );

      return response.data;   * Get a single invoice by ID        const filenameMatch = /filename="([^"]+)"/.exec(disposition);    if (filters.series) params.append('series', filters.series);

    } catch (error) {

      console.error(`Error generating PDF for invoice ${id}:`, error);   * @param id - Invoice ID

      if (error instanceof ApiError) {

        throw error;   * @returns Promise containing the invoice    const queryString = params.toString();

      }

      throw new ApiError('No se pudo generar el PDF.', 500);   */

    }

  }  async getInvoice(id: string): Promise<Invoice> {    const endpoint = queryString        if (filenameMatch && filenameMatch[1]) {    if (filters.search) params.append('search', filters.search);



  /**    const response = await apiClient.get<ApiResponse<Invoice>>(

   * Download PDF for an invoice

   * @param id - Invoice ID      `${this.baseEndpoint}/${id}`      ? `${this.baseEndpoint}?${queryString}`

   * @param filename - Optional custom filename

   * @returns Promise that resolves when download is complete    );

   */

  async downloadPDF(id: string, filename?: string): Promise<void> {    return response.data;      : this.baseEndpoint;          filename = filenameMatch[1];    if (filters.page) params.append('page', filters.page.toString());

    try {

      const blob = await this.generatePDF(id);  }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;

      link.download = filename ?? `factura-${id}.pdf`;  /**

      document.body.appendChild(link);

      link.click();   * Create a new invoice    return apiClient.get<PaginatedResponse<Invoice> & { invoices: Invoice[] }>(        }    if (filters.limit) params.append('limit', filters.limit.toString());

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);   * @param invoiceData - Invoice data to create

    } catch (error) {

      console.error(`Error downloading PDF for invoice ${id}:`, error);   * @returns Promise containing the created invoice      endpoint

      throw error;

    }   */

  }

}  async createInvoice(    );      }



/**    invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>

 * Singleton instance of InvoiceService

 */  ): Promise<Invoice> {  }

export const invoiceService = InvoiceService.getInstance();

    const response = await apiClient.post<ApiResponse<Invoice>>(

      this.baseEndpoint,    const queryString = params.toString();

      invoiceData

    );  /**

    return response.data;

  }   * Get a single invoice by ID      const blob = response.data;    const endpoint = queryString



  /**   */

   * Update an existing invoice

   * @param id - Invoice ID  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {      const url = window.URL.createObjectURL(blob);      ? `${this.baseEndpoint}?${queryString}`

   * @param updates - Partial invoice data to update

   * @returns Promise containing the updated invoice    return apiClient.get<ApiResponse<Invoice>>(`${this.baseEndpoint}/${id}`);

   */

  async updateInvoice(  }      const a = document.createElement('a');      : this.baseEndpoint;

    id: string,

    updates: Partial<Invoice>

  ): Promise<Invoice> {

    const response = await apiClient.put<ApiResponse<Invoice>>(  /**      a.style.display = 'none';

      `${this.baseEndpoint}/${id}`,

      updates   * Create a new invoice

    );

    return response.data;   */      a.href = url;    return apiClient.get<PaginatedResponse<Invoice> & { invoices: Invoice[] }>(

  }

  async createInvoice(invoiceData: Partial<Invoice>): Promise<ApiResponse<Invoice>> {

  /**

   * Delete an invoice    return apiClient.post<ApiResponse<Invoice>>(this.baseEndpoint, invoiceData);      a.download = filename;      endpoint

   * @param id - Invoice ID

   * @returns Promise that resolves when deletion is complete  }

   */

  async deleteInvoice(id: string): Promise<void> {      document.body.appendChild(a);    );

    await apiClient.delete<ApiResponse<void>>(

      `${this.baseEndpoint}/${id}`  /**

    );

  }   * Update an existing invoice      a.click();  }



  /**   */

   * Download the signed XML file for an invoice

   * @param id - Invoice ID  async updateInvoice(      window.URL.revokeObjectURL(url);

   * @throws {ApiError} If the download fails

   */    id: string,

  async downloadSignedXml(id: string): Promise<void> {

    try {    invoiceData: Partial<Invoice>      a.remove();  /**

      const response = await httpClient.get(

        `${this.baseEndpoint}/${id}/xml`,  ): Promise<ApiResponse<Invoice>> {

        {

          responseType: 'blob',    return apiClient.put<ApiResponse<Invoice>>(    } catch (error) {   * Get a single invoice by ID

        }

      );      `${this.baseEndpoint}/${id}`,



      // Get filename from Content-Disposition header      invoiceData      console.error('Error al descargar el archivo XML:', error);   */

      const disposition = response.headers?.['content-disposition'];

      let filename = `factura-${id}.xml`; // Fallback filename    );



      if (disposition?.includes('attachment')) {  }      if (error instanceof ApiError) {  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {

        const filenameMatch = /filename="([^"]+)"/.exec(disposition);

        if (filenameMatch && filenameMatch[1]) {

          filename = filenameMatch[1];

        }  /**        throw error;    return apiClient.get<ApiResponse<Invoice>>(`${this.baseEndpoint}/${id}`);

      }

   * Delete an invoice

      // Create download link

      const blob = response.data;   */      }  }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');  async deleteInvoice(id: string): Promise<ApiResponse<void>> {

      link.style.display = 'none';

      link.href = url;    return apiClient.delete<ApiResponse<void>>(`${this.baseEndpoint}/${id}`);      throw new ApiError('No se pudo descargar el archivo XML.', 500);

      link.download = filename;

      document.body.appendChild(link);  }

      link.click();

    }  /**

      // Cleanup

      window.URL.revokeObjectURL(url);  /**

      link.remove();

    } catch (error) {   * Get invoice statistics  },   * Create a new invoice

      console.error(`Error downloading XML for invoice ${id}:`, error);

   */

      if (error instanceof ApiError) {

        throw error;  async getStats(): Promise<ApiResponse<InvoiceStats>> {   */

      }

    return apiClient.get<ApiResponse<InvoiceStats>>(`${this.baseEndpoint}/stats`);

      throw new ApiError(

        'No se pudo descargar el archivo XML.',  }  /**  async createInvoice(

        500

      );

    }

  }  /**   * Obtiene lista de facturas con filtros opcionales    invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>



  /**   * Descarga el archivo XML firmado de una factura usando httpClient con responseType blob

   * Get invoice statistics

   * @returns Promise containing invoice statistics   * @param id - El ID de la factura a descargar   */  ): Promise<ApiResponse<Invoice>> {

   */

  async getStatistics(): Promise<InvoiceStats> {   * @throws {ApiError} Si la descarga falla

    const response = await apiClient.get<ApiResponse<InvoiceStats>>(

      `${this.baseEndpoint}/stats`   */  async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {    return apiClient.post<ApiResponse<Invoice>>(this.baseEndpoint, invoice);

    );

    return response.data;  async downloadSignedXml(id: string): Promise<void> {

  }

}    try {    try {  }



/**      const response = await httpClient.get(`${this.baseEndpoint}/${id}/xml/signed`, {

 * Singleton instance of InvoiceService

 */        responseType: 'blob'      const params = new URLSearchParams();

export const invoiceService = InvoiceService.getInstance();

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
