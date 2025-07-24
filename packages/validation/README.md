# 🛡️ VALIDATION PACKAGE - Sistema de Validación y Sanitización

Paquete completo de validación y sanitización para aplicaciones de facturación de autónomos españoles.

## 🎯 Características Principales

### ✅ Validación Específica España

- **NIF/NIE/CIF**: Validación completa con algoritmos de verificación
- **Códigos Postales**: Validación de códigos postales españoles (00000-59999)
- **IBAN**: Validación de cuentas bancarias españolas
- **IVA**: Tipos válidos en España (0%, 4%, 10%, 21%)

### 🔒 Sanitización de Seguridad

- **Anti-XSS**: Eliminación de scripts maliciosos
- **Anti-SQL Injection**: Detección de patrones de inyección
- **Límites de datos**: Protección contra ataques de volumen
- **Caracteres seguros**: Filtrado de caracteres peligrosos

### 📋 Validación de Facturación

- **Datos de cliente**: Validación completa de información fiscal
- **Líneas de factura**: Validación de productos/servicios
- **Importes**: Validación con máximo 2 decimales
- **Fechas**: Validación de rangos temporales lógicos

## 🚀 Instalación y Uso

### Instalación

```bash
yarn add @facturacion/validation
# o desde el workspace raíz
yarn workspace @facturacion/validation install
```

### Uso Básico con Zod

```typescript
import { invoiceSchema, validateInvoiceData } from '@facturacion/validation';

// Validación con esquema Zod
const invoiceData = {
  number: 'FAC-2024-001',
  date: '2024-07-24',
  client: {
    name: 'Empresa Cliente SL',
    fiscalId: 'B12345678',
    email: 'cliente@empresa.com',
    address: {
      street: 'Calle Mayor 123',
      city: 'Madrid',
      postalCode: '28001',
      province: 'Madrid',
    },
  },
  lines: [
    {
      description: 'Servicio de consultoría',
      quantity: 1,
      unitPrice: 1000.0,
      vatRate: 21,
    },
  ],
};

// Validación automática con sanitización
const result = invoiceSchema.safeParse(invoiceData);
if (result.success) {
  console.log('Factura válida:', result.data);
} else {
  console.log('Errores:', result.error.errors);
}
```

### Uso con Funciones de Utilidad

```typescript
import { ValidationUtils } from '@facturacion/validation';

// Validar identificadores fiscales
const isValidNIF = ValidationUtils.validateNIF('12345678Z');
const isValidCIF = ValidationUtils.validateCIF('B12345678');

// Formatear importes
const formatted = ValidationUtils.formatAmount(1234.56); // "1.234,56 €"

// Calcular IVA
const vatAmount = ValidationUtils.calculateVAT(1000, 21); // 210.00

// Sanitizar texto
const safe = ValidationUtils.sanitizeText('<script>alert("xss")</script>'); // ""
```

## 🔧 Uso con Express.js

### Middleware Básico

```typescript
import express from 'express';
import { completeValidationMiddleware } from '@facturacion/validation/middleware';

const app = express();

// Aplicar validación y sanitización básica a todas las rutas
app.use(completeValidationMiddleware);

// Ruta específica con validación de factura
app.post('/api/invoices', validateInvoiceMiddleware, (req, res) => {
  // req.validatedData contiene los datos validados y sanitizados
  const invoice = req.validatedData;
  // ... lógica de negocio
});
```

### Middleware Personalizado

```typescript
import { validateInvoiceData, sanitizeObject } from '@facturacion/validation';

app.use('/api/invoices', (req, res, next) => {
  try {
    // Sanitizar datos de entrada
    const sanitized = sanitizeObject(req.body);

    // Validar estructura de factura
    const validation = validateInvoiceData(sanitized);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    req.validatedData = validation.data;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error de validación' });
  }
});
```

## 📊 Casos de Uso Específicos

### Validación de Clientes

