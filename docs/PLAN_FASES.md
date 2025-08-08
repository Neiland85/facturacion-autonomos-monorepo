# 🗓️ PLAN DE FASES PENDIENTES

## Roadmap Ejecutivo - Monorepo Facturación Autónomos

---

**Documento:** Plan de Fases de Desarrollo  
**Metodología:** Agile/Scrum - Sprints de 2 semanas  
**Fórmula de estimación:** 48h/sprint × desarrolladores × complejidad  
**Fecha base:** Enero 2025

---

## 📋 RESUMEN DE FASES

### Distribución Temporal y Presupuestaria

| Fase                       | Duración          | Horas      | Coste (€)    | Prioridad  | ROI   |
| -------------------------- | ----------------- | ---------- | ------------ | ---------- | ----- |
| **Fase 1 - Consolidación** | 6-8 semanas       | 384h       | €38,400      | 🔴 CRÍTICA | ALTO  |
| **Fase 2 - Compliance**    | 10-12 semanas     | 640h       | €64,000      | 🟡 ALTA    | MEDIO |
| **Fase 3 - Expansión B2B** | 16-20 semanas     | 896h       | €89,600      | 🟢 MEDIA   | ALTO  |
| **TOTAL**                  | **32-40 semanas** | **1,920h** | **€192,000** | -          | -     |

---

## 🚀 FASE 1: CONSOLIDACIÓN Y MVP

**Duración:** 6-8 semanas (3-4 sprints)  
**Prioridad:** 🔴 CRÍTICA  
**Budget:** €38,400

### Objetivos Principales

1. **Finalización Microservicios Core**
2. **Deployment Production-Ready**
3. **Optimización Performance**
4. **Testing Coverage 90%+**

### Sprint 1 (Semanas 1-2): Microservicios Core

**Horas:** 96h | **Coste:** €9,600

#### auth-service - Finalización

**Tareas:**

- [ ] **Completar endpoints autenticación** (16h)
  - Login/logout functionality
  - Password reset flows
  - Session management

- [ ] **Implementar sistema roles** (12h)
  - Role-based access control
  - Permission management
  - Admin panel integration

- [ ] **2FA implementation** (20h)
  - TOTP authentication
  - Backup codes generation
  - SMS fallback option

- [ ] **Tests unitarios y integración** (8h)
  - Jest test suites
  - API endpoint testing
  - Security testing

#### api-gateway - Estabilización

**Tareas:**

- [ ] **Routing configuration** (12h)
  - Service discovery setup
  - Load balancing rules
  - Failover mechanisms

- [ ] **Rate limiting avanzado** (8h)
  - Per-user rate limits
  - Burst protection
  - Whitelist management

- [ ] **Health checks y monitoring** (12h)
  - Service health endpoints
  - Circuit breaker pattern
  - Metrics collection

- [ ] **API documentation** (8h)
  - OpenAPI 3.0 specs
  - Swagger UI setup
  - Integration examples

### Sprint 2 (Semanas 3-4): Deployment & Infrastructure

**Horas:** 96h | **Coste:** €9,600

#### Kubernetes Production Setup

**Tareas:**

- [ ] **Cluster configuration** (20h)
  - Production k8s cluster
  - Namespace organization
  - RBAC configuration

- [ ] **CI/CD Pipeline enhancement** (16h)
  - GitHub Actions workflows
  - Automated testing gates
  - Deployment automation

- [ ] **Monitoring stack** (20h)
  - Prometheus + Grafana
  - Application metrics
  - Alert manager setup

- [ ] **Security hardening** (12h)
  - Network policies
  - Secret management
  - Container security

#### Database Optimization

**Tareas:**

- [ ] **Query optimization** (12h)
  - Slow query analysis
  - Index optimization
  - Connection pooling

- [ ] **Migration strategy** (8h)
  - Zero-downtime migrations
  - Backup procedures
  - Rollback mechanisms

- [ ] **Performance testing** (8h)
  - Load testing scenarios
  - Stress testing
  - Bottleneck identification

### Sprint 3 (Semanas 5-6): Performance & Quality

**Horas:** 96h | **Coste:** €9,600

#### Frontend Optimization

**Tareas:**

- [ ] **Bundle optimization** (16h)
  - Code splitting
  - Lazy loading
  - Asset optimization

- [ ] **Performance improvements** (12h)
  - Core Web Vitals optimization
  - Caching strategies
  - CDN integration

