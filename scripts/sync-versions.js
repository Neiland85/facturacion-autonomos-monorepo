#!/usr/bin/env node

/**
 * Script para sincronizar versiones de dependencias en el monorepo
 * Enfocado en Prisma y otras dependencias críticas
 */

const fs = require('fs');
const path = require('path');

// Versiones objetivo para sincronización
const TARGET_VERSIONS = {
  '@prisma/client': '^6.11.1',
  prisma: '^6.11.1',
  express: '^4.21.1',
  typescript: '^5.7.2',
  jest: '^29.7.0',
  '@types/node': '^22.10.1',
};

// Directorios a procesar
const DIRS_TO_PROCESS = [
  'apps/invoice-service',
  'apps/api-tax-calculator',
  'apps/auth-service',
  'apps/api-gateway',
  'apps/api-facturas',
  'packages/database',
  'packages/core',
  'packages/types',
  'packages/validation',
];

function readPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
    return null;
  }
}

function writePackageJson(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2) + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error escribiendo ${filePath}:`, error.message);
    return false;
  }
}

function syncPackageVersions(packageJson, packageName) {
  let changes = 0;

  // Sincronizar dependencies
  if (packageJson.dependencies) {
    Object.keys(TARGET_VERSIONS).forEach(dep => {
      if (
        packageJson.dependencies[dep] &&
        packageJson.dependencies[dep] !== TARGET_VERSIONS[dep]
      ) {
        console.log(
          `  📦 ${packageName}: ${dep} ${packageJson.dependencies[dep]} → ${TARGET_VERSIONS[dep]}`
        );
        packageJson.dependencies[dep] = TARGET_VERSIONS[dep];
        changes++;
      }
    });
  }

  // Sincronizar devDependencies
  if (packageJson.devDependencies) {
    Object.keys(TARGET_VERSIONS).forEach(dep => {
      if (
        packageJson.devDependencies[dep] &&
        packageJson.devDependencies[dep] !== TARGET_VERSIONS[dep]
      ) {
        console.log(
          `  🛠️  ${packageName}: ${dep} ${packageJson.devDependencies[dep]} → ${TARGET_VERSIONS[dep]}`
        );
        packageJson.devDependencies[dep] = TARGET_VERSIONS[dep];
        changes++;
      }
    });
  }

  return changes;
}

function processDirectory(dirPath) {
  const packageJsonPath = path.join(dirPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  No se encontró package.json en ${dirPath}`);
    return 0;
  }

  const packageJson = readPackageJson(packageJsonPath);
  if (!packageJson) return 0;

  const packageName = packageJson.name || path.basename(dirPath);
  console.log(`\n🔍 Procesando ${packageName}...`);

  const changes = syncPackageVersions(packageJson, packageName);

  if (changes > 0) {
    if (writePackageJson(packageJsonPath, packageJson)) {
      console.log(`✅ ${packageName}: ${changes} cambios aplicados`);
    }
  } else {
    console.log(`✅ ${packageName}: Sin cambios necesarios`);
  }

  return changes;
}

function main() {
  console.log('🚀 Iniciando sincronización de versiones...\n');

  let totalChanges = 0;

  DIRS_TO_PROCESS.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      totalChanges += processDirectory(fullPath);
    } else {
      console.log(`⚠️  Directorio no encontrado: ${dir}`);
    }
  });

  console.log(`\n🎯 Sincronización completada!`);
  console.log(`📊 Total de cambios aplicados: ${totalChanges}`);

  if (totalChanges > 0) {
    console.log('\n📝 Recomendaciones:');
    console.log('1. Ejecuta "pnpm install" para actualizar las dependencias');
    console.log('2. Verifica que todas las apps compilen correctamente');
    console.log('3. Ejecuta los tests para asegurar compatibilidad');
    console.log('4. Si usas Prisma, ejecuta "pnpm run db:generate"');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { syncPackageVersions, TARGET_VERSIONS };