```typescript
import { clientSchema, ValidationUtils } from '@facturacion/validation';

const clientData = {
  name: 'Juan Pérez García',
  fiscalId: '12345678Z',
  email: 'juan@email.com',
  phone: '+34 666 123 456',
  address: {
    street: 'Av. de la Constitución 45, 2º B',
    city: 'Sevilla',
    postalCode: '41001',
    province: 'Sevilla',
  },
};

// Validación completa
const result = clientSchema.safeParse(clientData);

// Validación específica de NIF
const isValidNIF = ValidationUtils.validateNIF(clientData.fiscalId);
```

### Validación de Importes

```typescript
import { amountValidator, ValidationUtils } from '@facturacion/validation';

// Diferentes formatos de entrada
const amounts = ['1.234,56', '1234.56', 1234.56, '1 234,56 €'];

amounts.forEach(amount => {
  const result = amountValidator.safeParse(amount);
  if (result.success) {
    console.log(`${amount} → ${ValidationUtils.formatAmount(result.data)}`);
  }
});
```

### Detección de Seguridad

```typescript
import { detectSqlInjection, sanitizeObject } from '@facturacion/validation';

const suspiciousData = {
  search: "'; DROP TABLE users; --",
  description: "<script>alert('xss')</script>Producto normal",
};

// Detectar inyección SQL
const hasSqlInjection = detectSqlInjection(suspiciousData.search); // true

// Sanitizar objeto completo
const safe = sanitizeObject(suspiciousData);
// Result: { search: "", description: "Producto normal" }
```

## 🛡️ Características de Seguridad

### Protección XSS

```typescript
// Elimina automáticamente:
// - Tags HTML: <script>, <img>, <iframe>, etc.
// - Event handlers: onclick, onload, etc.
// - JavaScript URLs: javascript:, data:
// - Caracteres peligrosos: <, >, ", ', &

const dangerous = '<img src=x onerror="alert(1)" />';
const safe = sanitizeText(dangerous); // ""
```

### Protección SQL Injection

```typescript
// Detecta patrones como:
// - Palabras clave SQL: SELECT, INSERT, DROP, etc.
// - Operadores: OR 1=1, UNION SELECT, etc.
// - Comentarios: --, /* */
// - Comillas y puntos y comas peligrosos

const sql = "admin' OR '1'='1";
const detected = detectSqlInjection(sql); // true
```

### Límites de Datos

```typescript
// Límites automáticos aplicados:
// - Longitud de strings: máximo 10,000 caracteres
// - Número de líneas de factura: máximo 100
// - Importe máximo: 999,999,999.99 €
// - Campos de descripción: máximo 500 caracteres
// - Notas: máximo 1,000 caracteres
```

## 📋 API Reference

### Validadores Principales

#### `fiscalIdValidator`

Valida NIF, NIE o CIF españoles con sanitización automática.

#### `amountValidator`

Valida importes monetarios con conversión automática y límites.

#### `dateValidator`

Valida fechas con rango lógico para facturación.

#### `emailValidator`

Valida emails con sanitización de caracteres peligrosos.

### Esquemas Complejos

#### `invoiceSchema`

Esquema completo para validación de facturas con todas las validaciones integradas.

#### `clientSchema`

Esquema para validación de datos de cliente/empresa.

#### `invoiceLineSchema`

Esquema para validación de líneas individuales de factura.

### Funciones de Utilidad

#### `ValidationUtils.validateNIF(nif: string): boolean`

Validación estricta de NIF con algoritmo oficial.

#### `ValidationUtils.validateCIF(cif: string): boolean`

Validación estricta de CIF con algoritmo oficial.

#### `ValidationUtils.formatAmount(amount: number): string`

Formateo de importes en formato español (1.234,56 €).

#### `ValidationUtils.calculateVAT(amount: number, rate: number): number`

Cálculo preciso de IVA con redondeo a 2 decimales.

### Funciones de Seguridad

#### `sanitizeObject(obj: any): any`

Sanitización recursiva de objetos con protección XSS.

#### `detectSqlInjection(input: string): boolean`