- [ ] **Accessibility compliance** (12h)
  - WCAG 2.1 AA compliance
  - Screen reader testing
  - Keyboard navigation

#### Testing Coverage

**Tareas:**

- [ ] **Unit test coverage 90%+** (20h)
  - Critical path testing
  - Edge case coverage
  - Mock implementations

- [ ] **E2E test suite** (16h)
  - User journey testing
  - Cross-browser testing
  - Mobile responsive testing

- [ ] **Performance testing** (12h)
  - Lighthouse CI integration
  - Performance budgets
  - Regression testing

#### Documentation

**Tareas:**

- [ ] **API documentation complete** (8h)
  - OpenAPI specifications
  - Code examples
  - Integration guides

### Sprint 4 (Semanas 7-8): MVP Finalization

**Horas:** 96h | **Coste:** €9,600

#### User Experience Polish

**Tareas:**

- [ ] **UI/UX refinements** (20h)
  - Design system updates
  - User feedback integration
  - Mobile optimization

- [ ] **Error handling** (12h)
  - User-friendly error messages
  - Graceful degradation
  - Offline capabilities

#### Production Readiness

**Tareas:**

- [ ] **Security audit** (16h)
  - Penetration testing
  - Vulnerability assessment
  - Security documentation

- [ ] **Performance benchmarking** (12h)
  - Load testing
  - Capacity planning
  - SLA definition

- [ ] **Go-live preparation** (20h)
  - Production deployment
  - Smoke testing
  - Rollback procedures

- [ ] **User training materials** (16h)
  - User documentation
  - Video tutorials
  - Support documentation

---

## 🛡️ FASE 2: COMPLIANCE Y INTEGRACIONES

**Duración:** 10-12 semanas (5-6 sprints)  
**Prioridad:** 🟡 ALTA  
**Budget:** €64,000

### Objetivos Principales

1. **Certificación AEAT/SII Completa**
2. **Integraciones Bancarias**
3. **Multi-tenant Architecture**
4. **Advanced Analytics**

### Sprint 5-6 (Semanas 9-12): AEAT/SII Certification

**Horas:** 192h | **Coste:** €19,200

#### SII Integration Complete

**Tareas:**

- [ ] **XML signature implementation** (32h)
  - Digital certificate integration
  - XMLDSig implementation
  - Certificate validation

- [ ] **AEAT webservice integration** (24h)
  - Production endpoint integration
  - Error handling
  - Retry mechanisms

- [ ] **Testing entorno AEAT** (20h)
  - Sandbox environment testing
  - Real transaction testing
  - Certification process

- [ ] **Compliance validation** (16h)
  - Regulatory compliance check
  - Documentation requirements
  - Audit trail implementation

#### Tax Calculation Enhancement

**Tareas:**

- [ ] **Advanced tax rules** (24h)
  - Regional variations
  - Special regimes
  - Tax calendar integration

- [ ] **Validation rules** (16h)
  - Business rule validation
  - Data integrity checks
  - Compliance warnings

- [ ] **Reporting features** (24h)
  - Tax reports generation
  - Quarterly summaries
  - Annual declarations

- [ ] **Integration testing** (16h)
  - End-to-end tax flows
  - Edge case testing
  - Performance validation

#### Fiscal Calendar Integration

**Tareas:**

- [ ] **Calendar management** (20h)
  - Spanish fiscal calendar
  - Automated reminders
  - Deadline tracking

### Sprint 7-8 (Semanas 13-16): Banking Integration

**Horas:** 192h | **Coste:** €19,200

#### Banking APIs Integration

**Tareas:**

- [ ] **Open Banking APIs** (40h)
  - PSD2 compliance
  - Bank account connection
  - Transaction synchronization

- [ ] **Payment processing** (32h)
  - SEPA integration
  - Payment status tracking
  - Reconciliation automation

- [ ] **Security implementation** (24h)
  - Strong customer authentication
  - Data encryption
  - Audit logging

#### Financial Reconciliation

**Tareas:**

- [ ] **Automatic reconciliation** (32h)
  - Transaction matching
  - Variance detection
  - Manual resolution flows

- [ ] **Cash flow tracking** (20h)
  - Real-time balance updates
  - Projection calculations
  - Alerts and notifications

- [ ] **Financial reporting** (24h)
  - Bank statement integration
  - Financial dashboards
  - Export capabilities

#### Multi-Currency Support

**Tareas:**

- [ ] **Currency management** (20h)
  - Exchange rate integration
  - Multi-currency invoicing
  - Currency conversion

