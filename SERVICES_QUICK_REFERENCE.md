# 🚀 Guía Rápida - Capa de Servicios Consolidada

## 📚 Importaciones Correctas

### Servicios
```typescript
// ✅ Importar servicios individuales
import { invoiceService } from '@/services/invoice.service';
import { authService } from '@/services/auth.service';
import { clientService } from '@/services/client.service';
import { companyService } from '@/services/company.service';
import { subscriptionService } from '@/services/subscription.service';
import { dashboardService } from '@/services/dashboard.service';

// ✅ Importar múltiples servicios usando barrel export
import { invoiceService, authService, clientService } from '@/services';

// ❌ NO USAR (antiguo patrón, deprecado)
import { createInvoice } from '../services/apiService';
```

### Tipos
```typescript
// ✅ Todos los tipos desde @/types
import { 
  Invoice, 
  InvoiceFilters, 
  PaginatedResponse,
  DashboardData,
  ApiResponse 
} from '@/types';

// ✅ Tipos de suscripción
import { 
  Subscription, 
  SubscriptionPlan 
} from '@/types';
```

### API Client
```typescript
// ✅ Para caso especial de blob/descarga
import { apiClient } from '@/lib/api-client';

// ✅ httpClient para requests raw (raramente necesario)
import { httpClient } from '../../services/httpClient';
```

---

## 🎯 Uso en Componentes

### Patrón Básico (React)
```typescript
import { invoiceService } from '@/services';
import { useState, useEffect } from 'react';
import { Invoice } from '@/types';

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceService
      .getInvoices({ page: 1, limit: 10 })
      .then(response => setInvoices(response.items))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando...</div>;
  return <div>{/* Render invoices */}</div>;
}
```

### Patrón con Async/Await
```typescript
import { invoiceService } from '@/services';

async function handleCreateInvoice(data) {
  try {
    const newInvoice = await invoiceService.createInvoice(data);
    console.log('Factura creada:', newInvoice);
  } catch (error) {
    console.error('Error al crear factura:', error);
  }
}
```

---

## 🔧 Disponibilidad de Servicios

### InvoiceService
```typescript
invoiceService.getInvoices(filters?)           // GET /api/invoices
invoiceService.getInvoice(id)                  // GET /api/invoices/{id}
invoiceService.createInvoice(data)             // POST /api/invoices
invoiceService.updateInvoice(id, updates)      // PUT /api/invoices/{id}
invoiceService.deleteInvoice(id)               // DELETE /api/invoices/{id}
invoiceService.downloadSignedXml(id)           // GET /api/invoices/{id}/xml (descarga)
invoiceService.getStatistics()                 // GET /api/invoices/stats
invoiceService.generatePDF(id)                 // GET /api/invoices/{id}/pdf (blob)
invoiceService.downloadPDF(id, filename?)      // GET /api/invoices/{id}/pdf (descarga)
```

### ClientService
```typescript
clientService.getClients(filters?)              // GET /api/clients
clientService.getClient(id)                     // GET /api/clients/{id}
clientService.createClient(data)                // POST /api/clients (con idempotencia)
clientService.updateClient(id, data)            // PUT /api/clients/{id} (con idempotencia)
clientService.deleteClient(id)                  // DELETE /api/clients/{id}
```

### CompanyService
```typescript
companyService.getMyCompany()                   // GET /api/companies/me
companyService.createCompany(data)              // POST /api/companies (con idempotencia)
companyService.updateCompany(data)              // PUT /api/companies/me (con idempotencia)
```

### SubscriptionService
```typescript
subscriptionService.getSubscriptionPlans()      // GET /api/subscriptions/plans
subscriptionService.getUserSubscription()       // GET /api/subscriptions/user
subscriptionService.getSubscription(id)         // GET /api/subscriptions/{id}
subscriptionService.createSubscription(data)    // POST /api/subscriptions (idempotencia)
subscriptionService.cancelSubscription(id)      // PUT /api/subscriptions/{id}/cancel
subscriptionService.reactivateSubscription(id)  // PUT /api/subscriptions/{id}/reactivate
```

### AuthService
```typescript
authService.login(email, password, remember?)   // POST /auth/login
authService.register(data)                      // POST /auth/register
authService.logout()                            // POST /auth/logout
```

### DashboardService
```typescript
dashboardService.getDashboardData()             // GET /api/invoices/stats/summary
```

---

## 🛡️ Características Principales

