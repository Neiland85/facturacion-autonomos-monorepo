/**
 * Barrel export file for all services
 * Centralized import point for all service instances
 * Usage: import { invoiceService, clientService } from '@/services'
 */

// Export all service instances
export { authService } from './auth.service';
export { invoiceService } from './invoice.service';
export { clientService } from './client.service';
export { companyService } from './company.service';
export { subscriptionService } from './subscription.service';
export { dashboardService } from './dashboard.service';

// Export service classes for testing/mocking if needed
export { AuthService } from './auth.service';
export { InvoiceService } from './invoice.service';
export { ClientService } from './client.service';
export { CompanyService } from './company.service';
export { SubscriptionService } from './subscription.service';
export { DashboardService } from './dashboard.service';
