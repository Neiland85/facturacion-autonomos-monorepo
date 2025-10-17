# 0002. Implementación de Idempotencia en Operaciones Críticas

Fecha: 17 de octubre de 2025

## Estado

Aceptado

## Contexto

El sistema de facturación requiere garantías de no-duplicación en operaciones críticas para evitar problemas como:

- **Registro de usuarios**: Race conditions entre verificación y creación pueden permitir múltiples cuentas con el mismo email
- **Creación de facturas**: Reintentos de red pueden crear facturas duplicadas
- **Webhooks**: Stripe y AEAT pueden reenviar eventos, causando procesamiento duplicado
- **Suscripciones**: Operaciones de pago pueden ser reintentadas por fallos de red

Estos problemas pueden causar inconsistencias en datos, cargos duplicados, y violaciones de integridad referencial.

## Opciones Consideradas

* **Opción 1**: Idempotency-Key en headers + Redis + Prisma
* **Opción 2**: Solo validación en BD con unique constraints
* **Opción 3**: Distributed locks con Redis

## Decisión

**Opción 1** - Idempotency-Key con caché en Redis y persistencia en Prisma, porque proporciona el mejor balance entre performance, durabilidad y facilidad de implementación siguiendo estándares de la industria como Stripe.

### Pros y Contras de las Opciones

#### Opción 1: Idempotency-Key + Redis + Prisma

* Bueno, porque sigue estándares de la industria (RFC 8471, Stripe API)
* Bueno, porque proporciona caché rápido con Redis y durabilidad con Prisma
* Bueno, porque es transparente para clientes (header opcional)
* Bueno, porque maneja automáticamente race conditions
* Malo, porque requiere configuración adicional de Redis
* Malo, porque añade complejidad al middleware

#### Opción 2: Solo validación en BD

* Bueno, porque es simple de implementar
* Bueno, porque no requiere infraestructura adicional
* Malo, porque no maneja race conditions efectivamente
* Malo, porque puede causar errores 500 en lugar de respuestas idempotentes
* Malo, porque no sigue estándares de la industria

#### Opción 3: Distributed locks

* Bueno, porque maneja race conditions efectivamente
* Malo, porque es complejo de implementar correctamente
* Malo, porque puede causar deadlocks
* Malo, porque tiene peor performance que la opción 1
* Malo, porque requiere coordinación distribuida

## Consecuencias

* Bueno, porque previene duplicados en operaciones críticas de negocio
* Bueno, porque mejora la experiencia de usuario en reintentos de red
* Bueno, porque cumple con best practices de APIs REST
* Bueno, porque facilita debugging de problemas de integridad
* Bueno, porque es extensible a futuras operaciones críticas
* Malo, porque añade complejidad operacional (Redis)
* Malo, porque requiere mantenimiento de claves expiradas
* Malo, porque aumenta ligeramente la latencia de respuestas

## Enlaces

* Refina [ADR-0001](0001-implementacion-estructura-monorepo-turborepo.md) - Estructura del monorepo
* Implementa idempotencia según [RFC 8471](https://datatracker.ietf.org/doc/html/rfc8471)