Detección de patrones de inyección SQL.

## 🚨 Manejo de Errores

### Tipos de Error

```typescript
import { ValidationError, SecurityError } from '@facturacion/validation';

try {
  const result = validateInvoiceData(data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Error de validación:', error.message, error.field);
  } else if (error instanceof SecurityError) {
    console.log('Problema de seguridad:', error.severity);
  }
}
```

### Respuestas de Error Estructuradas

```typescript
// Formato estándar de respuesta de error
{
  success: false,
  message: "Datos de factura inválidos",
  errors: [
    "client.fiscalId: Identificador fiscal inválido",
    "lines.0.quantity: La cantidad debe ser mayor que 0",
    "total: El importe es demasiado alto"
  ],
  code: "VALIDATION_ERROR"
}
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```bash
# Límites de validación (opcional)
VALIDATION_MAX_BODY_SIZE=1048576  # 1MB
VALIDATION_MAX_QUERY_PARAMS=50
VALIDATION_MAX_INVOICE_LINES=100
VALIDATION_MAX_AMOUNT=999999999.99

# Logging de seguridad
VALIDATION_LOG_SECURITY_EVENTS=true
VALIDATION_LOG_LEVEL=warn
```

### Personalización de Esquemas

```typescript
import { z } from 'zod';
import { fiscalIdValidator, amountValidator } from '@facturacion/validation';

// Extender esquemas existentes
const customInvoiceSchema = z.object({
  // Campos base
  ...invoiceSchema.shape,

  // Campos personalizados
  customField: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});
```

## 📈 Métricas y Monitoreo

### Logging de Seguridad

El paquete registra automáticamente:

- Intentos de inyección SQL detectados
- Contenido XSS sanitizado
- Límites de datos excedidos
- User-Agents sospechosos
- IPs con comportamiento anómalo

### Métricas Recomendadas

- Número de validaciones fallidas por endpoint
- Tiempo de procesamiento de validación
- Frecuencia de detección de ataques
- Tipos de errores más comunes

## 🔄 Integración con Prisma

```typescript
// Ejemplo de uso con Prisma para prevenir inyección
import { PrismaClient } from '@prisma/client';
import { sanitizeObject } from '@facturacion/validation';

const prisma = new PrismaClient();

async function createInvoice(data: any) {
  // Sanitizar datos antes de Prisma
  const sanitized = sanitizeObject(data);

  // Validar estructura
  const validation = validateInvoiceData(sanitized);
  if (!validation.success) {
    throw new Error('Datos inválidos');
  }

  // Usar con Prisma (ya protegido contra SQL injection)
  return prisma.invoice.create({
    data: validation.data,
  });
}
```

## ✅ Testing

```typescript
import { describe, test, expect } from 'jest';
import { ValidationUtils, validateInvoiceData } from '@facturacion/validation';

describe('Validation Tests', () => {
  test('should validate Spanish NIF', () => {
    expect(ValidationUtils.validateNIF('12345678Z')).toBe(true);
    expect(ValidationUtils.validateNIF('00000000T')).toBe(true);
    expect(ValidationUtils.validateNIF('invalid')).toBe(false);
  });

  test('should detect SQL injection', () => {
    expect(detectSqlInjection("'; DROP TABLE users;")).toBe(true);
    expect(detectSqlInjection('normal text')).toBe(false);
  });

  test('should validate complete invoice', () => {
    const invoice = {
      number: 'FAC-001',
      date: new Date(),
      client: {
        /* valid client data */
      },
      lines: [
        {
          /* valid line data */
        },
      ],
    };

    const result = validateInvoiceData(invoice);
    expect(result.success).toBe(true);
  });
});
```

---

## 🎉 Conclusión

Este paquete de validación proporciona una protección completa contra los principales vectores de ataque en aplicaciones web, específicamente optimizado para el contexto español de facturación de autónomos. Con validaciones específicas del dominio y sanitización robusta, garantiza la seguridad y integridad de los datos.
