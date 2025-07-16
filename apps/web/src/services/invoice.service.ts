import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  Invoice,
  InvoiceFilters,
  InvoiceStats,
  PaginatedResponse,
} from '@/types';

export class InvoiceService {
  private baseEndpoint = '/api/invoices';

  /**
   * Get all invoices with optional filtering
   */
  async getInvoices(
    filters: InvoiceFilters = {}
  ): Promise<PaginatedResponse<Invoice> & { invoices: Invoice[] }> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom)
      params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    if (filters.series) params.append('series', filters.series);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `${this.baseEndpoint}?${queryString}`
      : this.baseEndpoint;

    return apiClient.get<PaginatedResponse<Invoice> & { invoices: Invoice[] }>(
      endpoint
    );
  }

  /**
   * Get a single invoice by ID
   */
  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<ApiResponse<Invoice>>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Create a new invoice
   */
  async createInvoice(
    invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Invoice>> {
    return apiClient.post<ApiResponse<Invoice>>(this.baseEndpoint, invoice);
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(
    id: string,
    updates: Partial<Invoice>
  ): Promise<ApiResponse<Invoice>> {
    return apiClient.put<ApiResponse<Invoice>>(
      `${this.baseEndpoint}/${id}`,
      updates
    );
  }

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<ApiResponse<boolean>>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Duplicate an invoice
   */
  async duplicateInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.post<ApiResponse<Invoice>>(
      `${this.baseEndpoint}/${id}/duplicate`
    );
  }

  /**
   * Generate PDF for an invoice
   */
  async generatePDF(id: string): Promise<Blob> {
    const response = await fetch(
      `${apiClient['baseURL']}${this.baseEndpoint}/${id}/pdf`,
      {
        headers: {
          Authorization: apiClient['token']
            ? `Bearer ${apiClient['token']}`
            : '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

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
      link.download = filename || `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
