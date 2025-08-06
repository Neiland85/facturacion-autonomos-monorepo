# ADR-001: Arquitectura de Microservicios

## Estado
Aceptado

## Contexto
TributariApp necesita una arquitectura escalable, mantenible y que permita evolucionar diferentes componentes de forma independiente. El sistema debe manejar múltiples integraciones fiscales (PEPPOL, AEAT) y ser capaz de escalar según la demanda.

## Decisión
Adoptamos una arquitectura de microservicios con las siguientes características:

1. **Servicios independientes**: Cada dominio de negocio tendrá su propio servicio
   - api-facturas: Gestión de facturas
   - api-tax-calculator: Cálculos fiscales
   - api-clientes: Gestión de clientes
   - api-integraciones: Integraciones PEPPOL/AEAT
   - api-auth: Autenticación y autorización

2. **Comunicación entre servicios**: 
   - Síncrona: REST/HTTP para operaciones inmediatas
   - Asíncrona: Event-driven para operaciones que no requieren respuesta inmediata

3. **Base de datos**: 
   - Cada servicio tiene su propia base de datos (Database per Service)
   - PostgreSQL como base de datos principal
   - Redis para caché y sesiones

4. **API Gateway**: 
   - Punto único de entrada
   - Manejo de autenticación
   - Rate limiting
   - Routing a microservicios

## Consecuencias

### Positivas
- **Escalabilidad independiente**: Cada servicio puede escalar según su carga
- **Desarrollo independiente**: Equipos pueden trabajar en paralelo
- **Tecnología flexible**: Cada servicio puede usar la tecnología más apropiada
- **Despliegue independiente**: Reducción del riesgo en deployments
- **Resiliencia**: Fallo en un servicio no afecta a otros

### Negativas
- **Complejidad operacional**: Más servicios para monitorear y mantener
- **Latencia de red**: Comunicación entre servicios añade latencia
- **Consistencia de datos**: Transacciones distribuidas son complejas
- **Debugging**: Más difícil seguir el flujo de una petición

### Mitigaciones
- Usar herramientas de observabilidad (Prometheus, Grafana, Datadog)
- Implementar circuit breakers y retry policies
- Usar event sourcing para mantener consistencia eventual
- Centralizar logs con ELK stack o similar

## Referencias
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
- [Sam Newman - Building Microservices](https://samnewman.io/books/building_microservices/)

## Fecha
2024-01-15