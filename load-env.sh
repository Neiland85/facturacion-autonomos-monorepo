#!/bin/bash

# Script para cargar variables de entorno basado en el entorno
# Uso: source load-env.sh

ENVIRONMENT=${ENVIRONMENT:-development}

echo "🌍 Cargando configuración para entorno: $ENVIRONMENT"

ENV_FILE=".env.$ENVIRONMENT"

if [ -f "$ENV_FILE" ]; then
    echo "📄 Cargando $ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
    echo "✅ Variables de entorno cargadas"
else
    echo "❌ Archivo $ENV_FILE no encontrado"
    echo "📋 Archivos disponibles:"
    ls -la .env.*
    exit 1
fi