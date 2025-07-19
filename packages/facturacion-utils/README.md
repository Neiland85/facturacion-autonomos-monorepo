# @neiland85/facturacion-utils

A lightweight utility library for projects related to digital invoicing, tax management, and backoffice tooling.

## ✨ Includes

- `slugify(text)` → Converts text to URL-friendly slugs
- `formatCurrency(amount, currency)` → Localized currency formatting
- `createLogger(namespace)` → Scoped logger with console output

## 📦 Usage

```ts
import { slugify, formatCurrency, createLogger } from '@neiland85/facturacion-utils';

slugify('Factura Número 1'); // → factura-numero-1

formatCurrency(1299.95); // → €1.299,95

const log = createLogger('auth');
log.info('Token valid'); // [INFO][auth] Token valid
```

🛠 Publish (from project root)
```bash
npm login --registry=https://npm.pkg.github.com
npm publish --workspace packages/facturacion-utils
```
