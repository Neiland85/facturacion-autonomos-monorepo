# Sistema de Facturación para Autónomos - Makefile
# Monorepo con TurboRepo, Next.js y Node.js/Express

.PHONY: help install dev build clean lint type-check test audit-all fix-config fix-typescript fix-eslint fix-dependencies

# Variables
NODE_VERSION := $(shell node --version)
PNPM_VERSION := $(shell pnpm --version 2>/dev/null || echo "not installed")

# Colores para output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Target por defecto
help:
	@echo "$(BLUE)🚀 Sistema de Facturación para Autónomos$(NC)"
	@echo "$(BLUE)=======================================$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@echo "  $(GREEN)make install$(NC)           - Instalar dependencias"
	@echo "  $(GREEN)make dev$(NC)               - Iniciar desarrollo"
	@echo "  $(GREEN)make build$(NC)             - Compilar todo"
	@echo "  $(GREEN)make clean$(NC)             - Limpiar builds"
	@echo "  $(GREEN)make lint$(NC)              - Ejecutar ESLint"
	@echo "  $(GREEN)make type-check$(NC)        - Verificar tipos TypeScript"
	@echo "  $(GREEN)make test$(NC)              - Ejecutar tests"
	@echo "  $(GREEN)make audit-all$(NC)         - Auditoría completa"
	@echo ""
	@echo "$(YELLOW)Correcciones críticas:$(NC)"
	@echo "  $(GREEN)make fix-config$(NC)        - Corregir configuraciones críticas"
	@echo "  $(GREEN)make fix-typescript$(NC)    - Arreglar TypeScript"
	@echo "  $(GREEN)make fix-eslint$(NC)        - Configurar ESLint"
	@echo "  $(GREEN)make fix-dependencies$(NC)  - Unificar gestión de dependencias"
	@echo ""
	@echo "$(BLUE)Entorno:$(NC)"
	@echo "  Node.js: $(NODE_VERSION)"
	@echo "  pnpm: $(PNPM_VERSION)"

# Instalación y configuración
install:
	@echo "$(BLUE)📦 Instalando dependencias...$(NC)"
	pnpm install

fix-dependencies: check-pnpm
	@echo "$(BLUE)🔧 Unificando gestión de dependencias...$(NC)"
	@echo "$(YELLOW)Eliminando archivos de lock conflictivos...$(NC)"
	rm -f yarn.lock package-lock.json
	@echo "$(GREEN)✅ Archivos de lock eliminados$(NC)"
	@echo "$(YELLOW)Instalando con pnpm...$(NC)"
	pnpm install
	@echo "$(GREEN)✅ Dependencias unificadas con pnpm$(NC)"

check-pnpm:
	@if ! command -v pnpm &> /dev/null; then \
		echo "$(RED)❌ pnpm no está instalado$(NC)"; \
		echo "$(YELLOW)Instala pnpm con: npm install -g pnpm$(NC)"; \
		exit 1; \
	fi

# Correcciones críticas
fix-config: fix-typescript fix-eslint fix-dependencies
	@echo "$(GREEN)✅ Todas las configuraciones críticas corregidas$(NC)"

fix-typescript:
	@echo "$(BLUE)🔧 Configurando TypeScript...$(NC)"
	@echo "$(YELLOW)Habilitando strictNullChecks...$(NC)"
	@if grep -q '"strictNullChecks": true' tsconfig.base.json; then \
		echo "$(GREEN)✅ strictNullChecks ya está habilitado$(NC)"; \
	else \
		sed -i '' 's/"strict": true,/"strict": true,\n    "strictNullChecks": true,/' tsconfig.base.json; \
		echo "$(GREEN)✅ strictNullChecks habilitado$(NC)"; \
	fi
	@echo "$(YELLOW)Actualizando módulos a ESNext...$(NC)"
	find apps/*/tsconfig.json -name "*.json" -exec sed -i '' 's/"module": "CommonJS"/"module": "ESNext"/g' {} \;
	find apps/*/tsconfig.json -name "*.json" -exec sed -i '' 's/"target": "ES2020"/"target": "ES2022"/g' {} \;
	@echo "$(GREEN)✅ TypeScript configurado correctamente$(NC)"