### Sprint 9-10 (Semanas 17-20): Multi-tenant Architecture

**Horas:** 192h | **Coste:** €19,200

#### Tenant Isolation

**Tareas:**

- [ ] **Database sharding** (40h)
  - Tenant-specific schemas
  - Data isolation
  - Performance optimization

- [ ] **API tenant routing** (24h)
  - Tenant identification
  - Request routing
  - Access control

- [ ] **Resource management** (20h)
  - Tenant quotas
  - Usage tracking
  - Billing integration

#### Administration Portal

**Tareas:**

- [ ] **Admin dashboard** (32h)
  - Tenant management
  - User administration
  - System monitoring

- [ ] **Configuration management** (24h)
  - Tenant-specific settings
  - Feature toggles
  - Custom branding

- [ ] **Billing system** (28h)
  - Usage-based billing
  - Invoice generation
  - Payment processing

#### Scaling Infrastructure

**Tareas:**

- [ ] **Auto-scaling setup** (24h)
  - Horizontal pod autoscaling
  - Cluster scaling
  - Resource optimization

### Sprint 11-12 (Semanas 21-24): Advanced Analytics

**Horas:** 192h | **Coste:** €19,200

#### Business Intelligence

**Tareas:**

- [ ] **Analytics engine** (40h)
  - Data warehouse setup
  - ETL pipelines
  - Real-time analytics

- [ ] **Dashboard development** (32h)
  - Interactive dashboards
  - Custom reports
  - Data visualization

- [ ] **KPI tracking** (20h)
  - Business metrics
  - Performance indicators
  - Trend analysis

#### Predictive Analytics

**Tareas:**

- [ ] **Cash flow prediction** (32h)
  - ML models
  - Forecasting algorithms
  - Prediction accuracy

- [ ] **Customer insights** (24h)
  - Behavior analysis
  - Segmentation
  - Retention metrics

- [ ] **Risk assessment** (20h)
  - Credit risk evaluation
  - Fraud detection
  - Compliance monitoring

#### Reporting Automation

**Tareas:**

- [ ] **Automated reports** (24h)
  - Scheduled reporting
  - Email notifications
  - Export automation

---

## 🌐 FASE 3: EXPANSIÓN B2B

**Duración:** 16-20 semanas (8-10 sprints)  
**Prioridad:** 🟢 MEDIA  
**Budget:** €89,600

### Objetivos Principales

1. **PEPPOL BIS 3.0 Implementation**
2. **Enterprise Features**
3. **API Marketplace**
4. **International Expansion**

### Sprint 13-15 (Semanas 25-30): PEPPOL Foundation

**Horas:** 288h | **Coste:** €28,800

#### UBL 2.1 Implementation

**Tareas:**

- [ ] **UBL schema integration** (48h)
  - UBL 2.1 schemas
  - Document transformation
  - Validation engine

- [ ] **CIUS-ES compliance** (40h)
  - Spanish customization
  - Validation rules
  - Testing suite

- [ ] **Document routing** (32h)
  - PEPPOL participant IDs
  - Routing mechanisms
  - Directory integration

#### AS4/ebMS3 Integration

**Tareas:**

- [ ] **AS4 protocol implementation** (56h)
  - ebMS3 messaging
  - WS-Security
  - Reliable messaging

- [ ] **Receipt handling** (24h)
  - AS4 receipts
  - Error management
  - Status tracking

- [ ] **Compression support** (16h)
  - Document compression
  - Bandwidth optimization
  - Performance tuning

#### PEPPOL Network Integration

**Tareas:**

- [ ] **Access Point setup** (40h)
  - PEPPOL AP configuration
  - Certificate management
  - Network connectivity

- [ ] **SMP integration** (24h)
  - Service Metadata Publisher
  - Endpoint discovery
  - Capability publishing

- [ ] **Testing and certification** (32h)
  - PEPPOL test environment
  - Conformance testing
  - Certification process

### Sprint 16-18 (Semanas 31-36): Enterprise Features

**Horas:** 288h | **Coste:** €28,800

#### Workflow Management

**Tareas:**

- [ ] **Approval workflows** (48h)
  - Multi-step approvals
  - Role-based workflows
  - Escalation rules

- [ ] **Document lifecycle** (32h)
  - Status tracking
  - Version control
  - Archive management

- [ ] **Integration APIs** (40h)
  - ERP integration
  - Accounting software APIs
  - Data synchronization

#### Advanced Security

