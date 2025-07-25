#!/bin/bash

# 🔍 AUDITORÍA DE SEGURIDAD DE DEPENDENCIAS
# Este script verifica vulnerabilidades, dependencias desactualizadas y paquetes abandonados

set -e

echo "🔍 AUDITORÍA DE SEGURIDAD DE DEPENDENCIAS"
echo "========================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
critical_vulns=0
high_vulns=0
medium_vulns=0
low_vulns=0
outdated_packages=0
deprecated_packages=0

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}🚨 $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. AUDITORÍA DE VULNERABILIDADES CONOCIDAS
echo "🔐 1. AUDITORÍA DE VULNERABILIDADES CONOCIDAS"
echo "============================================="

if command_exists npm; then
    log_info "Ejecutando npm audit..."
    
    # Ejecutar npm audit y capturar output
    if npm audit --json > npm_audit.json 2>/dev/null; then
        if [ -s npm_audit.json ]; then
            # Contar vulnerabilidades por severidad
            critical_vulns=$(jq '.vulnerabilities | to_entries[] | select(.value.severity == "critical") | .key' npm_audit.json 2>/dev/null | wc -l || echo 0)
            high_vulns=$(jq '.vulnerabilities | to_entries[] | select(.value.severity == "high") | .key' npm_audit.json 2>/dev/null | wc -l || echo 0)
            medium_vulns=$(jq '.vulnerabilities | to_entries[] | select(.value.severity == "moderate") | .key' npm_audit.json 2>/dev/null | wc -l || echo 0)
            low_vulns=$(jq '.vulnerabilities | to_entries[] | select(.value.severity == "low") | .key' npm_audit.json 2>/dev/null | wc -l || echo 0)
            
            echo "  🚨 Críticas: $critical_vulns"
            echo "  ⚠️  Altas: $high_vulns"
            echo "  📊 Medias: $medium_vulns"
            echo "  ℹ️  Bajas: $low_vulns"
            
            if [ "$critical_vulns" -gt 0 ] || [ "$high_vulns" -gt 0 ]; then
                log_error "Vulnerabilidades críticas o altas detectadas!"
                echo ""
                echo "🔧 RECOMENDACIONES DE SEGURIDAD:"
                jq -r '.vulnerabilities | to_entries[] | select(.value.severity == "critical" or .value.severity == "high") | "  - \(.key): \(.value.severity) - \(.value.via[0].title // "Sin título")"' npm_audit.json 2>/dev/null || echo "  - Error al obtener detalles"
            fi
        else
            log_success "No se encontraron vulnerabilidades conocidas"
        fi
    else
        log_warning "Error al ejecutar npm audit"
    fi
    
    # Limpiar archivo temporal
    rm -f npm_audit.json
fi

if command_exists yarn; then
    log_info "Ejecutando yarn audit..."
    
    # Yarn audit tiene diferente formato de output
    yarn_audit_output=$(yarn audit --json 2>/dev/null | tail -n 1 || echo '{}')
    yarn_vulns=$(echo "$yarn_audit_output" | jq '.data.vulnerabilities // 0' 2>/dev/null || echo 0)
    
    if [ "$yarn_vulns" -gt 0 ]; then
        log_warning "Yarn detectó $yarn_vulns vulnerabilidades"
    else
        log_success "Yarn: No vulnerabilidades detectadas"
    fi
fi

echo ""

# 2. VERIFICACIÓN DE DEPENDENCIAS DESACTUALIZADAS
echo "📦 2. VERIFICACIÓN DE DEPENDENCIAS DESACTUALIZADAS"
echo "================================================="

if command_exists npm; then
    log_info "Verificando dependencias desactualizadas..."
    
    # npm outdated devuelve código de error si hay paquetes desactualizados
    if outdated_output=$(npm outdated --json 2>/dev/null); then
        if [ "$outdated_output" != "{}" ] && [ "$outdated_output" != "" ]; then
            outdated_packages=$(echo "$outdated_output" | jq 'keys | length' 2>/dev/null || echo 0)
            log_warning "$outdated_packages paquetes desactualizados encontrados"
            
            echo ""
            echo "📋 PAQUETES DESACTUALIZADOS:"
            echo "$outdated_output" | jq -r 'to_entries[] | "  - \(.key): \(.value.current) → \(.value.latest)"' 2>/dev/null || echo "  - Error al obtener detalles"
        else
            log_success "Todas las dependencias están actualizadas"
        fi
    else
        # npm outdated devuelve código de error cuando hay paquetes desactualizados
        log_info "Hay paquetes desactualizados (verificar con 'npm outdated')"
    fi
fi

echo ""

# 3. VERIFICACIÓN DE PAQUETES ESPECÍFICOS DE RIESGO
echo "⚠️  3. VERIFICACIÓN DE PAQUETES DE ALTO RIESGO"
echo "=============================================="

# Lista de paquetes que requieren atención especial
risky_packages=(
    "xml-crypto"
    "node-forge" 
    "tesseract.js"
    "simplewebauthn"
    "lodash"
    "moment"
    "request"
    "xmldom"
    "xml2js"
    "cheerio"
)

log_info "Verificando paquetes de alto riesgo..."

for package in "${risky_packages[@]}"; do
    # Verificar si el paquete está instalado
    if npm list "$package" >/dev/null 2>&1; then
        version=$(npm list "$package" --depth=0 2>/dev/null | grep "$package" | sed 's/.*@//' | sed 's/ .*//' || echo "unknown")
        log_warning "Paquete de riesgo detectado: $package@$version"
        
        # Sugerir alternativas para paquetes conocidos
        case $package in
            "xml-crypto")
                echo "    💡 Considera migrar a: xml-dsig o @xmldom/xmldom"
                ;;
            "node-forge")
                echo "    💡 Considera migrar a: crypto nativo de Node.js o jose"
                ;;
            "moment")
                echo "    💡 Considera migrar a: dayjs o date-fns"
                ;;
            "request")
                echo "    💡 Considera migrar a: axios o node-fetch"
                ;;
            "lodash")
                echo "    💡 Considera usar funciones nativas de ES6+ o lodash-es"
                ;;
        esac
        echo ""
    fi