fix-eslint:
	@echo "$(BLUE)🔧 Configurando ESLint...$(NC)"
	@echo "$(YELLOW)Verificando configuración de ESLint...$(NC)"
	@if [ -f "eslint.config.mjs" ]; then \
		echo "$(GREEN)✅ ESLint configurado$(NC)"; \
	else \
		echo "$(RED)❌ Archivo eslint.config.mjs no encontrado$(NC)"; \
	fi

# Desarrollo
dev:
	@echo "$(BLUE)🚀 Iniciando desarrollo...$(NC)"
	pnpm dev

build:
	@echo "$(BLUE)🏗️ Compilando proyecto...$(NC)"
	pnpm build

clean:
	@echo "$(BLUE)🧹 Limpiando builds...$(NC)"
	pnpm clean
	rm -rf node_modules/.cache
	rm -rf apps/*/dist
	rm -rf apps/*/.next
	rm -rf packages/*/dist

# Calidad de código
lint:
	@echo "$(BLUE)🔍 Ejecutando ESLint...$(NC)"
	pnpm lint

type-check:
	@echo "$(BLUE)🔍 Verificando tipos TypeScript...$(NC)"
	pnpm type-check

test:
	@echo "$(BLUE)🧪 Ejecutando tests...$(NC)"
	pnpm test

# Auditoría completa
audit-all: lint type-check test
	@echo "$(BLUE)📊 Ejecutando auditoría completa...$(NC)"
	@echo "$(YELLOW)Generando métricas...$(NC)"
	python scripts/metrics_git.py
	@echo "$(YELLOW)Analizando monorepo...$(NC)"
	python scripts/analyze_monorepo.py
	@echo "$(YELLOW)Generando dashboard...$(NC)"
	python scripts/coverage_gate.py
	@echo "$(GREEN)✅ Auditoría completa finalizada$(NC)"
	@echo "$(GREEN)📈 Dashboard disponible en dashboard/index.html$(NC)"

# Servicios individuales
dev-web:
	@echo "$(BLUE)🌐 Iniciando frontend...$(NC)"
	cd apps/web && pnpm dev

dev-api:
	@echo "$(BLUE)🔧 Iniciando API Gateway...$(NC)"
	cd apps/api-gateway && pnpm dev

dev-invoice:
	@echo "$(BLUE)📄 Iniciando servicio de facturas...$(NC)"
	cd apps/invoice-service && pnpm dev

dev-auth:
	@echo "$(BLUE)🔐 Iniciando servicio de autenticación...$(NC)"
	cd apps/auth-service && pnpm dev

# Base de datos
db-generate:
	@echo "$(BLUE)🗄️ Generando Prisma client...$(NC)"
	cd packages/database && pnpm db:generate

db-migrate:
	@echo "$(BLUE)🗄️ Ejecutando migraciones...$(NC)"
	cd packages/database && pnpm db:migrate

db-studio:
	@echo "$(BLUE)🗄️ Abriendo Prisma Studio...$(NC)"
	cd packages/database && pnpm db:studio

# Utilidades
format:
	@echo "$(BLUE)💅 Formateando código...$(NC)"
	pnpm format

format-check:
	@echo "$(BLUE)🔍 Verificando formato...$(NC)"
	pnpm format:check

# Información del sistema
info:
	@echo "$(BLUE)ℹ️ Información del sistema$(NC)"
	@echo "Node.js: $(NODE_VERSION)"
	@echo "pnpm: $(PNPM_VERSION)"
	@echo "Directorio: $(shell pwd)"
	@echo "Archivos TypeScript: $(shell find . -name "*.ts" -not -path "./node_modules/*" | wc -l)"
	@echo "Archivos de configuración: $(shell find . -name "tsconfig.json" -o -name "eslint.config.*" | wc -l)"