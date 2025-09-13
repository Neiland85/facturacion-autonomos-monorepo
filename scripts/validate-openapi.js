#!/usr/bin/env node

/**
 * Script para validar archivos OpenAPI/Swagger
 * Verifica sintaxis básica y estructura de las especificaciones
 */

const fs = require('fs');
const path = require('path');

// Directorio de archivos OpenAPI
const OPENAPI_DIR = path.join(__dirname, '..', 'openapi');

// Función para validar sintaxis YAML básica
function validateYamlSyntax(content) {
  const errors = [];

  try {
    // Verificaciones básicas de sintaxis
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Verificar indentación inconsistente (espacios vs tabs)
      if (line.includes('\t') && line.includes('  ')) {
        errors.push(`Línea ${lineNum}: Mezcla de tabs y espacios`);
      }

      // Verificar llaves sin cerrar en objetos inline
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push(`Línea ${lineNum}: Llaves desbalanceadas`);
      }

      // Verificar corchetes sin cerrar en arrays inline
      const openBrackets = (line.match(/\[/g) || []).length;
      const closeBrackets = (line.match(/\]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        errors.push(`Línea ${lineNum}: Corchetes desbalanceados`);
      }
    }

    return errors;
  } catch (error) {
    return [`Error procesando archivo: ${error.message}`];
  }
}

// Función para validar estructura OpenAPI básica
function validateOpenAPIStructure(content) {
  const errors = [];

  // Verificaciones básicas de contenido
  if (!content.includes('openapi:')) {
    errors.push('Falta declaración de versión OpenAPI');
  }

  if (!content.includes('info:')) {
    errors.push('Falta sección info');
  }

  if (!content.includes('paths:')) {
    errors.push('Falta sección paths');
  }

  if (!content.includes('title:')) {
    errors.push('Falta título en info');
  }

  if (!content.includes('version:')) {
    errors.push('Falta versión en info');
  }

  return errors;
}

// Función para validar un archivo
function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    const syntaxErrors = validateYamlSyntax(content);
    const structureErrors = validateOpenAPIStructure(content);

    const allErrors = [...syntaxErrors, ...structureErrors];

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      stats: {
        lines: content.split('\n').length,
        size: content.length,
      },
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Error leyendo archivo: ${error.message}`],
      stats: { lines: 0, size: 0 },
    };
  }
}

// Función principal
function main() {
  console.log('🔍 Validando archivos OpenAPI...\n');

  if (!fs.existsSync(OPENAPI_DIR)) {
    console.log(`❌ Directorio no encontrado: ${OPENAPI_DIR}`);
    return;
  }

  const files = fs
    .readdirSync(OPENAPI_DIR)
    .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
    .map(file => path.join(OPENAPI_DIR, file));

  if (files.length === 0) {
    console.log('⚠️  No se encontraron archivos OpenAPI');
    return;
  }

  let totalValid = 0;
  const results = [];

  files.forEach(filePath => {
    const fileName = path.basename(filePath);
    console.log(`📄 Validando: ${fileName}`);

    const result = validateFile(filePath);
    results.push({ file: fileName, ...result });

    if (result.valid) {
      console.log(
        `✅ ${fileName}: Válido (${result.stats.lines} líneas, ${result.stats.size} bytes)`
      );
      totalValid++;
    } else {
      console.log(`❌ ${fileName}: Inválido`);
      result.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    console.log('');
  });

  console.log('📊 Resumen de validación:');
  console.log(`   Total de archivos: ${files.length}`);
  console.log(`   Válidos: ${totalValid}`);
  console.log(`   Inválidos: ${files.length - totalValid}`);

  if (totalValid === files.length) {
    console.log('\n🎉 Todos los archivos OpenAPI son válidos!');
    console.log('\n📋 Próximos pasos recomendados:');
    console.log('1. Ejecutar: node scripts/generate-api-docs.js');
    console.log('2. Abrir docs/api/index.html en el navegador');
    console.log('3. Verificar documentación en servicios en ejecución');
  } else {
    console.log('\n⚠️  Algunos archivos necesitan corrección');
    console.log('\n🔧 Archivos inválidos:');
    results
      .filter(r => !r.valid)
      .forEach(r => {
        console.log(`   - ${r.file}`);
      });
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { validateFile, validateYamlSyntax, validateOpenAPIStructure };
