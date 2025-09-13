#!/usr/bin/env node

/**
 * Script de validación de configuración TypeScript
 * Verifica que todos los tsconfig.json sigan las mejores prácticas
 */

const fs = require('fs');
const path = require('path');

const BASE_CONFIG = {
  target: 'ES2022',
  module: 'ESNext',
  moduleResolution: 'Bundler',
};

const ISSUES = [];
const SUCCESS = [];

function validateTsconfig(filePath, packageName) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Verificar que extienda el base
    if (!content.extends || !content.extends.includes('tsconfig.base.json')) {
      ISSUES.push(`❌ ${packageName}: No extiende tsconfig.base.json`);
      return;
    }

    // Verificar configuraciones críticas
    const compilerOptions = content.compilerOptions || {};

    if (
      compilerOptions.target &&
      compilerOptions.target !== BASE_CONFIG.target
    ) {
      ISSUES.push(
        `❌ ${packageName}: Target incorrecto (${compilerOptions.target} vs ${BASE_CONFIG.target})`
      );
    }

    if (
      compilerOptions.module &&
      compilerOptions.module !== BASE_CONFIG.module
    ) {
      ISSUES.push(
        `❌ ${packageName}: Module incorrecto (${compilerOptions.module} vs ${BASE_CONFIG.module})`
      );
    }

    if (
      compilerOptions.moduleResolution &&
      compilerOptions.moduleResolution !== BASE_CONFIG.moduleResolution
    ) {
      ISSUES.push(
        `❌ ${packageName}: ModuleResolution incorrecto (${compilerOptions.moduleResolution} vs ${BASE_CONFIG.moduleResolution})`
      );
    }

    // Verificar estructura de include/exclude
    if (!content.include || !content.include.includes('src/**/*')) {
      ISSUES.push(`❌ ${packageName}: No incluye src/**/* correctamente`);
    }

    if (
      content.include &&
      content.include.includes('**/*.ts') &&
      !content.include.includes('src/**/*')
    ) {
      ISSUES.push(
        `⚠️  ${packageName}: Incluye archivos fuera de src/ sin rootDir apropiado`
      );
    }

    SUCCESS.push(`✅ ${packageName}: Configuración correcta`);
  } catch (error) {
    ISSUES.push(
      `❌ ${packageName}: Error al leer/parsear tsconfig.json - ${error.message}`
    );
  }
}

function findTsconfigFiles(dir, results = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !['node_modules', '.git', '.next', 'dist'].includes(item)
    ) {
      findTsconfigFiles(fullPath, results);
    } else if (item === 'tsconfig.json') {
      const relativePath = path.relative(process.cwd(), fullPath);
      const packageName = path.dirname(relativePath).replace(/\\/g, '/');
      results.push({ path: fullPath, name: packageName });
    }
  }

  return results;
}

function main() {
  console.log('🔍 Validando configuración TypeScript...\n');

  const tsconfigFiles = findTsconfigFiles(process.cwd());

  // Excluir archivos que no deben validarse
  const filteredFiles = tsconfigFiles.filter(
    file =>
      !file.path.includes('tsconfig.base.json') &&
      !file.path.includes('/tsconfig.json') &&
      !file.path.includes('\\tsconfig.json') &&
      !file.name.includes('frontend') && // Evitar duplicados
      !file.name.includes('backend') // Evitar duplicados
  );

  filteredFiles.forEach(file => {
    validateTsconfig(file.path, file.name);
  });

  console.log('📊 Resultados:\n');

  if (SUCCESS.length > 0) {
    SUCCESS.forEach(msg => console.log(msg));
    console.log();
  }

  if (ISSUES.length > 0) {
    console.log('🚨 Problemas encontrados:');
    ISSUES.forEach(issue => console.log(issue));
    console.log(`\n❌ Total de problemas: ${ISSUES.length}`);
    process.exit(1);
  } else {
    console.log('✅ Todas las configuraciones son correctas!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateTsconfig, findTsconfigFiles };
