# 📚 Índice de Documentación - TributariApp

## 🎯 Documentos Principales

### 🤖 Para GitHub Copilot

- **[COPILOT_CONTEXT.md](./COPILOT_CONTEXT.md)** - Contexto completo del proyecto para IA
- **[.copilot-instructions.md](../.copilot-instructions.md)** - Instrucciones específicas de desarrollo
- **[DEV_README.md](./technical/DEV_README.md)** - README técnico para desarrollo

### 📋 Gestión de Tareas

- **[TASK_ORDER.md](./tasks/TASK_ORDER.md)** - Orden prioritario de tareas técnicas
- **[NEXT_TASKS_FORECAST.md](./tasks/NEXT_TASKS_FORECAST.md)** - Previsión y planificación de próximas tareas

## 🏛️ Architecture Decision Records (ADRs)

### Decisiones Arquitectónicas Implementadas

- **[ADR-001](./adr/ADR-001-monorepo-architecture.md)** - Arquitectura de Monorepo con Yarn Workspaces
- **[ADR-002](./adr/ADR-002-nextjs-app-router.md)** - Frontend con Next.js 14 App Router
- **[ADR-003](./adr/ADR-003-design-system.md)** - Sistema de Diseño con Tailwind CSS + shadcn/ui
- **[ADR-004](./adr/ADR-004-database-prisma.md)** - Base de datos y ORM (Prisma + PostgreSQL)
- **[ADR-005](./adr/ADR-005-authentication-authorization.md)** - Autenticación y autorización (JWT + bcrypt)
- **[ADR-006](./adr/ADR-006-aeat-sii-integration.md)** - Integración con AEAT/SII
- **[ADR-007](./adr/ADR-007-testing-strategy.md)** - Estrategia de Testing (Jest + Cypress)
- **[ADR-008](./adr/ADR-008-configuration-optimization.md)** - Optimización de Configuración para Desarrollo con IA

### Próximos ADRs Planificados

- **ADR-009** - CI/CD Pipeline (GitLab CI)
- **ADR-010** - Monitoring y Observabilidad
- **ADR-011** - Security & Compliance

## 📁 Estructura de Documentación

\`\`\`
docs/
├── COPILOT_CONTEXT.md # 🤖 Contexto principal para IA
├── INDEX.md # 📚 Este archivo - índice general
├── adr/ # 🏛️ Architecture Decision Records
│ ├── ADR-001-monorepo-architecture.md
│ ├── ADR-002-nextjs-app-router.md
│ └── ADR-003-design-system.md
├── technical/ # 🔧 Documentación técnica
│ ├── DEV_README.md # README para desarrollo
│ ├── API_SPECS.md # Especificaciones de API (próximo)
│ ├── COMPONENT_GUIDE.md # Guía de componentes (próximo)
│ └── DEPLOYMENT.md # Guía de despliegue (próximo)
├── tasks/ # 📋 Gestión de tareas
│ ├── TASK_ORDER.md # Orden de tareas técnicas
│ ├── NEXT_TASKS_FORECAST.md # Previsión de próximas tareas
│ └── SPRINT_TEMPLATES.md # Plantillas de sprint (próximo)
└── user/ # 👥 Documentación de usuario (futuro)
├── USER_GUIDE.md # Guía de usuario
└── FAQ.md # Preguntas frecuentes
\`\`\`

## 🎯 Cómo Usar Esta Documentación

### Para Desarrolladores

1. **Empezar con**: [DEV_README.md](./technical/DEV_README.md)
2. **Entender arquitectura**: Leer ADRs en orden
3. **Planificar trabajo**: [TASK_ORDER.md](./tasks/TASK_ORDER.md)
4. **Desarrollo diario**: [COPILOT_CONTEXT.md](./COPILOT_CONTEXT.md) como referencia

### Para GitHub Copilot

1. **Contexto principal**: [COPILOT_CONTEXT.md](./COPILOT_CONTEXT.md)
2. **Instrucciones específicas**: [.copilot-instructions.md](../.copilot-instructions.md)
3. **Patrones de código**: Ejemplos en [DEV_README.md](./technical/DEV_README.md)

### Para Project Managers

1. **Estado del proyecto**: [TASK_ORDER.md](./tasks/TASK_ORDER.md)
2. **Planificación**: [NEXT_TASKS_FORECAST.md](./tasks/NEXT_TASKS_FORECAST.md)
3. **Decisiones técnicas**: ADRs para entender el por qué

## 📊 Estado de la Documentación

### ✅ Completado (Julio 2025)

- [x] Contexto base para Copilot
- [x] ADRs de arquitectura fundamentales
- [x] Orden de tareas técnicas
- [x] Previsión de próximas tareas
- [x] README de desarrollo

### 🔄 En Progreso

- [ ] **API Specifications**: Documentar endpoints y schemas
- [ ] **Component Guide**: Guía detallada de componentes UI
- [ ] **Testing Guide**: Estrategias y ejemplos de testing

### ⏳ Planificado

- [ ] **Deployment Guide**: Guía de despliegue completa
- [ ] **Sprint Templates**: Plantillas para planning
- [ ] **User Documentation**: Manuales para usuarios finales
- [ ] **Troubleshooting**: Guía de resolución de problemas

## 🔍 Búsqueda Rápida

### Por Tema

- **Arquitectura**: ADR-001, ADR-002, ADR-003
- **Frontend**: ADR-002, ADR-003, DEV_README
- **Desarrollo**: DEV_README, COPILOT_CONTEXT, TASK_ORDER
- **Planificación**: TASK_ORDER, NEXT_TASKS_FORECAST
- **Setup**: DEV_README, .copilot-instructions

### Por Urgencia

- **🔥 Inmediato**: TASK_ORDER (sección crítica)
- **⚡ Esta semana**: NEXT_TASKS_FORECAST (sprint actual)
- **📈 Próximo mes**: NEXT_TASKS_FORECAST (roadmap)

## 📝 Convenciones de Documentación

### Formato de Archivos

- **Markdown**: Todos los archivos en .md
- **Emojis**: Para mejorar legibilidad y navegación
- **Links**: Referencias cruzadas entre documentos
- **Código**: Syntax highlighting apropiado

### Estructura de Documento

1. **Título** con emoji descriptivo
2. **Resumen** ejecutivo al inicio
3. **Secciones** numeradas con emojis
4. **Ejemplos de código** cuando aplique
5. **Metadata** al final (fecha, responsable)

### Mantenimiento

- **Actualización semanal**: TASK_ORDER y NEXT_TASKS_FORECAST
- **Revisión mensual**: ADRs y documentación técnica
- **Versionado**: Git commits descriptivos
- **Responsabilidad**: Equipo de desarrollo rotativo

---

**📅 Creado**: Julio 2025  
**🔄 Actualización**: Semanal  
**👥 Mantenido por**: Equipo de Desarrollo  
**📧 Contact**: [email del equipo]  
**🔗 Repository**: [link al repo]

> 💡 **Tip**: Usa Ctrl+F para búsqueda rápida en este índice, o el buscador de GitHub para búsqueda global en la documentación.
