#!/bin/bash

# 🔄 SCRIPT DE MANTENIMIENTO AUTOMÁTICO DE DEPENDENCIAS
# Este script automatiza la actualización segura de dependencias

set -e

echo "🔄 MANTENIMIENTO AUTOMÁTICO DE DEPENDENCIAS"
echo "==========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}🚨 $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }

# Configuración
BACKUP_DIR="./dependency-backups"
DRY_RUN=${1:-false}

if [ "$DRY_RUN" = "--dry-run" ]; then
    log_info "Modo DRY RUN activado - No se realizarán cambios"
    DRY_RUN=true
else
    DRY_RUN=false
fi

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"

# 1. BACKUP DE ARCHIVOS CRÍTICOS
echo "💾 1. CREANDO BACKUP DE ARCHIVOS CRÍTICOS"
echo "========================================"

backup_files=(
    "package.json"
    "package-lock.json"
    "yarn.lock"
    "pnpm-lock.yaml"
)

timestamp=$(date +%Y%m%d_%H%M%S)
backup_folder="$BACKUP_DIR/backup_$timestamp"

if [ "$DRY_RUN" = false ]; then
    mkdir -p "$backup_folder"
    
    for file in "${backup_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$backup_folder/"
            log_success "Backup creado: $file"
        fi
    done
else
    log_info "DRY RUN: Se crearían backups de package files"
fi

echo ""

# 2. ANÁLISIS DE DEPENDENCIAS ACTUALES
echo "🔍 2. ANÁLISIS DE DEPENDENCIAS ACTUALES"
echo "======================================"

log_info "Analizando dependencias instaladas..."

# Obtener lista de dependencias directas
if [ -f "package.json" ]; then
    direct_deps=$(jq -r '.dependencies // {} | keys[]' package.json 2>/dev/null | wc -l)
    dev_deps=$(jq -r '.devDependencies // {} | keys[]' package.json 2>/dev/null | wc -l)
    
    log_info "Dependencias directas: $direct_deps"
    log_info "Dependencias de desarrollo: $dev_deps"
else
    log_error "No se encontró package.json"
    exit 1
fi

echo ""

# 3. VERIFICACIÓN DE VULNERABILIDADES ANTES DE ACTUALIZAR
echo "🔐 3. VERIFICACIÓN DE VULNERABILIDADES PRE-ACTUALIZACIÓN"
echo "======================================================="

log_info "Ejecutando auditoría de seguridad inicial..."

if npm audit --json > pre_update_audit.json 2>/dev/null; then
    pre_vulns=$(jq '.metadata.vulnerabilities.total // 0' pre_update_audit.json 2>/dev/null || echo 0)
    log_info "Vulnerabilidades detectadas antes de actualizar: $pre_vulns"
else
    log_warning "Error al ejecutar npm audit inicial"
    pre_vulns=0
fi

echo ""

# 4. ACTUALIZACIÓN AUTOMÁTICA DE VULNERABILIDADES CRÍTICAS
echo "🚨 4. CORRECCIÓN AUTOMÁTICA DE VULNERABILIDADES"
echo "=============================================="

if [ "$pre_vulns" -gt 0 ]; then
    log_info "Intentando corrección automática de vulnerabilidades..."
    
    if [ "$DRY_RUN" = false ]; then
        if npm audit fix --dry-run > audit_fix_preview.txt 2>&1; then
            log_info "Vista previa de correcciones disponibles:"
            head -20 audit_fix_preview.txt
            
            read -p "¿Proceder con npm audit fix? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                npm audit fix
                log_success "Correcciones automáticas aplicadas"
            else
                log_info "Correcciones automáticas omitidas por el usuario"
            fi
        else
            log_warning "No se pudieron aplicar correcciones automáticas"
        fi
    else
        log_info "DRY RUN: Se ejecutaría npm audit fix"
    fi
else
    log_success "No se detectaron vulnerabilidades para corregir"
fi

echo ""

# 5. ACTUALIZACIÓN INTELIGENTE DE DEPENDENCIAS
echo "📦 5. ACTUALIZACIÓN INTELIGENTE DE DEPENDENCIAS"
echo "=============================================="

# Lista de paquetes que requieren atención manual
manual_update_packages=(
    "next"
    "react"
    "react-dom"
    "@types/node"
    "typescript"
    "tailwindcss"
    "prisma"
    "@prisma/client"
)

log_info "Analizando actualizaciones disponibles..."