**Tareas:**

- [ ] **Enterprise SSO** (40h)
  - SAML integration
  - LDAP connectivity
  - Identity federation

- [ ] **Advanced audit** (24h)
  - Detailed audit trails
  - Compliance reporting
  - Data lineage

- [ ] **Backup and disaster recovery** (32h)
  - Automated backups
  - Recovery procedures
  - Business continuity

#### Performance Optimization

**Tareas:**

- [ ] **High availability** (40h)
  - Multi-region deployment
  - Failover mechanisms
  - Load balancing

- [ ] **Performance tuning** (24h)
  - Database optimization
  - Caching strategies
  - CDN optimization

- [ ] **Monitoring enhancement** (32h)
  - Advanced metrics
  - Alerting rules
  - Performance dashboards

### Sprint 19-20 (Semanas 37-40): API Marketplace

**Horas:** 320h | **Coste:** €32,000

#### API Management Platform

**Tareas:**

- [ ] **API gateway enhancement** (48h)
  - Developer portal
  - API versioning
  - Rate limiting

- [ ] **Documentation system** (32h)
  - Interactive documentation
  - Code examples
  - SDK generation

- [ ] **Developer tools** (40h)
  - API testing tools
  - Sandbox environment
  - Mock services

#### Partner Ecosystem

**Tareas:**

- [ ] **Partner onboarding** (40h)
  - Registration process
  - Approval workflows
  - Integration testing

- [ ] **Revenue sharing** (32h)
  - Usage tracking
  - Billing integration
  - Commission calculation

- [ ] **Marketplace UI** (48h)
  - API catalog
  - Partner profiles
  - Usage analytics

#### Integration Framework

**Tareas:**

- [ ] **Connector framework** (48h)
  - Plugin architecture
  - Integration templates
  - Testing framework

- [ ] **Data transformation** (32h)
  - Format conversion
  - Mapping tools
  - Validation engine

---

## 💰 ANÁLISIS FINANCIERO DETALLADO

### Desglose de Costes por Fase

#### Fase 1 - Consolidación (€38,400)

| Sprint   | Semanas | Horas | Coste  | Actividades Principales     |
| -------- | ------- | ----- | ------ | --------------------------- |
| Sprint 1 | 1-2     | 96h   | €9,600 | Auth-service + API Gateway  |
| Sprint 2 | 3-4     | 96h   | €9,600 | Kubernetes + Infrastructure |
| Sprint 3 | 5-6     | 96h   | €9,600 | Performance + Testing       |
| Sprint 4 | 7-8     | 96h   | €9,600 | MVP Finalization            |

#### Fase 2 - Compliance (€64,000)

| Sprint       | Semanas | Horas | Coste   | Actividades Principales   |
| ------------ | ------- | ----- | ------- | ------------------------- |
| Sprint 5-6   | 9-12    | 192h  | €19,200 | AEAT/SII Certification    |
| Sprint 7-8   | 13-16   | 192h  | €19,200 | Banking Integration       |
| Sprint 9-10  | 17-20   | 192h  | €19,200 | Multi-tenant Architecture |
| Sprint 11-12 | 21-24   | 192h  | €19,200 | Advanced Analytics        |

#### Fase 3 - Expansión B2B (€89,600)

| Sprint       | Semanas | Horas | Coste   | Actividades Principales |
| ------------ | ------- | ----- | ------- | ----------------------- |
| Sprint 13-15 | 25-30   | 288h  | €28,800 | PEPPOL Foundation       |
| Sprint 16-18 | 31-36   | 288h  | €28,800 | Enterprise Features     |
| Sprint 19-20 | 37-40   | 320h  | €32,000 | API Marketplace         |

### ROI Proyectado por Fase

#### Fase 1 - ROI Inmediato

**Inversión:** €38,400  
**Tiempo hasta ROI:** 2-3 meses  
**Beneficios:**

- MVP funcional en mercado
- Validación product-market fit
- Primeros ingresos estimados: €15,000/mes
- **ROI Break-even:** 3 meses

#### Fase 2 - ROI Medio Plazo

**Inversión:** €64,000  
**Tiempo hasta ROI:** 6-8 meses  
**Beneficios:**

- Compliance completo = precio premium
- Integraciones bancarias = retención usuarios
- Multi-tenant = escalabilidad B2B
- **Ingresos estimados:** €45,000/mes
- **ROI Break-even:** 5 meses

#### Fase 3 - ROI Largo Plazo

