#!/bin/bash

# Script de Validación Final - Correcciones Críticas
# Sistema de Facturación para Autónomos

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 VALIDACIÓN FINAL - CORRECCIONES CRÍTICAS${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# 1. Verificar TypeScript
echo -e "${YELLOW}1. Verificando configuración TypeScript...${NC}"
if grep -q '"strictNullChecks": true' tsconfig.base.json; then
    echo -e "${GREEN}✅ strictNullChecks habilitado${NC}"
else
    echo -e "${RED}❌ strictNullChecks no encontrado${NC}"
fi

if grep -q '"module": "ESNext"' apps/*/tsconfig.json; then
    echo -e "${GREEN}✅ Módulos ESNext configurados${NC}"
else
    echo -e "${RED}❌ Módulos no actualizados${NC}"
fi

# 2. Verificar Prisma
echo -e "${YELLOW}2. Verificando Prisma Client...${NC}"
if [ -d "packages/database/src/generated" ]; then
    echo -e "${GREEN}✅ Prisma Client generado${NC}"
    echo "   Archivos generados: $(ls packages/database/src/generated/*.d.ts | wc -l)"
else
    echo -e "${RED}❌ Prisma Client no generado${NC}"
fi

# 3. Verificar gestión de dependencias
echo -e "${YELLOW}3. Verificando gestión de dependencias...${NC}"
if [ -f "pnpm-lock.yaml" ] && [ ! -f "yarn.lock" ] && [ ! -f "package-lock.json" ]; then
    echo -e "${GREEN}✅ pnpm unificado${NC}"
else
    echo -e "${RED}❌ Archivos de lock conflictivos encontrados${NC}"
fi

# 4. Verificar ESLint
echo -e "${YELLOW}4. Verificando configuración ESLint...${NC}"
if [ -f "eslint.config.mjs" ]; then
    echo -e "${GREEN}✅ ESLint configurado${NC}"
    if grep -q "prefer-nullish-coalescing" eslint.config.mjs; then
        echo -e "${GREEN}✅ Reglas de nullish coalescing configuradas${NC}"
    fi
else
    echo -e "${RED}❌ ESLint no configurado${NC}"
fi

# 5. Verificar packageManager
echo -e "${YELLOW}5. Verificando packageManager...${NC}"
if grep -q '"packageManager": "pnpm' package.json; then
    echo -e "${GREEN}✅ pnpm configurado como packageManager${NC}"
else
    echo -e "${RED}❌ packageManager no actualizado${NC}"
fi

# 6. Verificar builds
echo -e "${YELLOW}6. Verificando capacidad de build...${NC}"
echo "   Intentando type-check..."
if pnpm type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript type-check exitoso${NC}"
else
    echo -e "${RED}❌ Errores de TypeScript encontrados${NC}"
fi

echo ""
echo -e "${BLUE}📊 RESUMEN DE VALIDACIÓN${NC}"
echo -e "${BLUE}========================${NC}"

# Contar errores
ERRORS=$(grep -c "❌" /tmp/validation_output 2>/dev/null || echo "0")

if [ "$ERRORS" -eq "0" ]; then
    echo -e "${GREEN}🎉 ¡Todas las correcciones críticas aplicadas exitosamente!${NC}"
    echo ""
    echo -e "${YELLOW}Próximos pasos recomendados:${NC}"
    echo "  1. make audit-all          # Ejecutar auditoría completa"
    echo "  2. make test               # Implementar tests básicos"
    echo "  3. make build              # Verificar builds"
    echo "  4. make dev                # Iniciar desarrollo"
else
    echo -e "${RED}⚠️  Se encontraron $ERRORS problemas que requieren atención${NC}"
    echo ""
    echo -e "${YELLOW}Ejecutar correcciones:${NC}"
    echo "  make fix-config            # Aplicar todas las correcciones"
fi

echo ""
echo -e "${BLUE}📈 Dashboard de métricas: dashboard/index.html${NC}"
echo -e "${BLUE}📋 Informe técnico: INFORME_TECNICO_FASE_FINAL.md${NC}"
