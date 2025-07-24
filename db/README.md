# Database Migrations

Este directorio contiene las migraciones de base de datos para el proyecto de facturación de autónomos.

## Estructura

```
db/
├── migrations/
│   ├── 01-create-financials-table.sql
│   └── 02-create-ocr-invoices-table.sql
└── run-migrations.sh
```

## Uso

### Ejecutar todas las migraciones

```bash
# Usando el script automatizado
./db/run-migrations.sh

# O especificando la DATABASE_URL
./db/run-migrations.sh "postgresql://user:password@localhost:5432/database"
```

### Ejecutar migraciones manualmente

```bash
# Establecer la variable de entorno
export DATABASE_URL="postgresql://postgres:${POSTGRES_DEV_PASSWORD:-secure_dev_pass}@localhost:5432/facturacion_dev"

# Ejecutar migraciones individuales
psql $DATABASE_URL -f db/migrations/01-create-financials-table.sql
psql $DATABASE_URL -f db/migrations/02-create-ocr-invoices-table.sql
```

## Migraciones Disponibles

### 01-create-financials-table.sql

- Crea la tabla `quarterly_financial_records`
- Almacena registros financieros trimestrales
- Incluye datos de ingresos, gastos, IVA e IRPF
- Contiene datos de ejemplo para testing

### 02-create-ocr-invoices-table.sql

- Crea la tabla `processed_invoices`
- Almacena facturas procesadas por OCR
- Incluye metadatos de confianza y categorización fiscal
- Contiene triggers para timestamps automáticos
- Incluye datos de ejemplo para testing

## Variables de Entorno

| Variable                | Descripción                           | Valor por defecto                                                      |
| ----------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`          | URL completa de conexión a PostgreSQL | `postgresql://postgres:secure_dev_pass@localhost:5432/facturacion_dev` |
| `POSTGRES_DEV_PASSWORD` | Contraseña para desarrollo            | `secure_dev_pass`                                                      |

## Integración CI/CD

Las migraciones se ejecutan automáticamente en el pipeline CI/CD:

1. **GitHub Actions**: Se configura un servicio PostgreSQL
2. **Migraciones**: Se ejecutan antes de los tests
3. **Validación**: Verifica que las tablas se crean correctamente

## Desarrollo Local

Para desarrollo local, asegúrate de tener PostgreSQL ejecutándose:

```bash
# Instalar PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Crear base de datos
createdb facturacion_dev

# Ejecutar migraciones
./db/run-migrations.sh
```

## Notas de Seguridad

- ⚠️ Las migraciones incluyen `DROP TABLE IF EXISTS` para desarrollo
- 🔒 En producción, usar migraciones más conservadoras
- 📝 Los datos de ejemplo deben removerse en producción
- 🛡️ Usar variables de entorno para credenciales
