#!/bin/bash

# 🚀 Script para abrir el workspace aislado de VS Code
# Uso: ./open-workspace.sh

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "🏢 ====================================="
echo "   FACTURACIÓN AUTÓNOMOS WORKSPACE"
echo "   Configuración Aislada de VS Code"
echo "=====================================${NC}"
echo

# Verificar que estamos en el directorio correcto
if [ ! -f "facturacion-autonomos.code-workspace" ]; then
    echo -e "${RED}❌ Error: No se encontró el archivo workspace.${NC}"
    echo -e "${YELLOW}💡 Asegúrate de ejecutar este script desde el directorio raíz del proyecto.${NC}"
    exit 1
fi

# Verificar que VS Code esté instalado
if ! command -v code &> /dev/null; then
    echo -e "${RED}❌ Error: VS Code no está instalado o no está en el PATH.${NC}"
    echo -e "${YELLOW}💡 Instala VS Code y asegúrate de que el comando 'code' esté disponible.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Archivo workspace encontrado${NC}"
echo -e "${GREEN}✅ VS Code detectado${NC}"
echo

# Mostrar información del workspace
echo -e "${BLUE}📦 Información del Workspace:${NC}"
echo "   📁 Archivo: facturacion-autonomos.code-workspace"
echo "   🎯 Proyecto: Facturación Autónomos Monorepo"
echo "   🛠️  Tecnologías: TurboRepo, Next.js, Express, Prisma"
echo

# Preguntar al usuario si quiere continuar
read -p "¿Deseas abrir el workspace aislado? [Y/n]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}❌ Operación cancelada por el usuario.${NC}"
    exit 0
fi

# Abrir VS Code con el workspace
echo -e "${BLUE}🚀 Abriendo workspace aislado...${NC}"
code facturacion-autonomos.code-workspace

echo
echo -e "${GREEN}✅ Workspace abierto exitosamente!${NC}"
echo
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo "   1. 🧩 VS Code instalará las extensiones recomendadas"
echo "   2. ⚙️  Se aplicarán las configuraciones específicas"
echo "   3. 🔧 Estarán disponibles las tasks predefinidas"
echo "   4. 🐛 Podrás usar las debug configurations"
echo
echo -e "${YELLOW}💡 Tip: Usa Ctrl+Shift+P → 'Tasks: Run Task' para ver todas las tareas disponibles${NC}"
echo -e "${YELLOW}💡 Tip: Ve a la pestaña Debug (F5) para usar las configuraciones de debug${NC}"
echo
echo -e "${BLUE}📚 Documentación:${NC}"
echo "   📖 README.md - Guía principal"
echo "   📖 docs/WORKSPACE_AISLADO.md - Guía del workspace"
echo "   📖 docs/ESTADO_FINAL.md - Estado del proyecto"
echo