done

echo ""

# 4. VERIFICACIÓN DE LICENCIAS
echo "📄 4. VERIFICACIÓN DE LICENCIAS"
echo "==============================="

if command_exists npx; then
    log_info "Verificando licencias de dependencias..."
    
    # Usar license-checker si está disponible, sino instalarlo temporalmente
    if npx license-checker --summary >/dev/null 2>&1; then
        echo ""
        echo "📊 RESUMEN DE LICENCIAS:"
        npx license-checker --summary | head -20
        
        # Verificar licencias problemáticas
        problematic_licenses=$(npx license-checker --json 2>/dev/null | jq -r '.[] | select(.licenses | test("GPL|AGPL|LGPL")) | .name' 2>/dev/null || echo "")
        
        if [ -n "$problematic_licenses" ]; then
            log_warning "Licencias copyleft detectadas:"
            echo "$problematic_licenses" | sed 's/^/  - /'
        else
            log_success "No se detectaron licencias problemáticas"
        fi
    else
        log_info "license-checker no disponible, saltando verificación de licencias"
    fi
fi

echo ""

# 5. VERIFICACIÓN DE PAQUETES DEPRECADOS
echo "🗑️  5. VERIFICACIÓN DE PAQUETES DEPRECADOS"
echo "========================================"

log_info "Verificando paquetes deprecados..."

# Lista de paquetes conocidos como deprecados
deprecated_packages=(
    "request"
    "bower"
    "gulp-util"
    "node-uuid"
    "native-promise-only"
    "nomnom"
    "optimist"
)

for package in "${deprecated_packages[@]}"; do
    if npm list "$package" >/dev/null 2>&1; then
        version=$(npm list "$package" --depth=0 2>/dev/null | grep "$package" | sed 's/.*@//' | sed 's/ .*//' || echo "unknown")
        log_error "Paquete DEPRECADO detectado: $package@$version"
        deprecated_packages=$((deprecated_packages + 1))
    fi
done

if [ "$deprecated_packages" -eq 0 ]; then
    log_success "No se detectaron paquetes deprecados conocidos"
fi

echo ""

# 6. GENERACIÓN DE REPORTE FINAL
echo "📊 REPORTE FINAL DE SEGURIDAD"
echo "============================="

total_issues=$((critical_vulns + high_vulns + medium_vulns + low_vulns + deprecated_packages))

echo "🔍 RESUMEN DE AUDITORÍA:"
echo "  🚨 Vulnerabilidades críticas: $critical_vulns"
echo "  ⚠️  Vulnerabilidades altas: $high_vulns"
echo "  📊 Vulnerabilidades medias: $medium_vulns"
echo "  ℹ️  Vulnerabilidades bajas: $low_vulns"
echo "  📦 Paquetes desactualizados: $outdated_packages"
echo "  🗑️  Paquetes deprecados: $deprecated_packages"
echo ""

# Calcular puntuación de seguridad
security_score=$((100 - (critical_vulns * 25) - (high_vulns * 10) - (medium_vulns * 5) - (low_vulns * 1) - (deprecated_packages * 15)))
security_score=$((security_score < 0 ? 0 : security_score))

echo "🎯 PUNTUACIÓN DE SEGURIDAD: $security_score/100"

if [ "$security_score" -ge 90 ]; then
    log_success "¡Excelente estado de seguridad!"
elif [ "$security_score" -ge 70 ]; then
    log_info "Estado de seguridad bueno, algunas mejoras recomendadas"
elif [ "$security_score" -ge 50 ]; then
    log_warning "Estado de seguridad regular, se requieren mejoras"
else
    log_error "Estado de seguridad crítico, se requiere acción inmediata"
fi

echo ""

# 7. RECOMENDACIONES AUTOMÁTICAS
echo "💡 RECOMENDACIONES AUTOMÁTICAS"
echo "=============================="

if [ "$critical_vulns" -gt 0 ]; then
    echo "🚨 ACCIÓN INMEDIATA REQUERIDA:"
    echo "  - Ejecutar: npm audit fix --force"
    echo "  - Revisar manualmente vulnerabilidades críticas"
    echo "  - Considerar actualizar dependencias principales"
fi

if [ "$outdated_packages" -gt 5 ]; then
    echo "📦 GESTIÓN DE DEPENDENCIAS:"
    echo "  - Ejecutar: npm update"
    echo "  - Revisar: npm outdated"
    echo "  - Considerar usar dependabot para automatización"
fi

if [ "$deprecated_packages" -gt 0 ]; then
    echo "🗑️  MIGRACIÓN DE PAQUETES:"
    echo "  - Planificar migración de paquetes deprecados"
    echo "  - Buscar alternativas modernas y mantenidas"
    echo "  - Actualizar documentación de dependencias"
fi

echo ""
echo "✅ AUDITORÍA COMPLETADA"
echo ""
echo "🔗 ENLACES ÚTILES:"
echo "  - NPM Security: https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities"
echo "  - Snyk Database: https://snyk.io/vuln/"
echo "  - GitHub Security: https://github.com/advisories"

# Código de salida basado en la severidad
if [ "$critical_vulns" -gt 0 ]; then
    exit 1
elif [ "$high_vulns" -gt 0 ]; then
    exit 2
else
    exit 0
fi