### ✅ Singleton Pattern
Cada servicio es una instancia única garantizada:
```typescript
// Todas estas llamadas retornan la MISMA instancia
const service1 = InvoiceService.getInstance();
const service2 = InvoiceService.getInstance();
console.log(service1 === service2); // true

// La instancia está exportada directamente
import { invoiceService } from '@/services';
```

### ✅ Idempotencia Automática
Operaciones que cambian estado incluyen claves de idempotencia automáticas:
```typescript
// Genera UUID automático internamente
const newClient = await clientService.createClient({
  name: 'Acme Corp',
  nifCif: '12345678Z'
  // La clave de idempotencia se genera automáticamente
});

// Safe para retry: misma operación = mismo resultado
```

### ✅ Tipado Genérico
```typescript
// Respuestas fuertemente tipadas
const invoices = await invoiceService.getInvoices();
// invoices es de tipo: PaginatedResponse<Invoice>

const invoice = await invoiceService.getInvoice('123');
// invoice es de tipo: Invoice
```

### ✅ Manejo de Errores
```typescript
import { ApiError, NetworkError, ValidationError } from '@/lib/api-error';

try {
  await invoiceService.createInvoice(data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Errores de validación:', error.errors);
  } else if (error instanceof NetworkError) {
    console.log('Error de conectividad');
  } else if (error instanceof ApiError) {
    console.log('Error API:', error.statusCode, error.message);
  }
}
```

---

## 🔍 Tipos Comunes

```typescript
// Filtros de factura
interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: string;           // 'DRAFT', 'SENT', 'PAID', etc.
  search?: string;           // Búsqueda de texto libre
  series?: string;           // Serie de factura
  dateFrom?: string;         // ISO date
  dateTo?: string;           // ISO date
}

// Respuesta paginada
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Respuesta genérica de API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

---

## 📌 Notas Importantes

1. **No usar directamente httpClient en componentes**
   - Usar servicios en su lugar
   - httpClient está interno a los servicios

2. **No importar desde apiService.ts (legacy)**
   - Archivo aún existe por compatibilidad
   - Usar nuevos servicios: `@/services`

3. **Todas las mutaciones incluyen idempotencia**
   - createInvoice, updateInvoice, deleteInvoice
   - createClient, updateClient, deleteClient
   - createCompany, updateCompany
   - createSubscription, cancelSubscription, reactivateSubscription

4. **Tipos centralizados en @/types**
   - Importar todos los tipos de este punto
   - Incluye: tipos raíz, suscripción, y tipos de servicios

5. **Servicios están listos para testing**
   - Exportadas clases además de instancias
   - Mockeables para unit tests

---

## 🚀 Ejemplos Completos

### Obtener listado de facturas con filtro
```typescript
import { invoiceService } from '@/services';
import { InvoiceFilters } from '@/types';

const filters: InvoiceFilters = {
  status: 'PENDING',
  page: 1,
  limit: 20,
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
};

const result = await invoiceService.getInvoices(filters);
console.log(`Total: ${result.total}, Página: ${result.page} de ${result.totalPages}`);
result.items.forEach(invoice => console.log(invoice.number));
```

### Crear nuevo cliente
```typescript
import { clientService } from '@/services';
import { CreateClientRequest } from '@/types';

const newClientData: CreateClientRequest = {
  name: 'Tech Solutions S.A.',
  nifCif: 'A12345678',
  address: 'Calle Principal 123',
  city: 'Madrid',
  postalCode: '28001',
  province: 'Madrid',
  email: 'contacto@techsolutions.es'
};

try {
  const client = await clientService.createClient(newClientData);
  console.log('Cliente creado:', client.id);
} catch (error) {
  console.error('No se pudo crear el cliente');
}
```

### Descargar XML firmado
```typescript
import { invoiceService } from '@/services';

async function downloadXml(invoiceId: string) {
  try {
    await invoiceService.downloadSignedXml(invoiceId);
    console.log('Descarga iniciada');
  } catch (error) {
    console.error('Error descargando XML');
  }
}
```

---

## 📚 Documentación Completa

Para más detalles, consultar:
- `VERIFICATION_COMPLETE_SUMMARY.md` - Verificación detallada
- `VERIFICATION_FINAL_SUMMARY.md` - Resumen ejecutivo
- `VERIFICATION_SESSION_LOG.md` - Registro de acciones

---

**Actualizado:** 2024
**Versión:** 1.0 - Consolidación completada
