# ADR-002: Patrones de Diseño en Microservicios

## Estado
Aceptado

## Contexto
Para mantener una base de código limpia, testeable y mantenible en nuestros microservicios, necesitamos establecer patrones de diseño consistentes que todos los servicios deben seguir.

## Decisión
Implementamos los siguientes patrones en todos los microservicios:

### 1. Repository Pattern
- **Propósito**: Abstraer el acceso a datos
- **Implementación**: Una clase Repository por entidad principal
- **Beneficio**: Facilita testing y cambio de base de datos

```typescript
class FacturaRepository {
  async create(data: CreateFacturaData): Promise<Factura>
  async findById(id: string): Promise<Factura | null>
  async findMany(filter: FacturaFilter): Promise<Factura[]>
  async update(id: string, data: UpdateFacturaData): Promise<Factura>
  async delete(id: string): Promise<void>
}
```

### 2. Service Layer Pattern
- **Propósito**: Contener lógica de negocio
- **Implementación**: Servicios que orquestan repositories
- **Beneficio**: Separación de concerns, reutilización de lógica

```typescript
class FacturaService {
  constructor(private repository: FacturaRepository)
  async createFactura(data: CreateFacturaInput): Promise<FacturaResponse>
  async calculateTotals(lineas: LineaFactura[]): Promise<Totals>
}
```

### 3. Controller Pattern
- **Propósito**: Manejar peticiones HTTP
- **Implementación**: Controllers delgados que delegan a servicios
- **Beneficio**: Separación de lógica HTTP de lógica de negocio

### 4. DTO (Data Transfer Object) Pattern
- **Propósito**: Definir contratos de API
- **Implementación**: Schemas Zod para validación
- **Beneficio**: Type safety y validación automática

### 5. Error Handling Pattern
- **Propósito**: Manejo consistente de errores
- **Implementación**: Custom error classes y middleware global
- **Beneficio**: Respuestas de error consistentes

```typescript
class BusinessError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
  }
}
```

## Estructura de Directorios
```
src/
├── config/        # Configuración (logger, metrics, db)
├── controllers/   # HTTP controllers
├── middleware/    # Express middleware
├── repositories/  # Data access layer
├── services/      # Business logic
├── schemas/       # Zod schemas (DTOs)
├── types/         # TypeScript types
├── utils/         # Utilidades
└── index.ts       # Entry point
```

## Consecuencias

### Positivas
- **Testabilidad**: Cada capa puede ser testeada independientemente
- **Mantenibilidad**: Código organizado y predecible
- **Escalabilidad**: Fácil añadir nuevas features
- **Consistencia**: Todos los servicios siguen la misma estructura

### Negativas
- **Boilerplate**: Más código inicial para features simples
- **Curva de aprendizaje**: Desarrolladores deben conocer los patrones

### Mitigaciones
- Crear generadores de código para reducir boilerplate
- Documentar patrones con ejemplos claros
- Code reviews para asegurar adherencia a patrones

## Referencias
- [Martin Fowler - Patterns of Enterprise Application Architecture](https://martinfowler.com/books/eaa.html)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)

## Fecha
2024-01-15