**Inversión:** €89,600  
**Tiempo hasta ROI:** 12-18 meses  
**Beneficios:**

- PEPPOL = mercado europeo
- Enterprise features = clientes grandes
- API marketplace = ingresos recurrentes
- **Ingresos estimados:** €150,000/mes
- **ROI Break-even:** 8 meses

---

## ⚡ HITOS Y ENTREGABLES

### Fase 1 - Hitos Críticos

#### Semana 2: ✅ Auth-service Completado

**Entregables:**

- [ ] Auth API funcional al 100%
- [ ] Tests cobertura >90%
- [ ] Documentación API completa
- [ ] Integration testing passed

**Criterios de Aceptación:**

- Login/logout funcionando
- 2FA implementado y testado
- Role-based access operativo
- Performance <200ms

#### Semana 4: ✅ Infrastructure Production-Ready

**Entregables:**

- [ ] Kubernetes cluster operativo
- [ ] CI/CD pipeline funcionando
- [ ] Monitoring stack activo
- [ ] Security hardening completo

**Criterios de Aceptación:**

- Deployment automático funcional
- Monitoring y alertas operativas
- Security audit passed
- Load testing satisfactorio

#### Semana 6: ✅ Performance Optimizado

**Entregables:**

- [ ] Frontend optimizado
- [ ] Backend performance tuned
- [ ] Database queries optimized
- [ ] Tests coverage >90%

**Criterios de Aceptación:**

- Core Web Vitals >90
- API response time <200ms
- Database queries <50ms
- Test coverage >90%

#### Semana 8: 🚀 MVP Launch Ready

**Entregables:**

- [ ] MVP completamente funcional
- [ ] Production deployment exitoso
- [ ] User documentation completa
- [ ] Support procedures ready

**Criterios de Aceptación:**

- Todas las funcionalidades core operativas
- Zero critical bugs
- Performance SLA cumplidos
- User acceptance testing passed

### Fase 2 - Hitos Compliance

#### Semana 12: 🛡️ AEAT/SII Certified

**Entregables:**

- [ ] Certificación AEAT obtenida
- [ ] Integration testing completado
- [ ] Production SII operativo
- [ ] Compliance documentation

**Criterios de Aceptación:**

- AEAT certification oficial
- Real transaction testing successful
- Error handling robusto
- Audit trail completo

#### Semana 16: 🏦 Banking Integration Live

**Entregables:**

- [ ] Open Banking APIs integradas
- [ ] Payment processing operativo
- [ ] Reconciliation automation
- [ ] Financial reporting

**Criterios de Aceptación:**

- PSD2 compliance verificado
- Automated reconciliation >95%
- Real-time balance updates
- Security audit passed

#### Semana 20: 🏢 Multi-tenant Ready

**Entregables:**

- [ ] Tenant isolation completo
- [ ] Admin portal operativo
- [ ] Billing system functional
- [ ] Auto-scaling configured

**Criterios de Aceptación:**

- Perfect tenant isolation
- Admin portal fully functional
- Automated billing working
- Scaling under load tested

#### Semana 24: 📊 Advanced Analytics Live

**Entregables:**

- [ ] BI engine operativo
- [ ] Dashboards interactivos
- [ ] Predictive analytics
- [ ] Automated reporting

**Criterios de Aceptación:**

- Real-time analytics working
- Custom dashboards functional
- ML predictions accurate >80%
- Automated reports delivered

### Fase 3 - Hitos Expansión

#### Semana 30: 🌐 PEPPOL Foundation

**Entregables:**

- [ ] UBL 2.1 implementation
- [ ] AS4/ebMS3 integration
- [ ] PEPPOL network connectivity
- [ ] Initial PEPPOL certification

**Criterios de Aceptación:**

- UBL documents validated
- AS4 messaging working
- PEPPOL test transactions successful
- Conformance testing passed

#### Semana 36: 🏢 Enterprise Features

**Entregables:**

- [ ] Workflow management
- [ ] Enterprise SSO
- [ ] High availability setup
- [ ] Advanced monitoring

**Criterios de Aceptación:**

- Complex workflows functional
- SSO integration tested
- 99.9% uptime achieved
- Advanced metrics collecting

#### Semana 40: 🛒 API Marketplace Live

**Entregables:**

- [ ] API management platform
- [ ] Partner ecosystem
- [ ] Integration framework
- [ ] Revenue sharing system

**Criterios de Aceptación:**

- Developer portal functional
- First partners onboarded
- Integration connectors working
- Revenue tracking operational

