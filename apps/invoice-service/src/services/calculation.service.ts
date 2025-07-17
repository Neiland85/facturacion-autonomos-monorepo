import { Invoice, LineItem, TaxTypeValue } from '../models/invoice.model';

// Tax rates configuration
const TAX_RATES: Record<TaxTypeValue, number> = {
  'iva_21': 21,
  'iva_10': 10,
  'iva_4': 4,
  'iva_0': 0,
  'exento': 0
};

class CalculationService {
  /**
   * Calculate totals for a single line item
   */
  calculateLineItemTotals(item: LineItem): LineItem {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    // Get tax rate
    const taxRate = item.taxRate || TAX_RATES[item.taxType || 'iva_21'];
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
    
    // Calculate retention if applicable
    const retentionAmount = (subtotalAfterDiscount * (item.retentionRate || 0)) / 100;
    
    const total = subtotalAfterDiscount + taxAmount - retentionAmount;

    return {
      ...item,
      taxRate,
      subtotal: subtotalAfterDiscount,
      taxAmount,
      retentionAmount,
      total: Math.round(total * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Calculate totals for an entire invoice
   */
  calculateInvoiceTotals(invoice: Invoice): Invoice {
    // Calculate line item totals
    const calculatedItems = invoice.items.map((item: LineItem) => this.calculateLineItemTotals(item));
    
    // Calculate invoice totals
    const subtotal = calculatedItems.reduce((sum: number, item: LineItem) => sum + (item.subtotal || 0), 0);
    const totalTax = calculatedItems.reduce((sum: number, item: LineItem) => sum + (item.taxAmount || 0), 0);
    const totalRetention = calculatedItems.reduce((sum: number, item: LineItem) => sum + (item.retentionAmount || 0), 0);
    const total = subtotal + totalTax - totalRetention;

    return {
      ...invoice,
      items: calculatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalRetention: Math.round(totalRetention * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Calculate tax breakdown by type
   */
  calculateTaxBreakdown(invoice: Invoice): Record<string, { rate: number, base: number, amount: number }> {
    const breakdown: Record<string, { rate: number, base: number, amount: number }> = {};

    invoice.items.forEach((item: LineItem) => {
      const taxType = item.taxType || 'iva_21';
      const taxRate = item.taxRate || TAX_RATES[taxType];
      const base = item.subtotal || 0;
      const amount = item.taxAmount || 0;

      if (!breakdown[taxType]) {
        breakdown[taxType] = { rate: taxRate, base: 0, amount: 0 };
      }

      breakdown[taxType].base += base;
      breakdown[taxType].amount += amount;
    });

    // Round values
    Object.keys(breakdown).forEach((key: string) => {
      if (breakdown[key]) {
        breakdown[key].base = Math.round(breakdown[key].base * 100) / 100;
        breakdown[key].amount = Math.round(breakdown[key].amount * 100) / 100;
      }
    });

    return breakdown;
  }

  /**
   * Validate invoice calculations
   */
  validateCalculations(invoice: Invoice): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    // Recalculate and compare
    const recalculated = this.calculateInvoiceTotals(invoice);
    
    const tolerance = 0.01; // 1 cent tolerance for rounding differences
    
    if (Math.abs((invoice.subtotal || 0) - (recalculated.subtotal || 0)) > tolerance) {
      errors.push('Subtotal calculation mismatch');
    }
    
    if (Math.abs((invoice.totalTax || 0) - (recalculated.totalTax || 0)) > tolerance) {
      errors.push('Tax calculation mismatch');
    }
    
    if (Math.abs((invoice.total || 0) - (recalculated.total || 0)) > tolerance) {
      errors.push('Total calculation mismatch');
    }

    // Validate individual line items
    invoice.items.forEach((item: LineItem, index: number) => {
      if (item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be positive`);
      }
      
      if (item.unitPrice < 0) {
        errors.push(`Line item ${index + 1}: Unit price cannot be negative`);
      }
      
      if ((item.discount || 0) < 0 || (item.discount || 0) > 100) {
        errors.push(`Line item ${index + 1}: Discount must be between 0 and 100`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Calculate payment due date
   */
  calculateDueDate(invoiceDate: Date, paymentTermsDays: number = 30): Date {
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);
    return dueDate;
  }

  /**
   * Check if invoice is overdue
   */
  isOverdue(invoice: Invoice): boolean {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return false;
    }
    
    if (!invoice.dueDate) {
      return false;
    }

    return new Date() > new Date(invoice.dueDate);
  }
}

export const calculationService = new CalculationService();
