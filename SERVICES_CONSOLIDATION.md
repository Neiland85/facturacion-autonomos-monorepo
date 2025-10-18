# Service Layer Consolidation Guide

## Overview

This document describes the consolidation of duplicate service layers in the frontend application. The goal is to establish a single source of truth for all API interactions and business logic.

## Architecture Before

### Two Parallel Service Implementations

**Legacy Service Layer** (`apps/web/services/apiService.ts`):
- Function-based exports (437 lines)
- Direct httpClient usage
- Manual data mapping and transformation
- Comprehensive implementation with 20+ functions
- Used by demo/prototype SPA components

**New Service Layer** (`apps/web/src/services/`):
- Class-based services with singleton pattern
- Several critical issues (broken invoice.service.ts)
- Missing implementations (client, company, dashboard services)
- Inconsistent error handling
- Used by Next.js App Router components

### Problems

1. **Code Duplication**: Same operations implemented twice
2. **Inconsistency**: Different patterns and approaches
3. **Maintenance Burden**: Changes must be made in two places
4. **Type Safety Issues**: Multiple type definitions across the codebase
5. **Missing Services**: No client or company services in new layer
6. **Broken Code**: invoice.service.ts has syntax errors

---

## Architecture After

### Single Source of Truth: `apps/web/src/services/`

All business logic consolidated in class-based services with singleton pattern.

**Core Services:**

1. **`auth.service.ts`** - Authentication and user management
   - Login, register, logout
   - Token refresh, 2FA verification
   - Password reset, email verification

2. **`invoice.service.ts`** - Invoice CRUD operations
   - List, get, create, update, delete invoices
   - Download signed XML
   - Retrieve statistics

3. **`client.service.ts`** - Client management
   - List, get, create, update, delete clients
   - Filtering and pagination support

4. **`company.service.ts`** - Company information
   - Get current company
   - Create and update company
   - Idempotency key support

5. **`subscription.service.ts`** - Subscription management
   - List subscription plans
   - Get user subscription
   - Create, cancel, reactivate subscriptions

6. **`dashboard.service.ts`** - Dashboard statistics
   - Retrieve summary statistics
   - Aggregate invoice data

**HTTP Layer:**

- **`httpClient.ts`** - Base axios instance with interceptors
- **`api-client.ts`** - Wrapper with standardized error handling and response unwrapping
- **`api-error.ts`** - Custom error classes (ApiError, NetworkError, ValidationError)

**Token Management:**

- **`tokenStorage.ts`** - localStorage-based token storage

**Type System:**

- **`types/index.ts`** - Central type definitions (NEW)
  - Re-exports from root `types.ts`
  - Re-exports from `types/subscription.types.ts`
  - Adds service-specific types (InvoiceFilters, ClientFilters, etc.)

---

## Service Pattern

All services follow this consistent pattern:

```typescript
import { apiClient } from '@/lib/api-client';
import type { SomeType, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing resources
 * Implements singleton pattern for consistent state management
 */
export class SomeService {
  private static instance: SomeService;
  private readonly baseEndpoint = '/api/resource';

  private constructor() {}

  /**
   * Get or create the singleton instance
   */
  static getInstance(): SomeService {
    if (!SomeService.instance) {
      SomeService.instance = new SomeService();
    }
    return SomeService.instance;
  }

  /**
   * Get all resources
   * @returns Promise containing resources
   */
  async getSomething(): Promise<SomeType[]> {
    const response = await apiClient.get<ApiResponse<SomeType[]>>(
      this.baseEndpoint
    );
    return response.data;
  }

  /**
   * Create a resource with idempotency key
   * @param data - Resource creation data
   * @returns Promise containing the created resource
   */
  async createSomething(data: CreateRequest): Promise<SomeType> {
    const idempotencyKey = uuidv4();
    const response = await apiClient.post<ApiResponse<SomeType>>(
      this.baseEndpoint,
      data,
      {
        headers: { 'Idempotency-Key': idempotencyKey },
      }
    );
    return response.data;
  }
}

/**
 * Singleton instance
 */
export const someService = SomeService.getInstance();
```

