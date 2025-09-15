#!/bin/bash
echo "Starting web application..."
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/web
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Starting Next.js development server..."
npx next dev --port 3004