if npm outdated --json > outdated.json 2>/dev/null || true; then
    if [ -s outdated.json ] && [ "$(cat outdated.json)" != "{}" ]; then
        log_info "Paquetes desactualizados detectados"
        
        # Categorizar actualizaciones
        echo ""
        echo "📊 CATEGORIZACIÓN DE ACTUALIZACIONES:"
        
        # Actualizaciones menores (patch y minor)
        safe_updates=()
        manual_updates=()
        
        # Procesar cada paquete desactualizado
        for package in $(jq -r 'keys[]' outdated.json 2>/dev/null); do
            current=$(jq -r ".\"$package\".current" outdated.json)
            latest=$(jq -r ".\"$package\".latest" outdated.json)
            wanted=$(jq -r ".\"$package\".wanted" outdated.json)
            
            # Verificar si es un paquete que requiere atención manual
            if [[ " ${manual_update_packages[@]} " =~ " ${package} " ]]; then
                manual_updates+=("$package")
                echo "  ⚠️  $package: $current → $latest (MANUAL)"
            else
                # Si wanted != current, es una actualización segura
                if [ "$wanted" != "$current" ]; then
                    safe_updates+=("$package")
                    echo "  ✅ $package: $current → $wanted (SEGURA)"
                else
                    manual_updates+=("$package")
                    echo "  ⚠️  $package: $current → $latest (MAJOR)"
                fi
            fi
        done
        
        echo ""
        
        # Aplicar actualizaciones seguras
        if [ ${#safe_updates[@]} -gt 0 ]; then
            log_info "Aplicando ${#safe_updates[@]} actualizaciones seguras..."
            
            if [ "$DRY_RUN" = false ]; then
                for package in "${safe_updates[@]}"; do
                    log_info "Actualizando $package..."
                    npm update "$package" || log_warning "Error al actualizar $package"
                done
            else
                log_info "DRY RUN: Se actualizarían: ${safe_updates[*]}"
            fi
        fi
        
        # Reportar actualizaciones manuales
        if [ ${#manual_updates[@]} -gt 0 ]; then
            log_warning "Las siguientes actualizaciones requieren revisión manual:"
            for package in "${manual_updates[@]}"; do
                echo "  - $package"
            done
        fi
        
    else
        log_success "Todas las dependencias están actualizadas"
    fi
else
    log_info "No se pudo verificar el estado de las dependencias"
fi

echo ""

# 6. VERIFICACIÓN POST-ACTUALIZACIÓN
echo "🔍 6. VERIFICACIÓN POST-ACTUALIZACIÓN"
echo "===================================="

if [ "$DRY_RUN" = false ]; then
    log_info "Ejecutando auditoría post-actualización..."
    
    if npm audit --json > post_update_audit.json 2>/dev/null; then
        post_vulns=$(jq '.metadata.vulnerabilities.total // 0' post_update_audit.json 2>/dev/null || echo 0)
        
        improvement=$((pre_vulns - post_vulns))
        
        log_info "Vulnerabilidades después de actualizar: $post_vulns"
        
        if [ "$improvement" -gt 0 ]; then
            log_success "¡Mejora! Se redujeron $improvement vulnerabilidades"
        elif [ "$improvement" -lt 0 ]; then
            log_warning "Se incrementaron $((-improvement)) vulnerabilidades"
        else
            log_info "No hay cambios en vulnerabilidades"
        fi
    fi
    
    # Verificar que el proyecto aún compila
    log_info "Verificando integridad del proyecto..."
    
    if npm run type-check >/dev/null 2>&1 || npm run build >/dev/null 2>&1; then
        log_success "El proyecto compila correctamente"
    else
        log_error "El proyecto tiene errores de compilación - considerar rollback"
    fi
fi

echo ""

# 7. GENERACIÓN DE REPORTE
echo "📊 7. GENERACIÓN DE REPORTE"
echo "=========================="

report_file="dependency_maintenance_report_$timestamp.md"

if [ "$DRY_RUN" = false ]; then
    cat > "$report_file" << EOF
# 📦 Reporte de Mantenimiento de Dependencias

**Fecha:** $(date)
**Tipo:** ${DRY_RUN:+DRY RUN}

## 📊 Resumen

- **Vulnerabilidades antes:** $pre_vulns
- **Vulnerabilidades después:** $post_vulns
- **Mejora:** $improvement vulnerabilidades
- **Paquetes actualizados:** ${#safe_updates[@]}
- **Paquetes pendientes:** ${#manual_updates[@]}

## ✅ Actualizaciones Aplicadas

EOF

    if [ ${#safe_updates[@]} -gt 0 ]; then
        for package in "${safe_updates[@]}"; do
            echo "- $package" >> "$report_file"
        done
    else
        echo "Ninguna actualización automática aplicada" >> "$report_file"
    fi

    cat >> "$report_file" << EOF

## ⚠️ Actualizaciones Pendientes de Revisión Manual

EOF

    if [ ${#manual_updates[@]} -gt 0 ]; then
        for package in "${manual_updates[@]}"; do
            echo "- $package" >> "$report_file"
        done
    else
        echo "Ninguna actualización manual pendiente" >> "$report_file"
    fi

    cat >> "$report_file" << EOF

## 🔗 Enlaces Útiles

- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Keeping dependencies up to date](https://docs.npmjs.com/updating-packages-downloaded-from-the-registry)
- [Semantic Versioning](https://semver.org/)

## 📝 Notas

Backup creado en: $backup_folder
EOF

    log_success "Reporte generado: $report_file"
fi

# Limpieza de archivos temporales
rm -f pre_update_audit.json post_update_audit.json outdated.json audit_fix_preview.txt

echo ""
echo "✅ MANTENIMIENTO DE DEPENDENCIAS COMPLETADO"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "🔄 Para aplicar los cambios, ejecuta sin --dry-run"
fi

echo "💡 PRÓXIMOS PASOS RECOMENDADOS:"
echo "  1. Revisar el reporte generado"
echo "  2. Testear la aplicación exhaustivamente"
echo "  3. Actualizar manualmente paquetes críticos si es necesario"
echo "  4. Considerar configurar dependabot para automatización"
