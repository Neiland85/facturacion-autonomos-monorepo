/**
 * @fileoverview Company type definitions
 * Shared between frontend and backend
 */

export interface Company {
  /** ID opcional del cliente/empresa (usado en frontend para navegación) */
  id?: string;
  name: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface CreateCompanyDTO {
  name: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  taxId?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  email?: string;
  phone?: string;
}