---

## 🎯 FACTORES DE ÉXITO

### Métricas de Seguimiento

#### Técnicas

- **Code Quality:** SonarQube score >8.0
- **Test Coverage:** >90% en todos los componentes
- **Performance:** <200ms API response time
- **Uptime:** >99.9% availability
- **Security:** Zero critical vulnerabilities

#### Negocio

- **Time to Market:** Fase 1 en 8 semanas máximo
- **User Adoption:** >100 usuarios activos en 3 meses
- **Revenue Growth:** €15k/mes en 6 meses
- **Customer Satisfaction:** NPS >50
- **Market Penetration:** 1% mercado autónomos español

#### Compliance

- **AEAT Certification:** Obtenida en semana 12
- **RGPD Compliance:** 100% cumplimiento
- **Security Audit:** A+ rating
- **PEPPOL Certification:** Fase 3 completada
- **Banking Integration:** PSD2 fully compliant

### Riesgos por Fase

#### Fase 1 - Riesgos Técnicos

**Alto:** Complejidad Kubernetes setup  
**Mitigación:** Consultor DevOps especializado  
**Contingencia:** Cloud managed services

**Medio:** Performance bottlenecks  
**Mitigación:** Load testing continuo  
**Contingencia:** Architecture optimization

#### Fase 2 - Riesgos Regulatorios

**Alto:** Cambios normativos AEAT  
**Mitigación:** Monitoring regulatorio  
**Contingencia:** Rapid adaptation capability

**Medio:** Banking API changes  
**Mitigación:** Multiple provider strategy  
**Contingencia:** Fallback mechanisms

#### Fase 3 - Riesgos de Mercado

**Alto:** Competencia enterprise  
**Mitigación:** First-mover advantage  
**Contingencia:** Diferenciación features

**Medio:** PEPPOL adoption slow  
**Mitigación:** Education & marketing  
**Contingencia:** Focus mercado nacional

---

## 📅 CRONOGRAMA EJECUTIVO

### Timeline Consolidado

```
ENERO 2025    │ FASE 1: CONSOLIDACIÓN
[████████████] │ Sprint 1-4: MVP Production Ready
              │
MARZO 2025    │ FASE 2: COMPLIANCE
[████████████] │ Sprint 5-8: AEAT + Banking
              │
JUNIO 2025    │ FASE 2: MULTI-TENANT
[████████████] │ Sprint 9-12: Analytics + Scaling
              │
OCTUBRE 2025  │ FASE 3: EXPANSIÓN B2B
[████████████] │ Sprint 13-16: PEPPOL + Enterprise
              │
ENERO 2026    │ FASE 3: MARKETPLACE
[████████████] │ Sprint 17-20: API Ecosystem
              │
MARZO 2026    │ ✅ PROYECTO COMPLETADO
```

### Dependencias Críticas

1. **Fase 1 → Fase 2:** MVP funcional requerido
2. **Auth-service → API Gateway:** Autenticación prereq
3. **AEAT Integration → Multi-tenant:** Compliance base
4. **Multi-tenant → Enterprise:** Architecture base
5. **PEPPOL → Marketplace:** B2B foundation

### Recursos Requeridos

#### Team Composition

**Fase 1 (2 desarrolladores):**

- 1x Senior Full-stack Developer
- 1x DevOps Engineer

**Fase 2 (3 desarrolladores):**

- 1x Senior Backend Developer
- 1x Frontend Developer
- 1x Integration Specialist

**Fase 3 (4 desarrolladores):**

- 1x Senior Architect
- 1x Backend Developer
- 1x Frontend Developer
- 1x QA Engineer

### Budget Allocation

| Categoría        | Fase 1  | Fase 2  | Fase 3  | Total    |
| ---------------- | ------- | ------- | ------- | -------- |
| **Desarrollo**   | €32,000 | €54,000 | €75,000 | €161,000 |
| **DevOps/Infra** | €4,000  | €6,000  | €8,000  | €18,000  |
| **Testing/QA**   | €2,000  | €3,000  | €4,000  | €9,000   |
| **Compliance**   | €400    | €1,000  | €2,600  | €4,000   |
| **TOTAL**        | €38,400 | €64,000 | €89,600 | €192,000 |

---

**Preparado por:** GitHub Copilot Agent  
**Fecha:** Diciembre 2024  
**Versión:** 1.0  
**Próxima revisión:** Enero 2025  
**Aprobación:** Pendiente