### Key Characteristics

- **Private Constructor**: Prevents instantiation
- **Static getInstance()**: Creates singleton instance on first call
- **Private baseEndpoint**: Centralized API path
- **Async Methods**: All operations return Promises
- **Consistent Return Types**: Uses `ApiResponse<T>` wrapper from apiClient
- **JSDoc Comments**: Every method documented
- **Error Handling**: Delegated to apiClient
- **Idempotency Keys**: Generated for mutating operations

---

## Type System

### Centralized at `apps/web/src/types/index.ts`

```typescript
import { Type } from '@/types';
```

All imports go through this central point:

1. **Re-exports from root `types.ts`**:
   - Domain types: `Invoice`, `Client`, `Company`
   - Shared types: `ApiResponse`, `PaginatedResult`
   - Enums: `InvoiceStatus`

2. **Re-exports from `types/subscription.types.ts`**:
   - Subscription domain types

3. **Service-specific types**:
   - Filter interfaces: `InvoiceFilters`, `ClientFilters`
   - Request/response types: `CreateInvoiceRequest`, `UpsertCompanyRequest`
   - Pagination: `PaginatedResponse<T>`

---

## Backward Compatibility

### Legacy Wrapper: `apps/web/services/apiService.ts`

Transformed into a thin compatibility wrapper that delegates to new services.

**Benefits:**

- Existing components continue to work without changes
- New components use consolidated services directly
- Gradual migration path
- No breaking changes

**Pattern:**

```typescript
// OLD: Direct implementation
export const getInvoices = async (params) => {
  const response = await httpClient.get('/invoices', { params });
  return mapPaginated(response.data.data, mapInvoice);
};

// NEW: Delegates to service
export const getInvoices = async (params) => {
  const response = await invoiceService.getInvoices(params);
  return mapPaginated(response, mapInvoice);
};
```

**Deprecation Comments:**

```typescript
/**
 * @deprecated Use invoiceService.getInvoices() from '@/services' instead
 * This wrapper is maintained for backward compatibility with legacy components
 */
export const getInvoices = async (...) => { ... }
```

---

## Migration Guide

### For New Code

Use services directly from `@/services`:

```typescript
import { invoiceService, clientService } from '@/services';

// Get invoices with filters
const invoices = await invoiceService.getInvoices({ status: 'PAID' });

// Create a client
const client = await clientService.createClient({
  name: 'Acme Corp',
  nifCif: '12345678A',
  email: 'info@acme.com',
});
```

### For Legacy Components

Continue using `apiService` without changes (it delegates):

```typescript
import { getInvoices, createClient } from '../services/apiService';

const result = await getInvoices({ status: 'PAID' });
const client = await createClient(clientData);
```

### Gradual Migration

1. New features use `@/services` directly
2. Legacy components continue using `apiService.ts`
3. When modifying legacy components, migrate to new services
4. Eventually deprecate `apiService.ts` wrapper once all components migrated

---

## Error Handling

All services use standardized error handling through `apiClient`:

```typescript
import { ApiError, NetworkError, ValidationError } from '@/lib/api-error';

try {
  const result = await invoiceService.getInvoice(id);
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isAuthError()) {
      // Handle 401 Unauthorized
      redirectToLogin();
    } else if (error.isNotFoundError()) {
      // Handle 404 Not Found
      showNotFoundMessage();
    } else if (error.isValidationError()) {
      // Handle 400 Bad Request
      showValidationErrors(error.details);
    }
  } else if (error instanceof NetworkError) {
    // Handle network connectivity issues
    showNetworkError();
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

### Error Types

- **`ApiError`**: HTTP errors (4xx, 5xx)
  - Methods: `isAuthError()`, `isNotFoundError()`, `isValidationError()`
  - Properties: `status`, `code`, `details`

- **`NetworkError`**: Connection issues
  - Properties: `message`

- **`ValidationError`**: Input validation failures (400)
  - Properties: `errors` (detailed field errors)

---

## Idempotency

Mutating operations include automatic idempotency keys:

```typescript
// Create operations automatically include Idempotency-Key header
const invoice = await invoiceService.createInvoice(data);
const client = await clientService.createClient(data);
const company = await companyService.createCompany(data);
const subscription = await subscriptionService.createSubscription(data);
```

The key is generated as UUID v4 and sent in the `Idempotency-Key` header. The backend uses this to ensure the operation is only performed once, even if the request is retried.

---

## Testing

### Mocking Services

```typescript
import { InvoiceService } from '@/services';

jest.mock('@/services', () => ({
  invoiceService: {
    getInvoices: jest.fn(),
    getInvoice: jest.fn(),
    createInvoice: jest.fn(),
    updateInvoice: jest.fn(),
    deleteInvoice: jest.fn(),
  }
}));

// Usage in tests
import { invoiceService } from '@/services';

test('loads invoices', async () => {
  (invoiceService.getInvoices as jest.Mock).mockResolvedValue({
    items: [mockInvoice],
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  });

  // Test your component/logic
});
```

### Testing with Real API

```typescript
import { invoiceService } from '@/services';

describe('InvoiceService', () => {
  it('should fetch invoices', async () => {
    const result = await invoiceService.getInvoices({ limit: 10 });
    
    expect(result.items).toBeDefined();
    expect(result.page).toEqual(1);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});
```

---

## Backend API Mapping

Services route to backend microservices through the API Gateway:

| Service | Backend | Port | Routes |
|---------|---------|------|--------|
| `auth.service.ts` | Auth Service | 3003 | `/auth/*` |
| `invoice.service.ts` | Invoice Service | 3002 | `/invoices/*` |
| `client.service.ts` | Invoice Service | 3002 | `/clients/*` |
| `company.service.ts` | Invoice Service | 3002 | `/companies/*` |
| `subscription.service.ts` | Subscription Service | 3006 | `/subscriptions/*` |
| `dashboard.service.ts` | Invoice Service | 3002 | `/invoices/stats/*` |

**All requests go through API Gateway (port 3001)** with `/api` prefix.

---

## Known Limitations

### Backend Stubs (Not Yet Implemented)

Some endpoints exist but are stubs on the backend:

- `GET /api/subscriptions/:id` - Returns mock data
- `GET /api/subscriptions/plans` - Returns mock data
- `GET /api/subscriptions/user` - Returns mock data
- `GET /api/invoices/:id/pdf` - Returns mock PDF

The frontend services are ready; backend implementation is pending.

### Missing Components

- `components/FiscalDashboard.tsx` references `getFiscalData` which doesn't exist
- This component needs to be updated or implemented

---

## Future Improvements

1. **Request Caching**: Cache GET requests to reduce server load
2. **Optimistic Updates**: Update UI before server confirmation
3. **Retry Logic**: Automatic retry for failed requests
4. **Request Cancellation**: Cancel pending requests on component unmount
5. **Shared Mapping Utilities**: Extract common data transformation logic
6. **Unit Tests**: Comprehensive test coverage for all services
7. **Component Migration**: Migrate all legacy components to use new services
8. **Service Deprecation**: Remove `apiService.ts` wrapper once all components migrated

---

## References

- **API Gateway Configuration**: `API_GATEWAY_ROUTING.md`
- **Route Audit**: `ROUTES_AUDIT.md`
- **Endpoint Status**: `ENDPOINTS_IMPLEMENTATION_STATUS.md`
- **Backend API Documentation**: Individual service READMEs in `apps/`
- **Frontend Configuration**: `FRONTEND_URL_CONFIGURATION.md`
