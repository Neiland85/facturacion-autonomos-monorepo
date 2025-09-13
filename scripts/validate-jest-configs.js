#!/usr/bin/env node

/**
 * Script para validar configuraciones de Jest en el monorepo
 * Asegura que todas las configuraciones usen la base correcta
 */

const fs = require('fs');
const path = require('path');

// Directorios a validar
const DIRS_TO_VALIDATE = [
  'apps/invoice-service',
  'apps/api-tax-calculator',
  'apps/auth-service',
  'apps/api-gateway',
  'apps/api-facturas',
  'apps/web',
  'packages/database',
  'packages/core',
  'packages/types',
  'packages/validation',
  'packages/ui',
];

function validateJestConfig(dirPath) {
  const jestConfigTs = path.join(dirPath, 'jest.config.ts');
  const jestConfigJs = path.join(dirPath, 'jest.config.js');

  let configFile = null;
  let isTypeScript = false;

  if (fs.existsSync(jestConfigTs)) {
    configFile = jestConfigTs;
    isTypeScript = true;
  } else if (fs.existsSync(jestConfigJs)) {
    configFile = jestConfigJs;
    isTypeScript = false;
  } else {
    console.log(
      `⚠️  ${path.basename(dirPath)}: No se encontró jest.config.ts o jest.config.js`
    );
    return false;
  }

  try {
    const content = fs.readFileSync(configFile, 'utf8');

    // Validar que importe de la configuración base
    const hasBaseImport = content.includes('jest.config.base');

    if (!hasBaseImport) {
      console.log(
        `❌ ${path.basename(dirPath)}: No importa la configuración base`
      );
      return false;
    }

    // Validar que use la configuración correcta según el tipo de proyecto
    const packageJsonPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const projectName = packageJson.name || path.basename(dirPath);

      if (projectName.includes('web')) {
        // Proyecto Next.js debe usar nextConfig
        if (!content.includes('nextConfig')) {
          console.log(`❌ ${projectName}: Proyecto web debe usar nextConfig`);
          return false;
        }
      } else if (projectName.includes('auth-service')) {
        // Auth service debe usar esmConfig
        if (!content.includes('esmConfig')) {
          console.log(`❌ ${projectName}: Auth service debe usar esmConfig`);
          return false;
        }
      } else {
        // Otros proyectos deben usar nodeConfig
        if (!content.includes('nodeConfig')) {
          console.log(`❌ ${projectName}: Debe usar nodeConfig`);
          return false;
        }
      }
    }

    console.log(`✅ ${path.basename(dirPath)}: Configuración válida`);
    return true;
  } catch (error) {
    console.log(
      `❌ ${path.basename(dirPath)}: Error al validar configuración - ${error.message}`
    );
    return false;
  }
}

function main() {
  console.log('🔍 Validando configuraciones de Jest...\n');

  let validCount = 0;
  let totalCount = 0;

  DIRS_TO_VALIDATE.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      totalCount++;
      if (validateJestConfig(fullPath)) {
        validCount++;
      }
    } else {
      console.log(`⚠️  Directorio no encontrado: ${dir}`);
    }
  });

  console.log(
    `\n📊 Resultados: ${validCount}/${totalCount} configuraciones válidas`
  );

  if (validCount === totalCount) {
    console.log('🎉 Todas las configuraciones de Jest son válidas!');
  } else {
    console.log('⚠️  Algunas configuraciones necesitan corrección');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { validateJestConfig };
