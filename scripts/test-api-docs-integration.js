#!/usr/bin/env node

/**
 * Script para probar la documentación API en todos los servicios
 */

const { exec } = require('child_process');
const path = require('path');

const services = [
  {
    name: 'auth-service',
    port: 3003,
    path: 'apps/auth-service',
  },
  {
    name: 'invoice-service',
    port: 3001,
    path: 'apps/invoice-service',
  },
  {
    name: 'api-tax-calculator',
    port: 3002,
    path: 'apps/api-tax-calculator',
  },
  {
    name: 'api-facturas',
    port: 3001,
    path: 'apps/api-facturas',
  },
];

console.log('🧪 Probando integración de documentación API...\n');

function testService(service, callback) {
  const { name, port, path: servicePath } = service;

  console.log(`🔍 Probando ${name}...`);

  // Verificar que el servicio esté ejecutándose
  exec(`curl -s http://localhost:${port}/health`, (error, stdout, stderr) => {
    if (error) {
      console.log(`   ❌ ${name} no está ejecutándose en puerto ${port}`);
      console.log(`   💡 Ejecuta: cd ${servicePath} && pnpm dev`);
      callback();
      return;
    }

    try {
      const healthResponse = JSON.parse(stdout);
      if (healthResponse.status === 'ok' || healthResponse.status === 'OK') {
        console.log(`   ✅ ${name} está ejecutándose`);

        // Probar documentación API
        exec(
          `curl -s http://localhost:${port}/api-docs`,
          (docError, docStdout, docStderr) => {
            if (docError) {
              console.log(`   ❌ Documentación no disponible en /api-docs`);
            } else if (
              docStdout.includes('swagger') ||
              docStdout.includes('API Documentation')
            ) {
              console.log(
                `   ✅ Documentación API disponible en: http://localhost:${port}/api-docs`
              );
            } else {
              console.log(
                `   ⚠️  Documentación puede estar disponible pero respuesta inesperada`
              );
            }

            // Probar endpoint JSON de la documentación
            exec(
              `curl -s http://localhost:${port}/api-docs.json`,
              (jsonError, jsonStdout, jsonStderr) => {
                if (!jsonError && jsonStdout.includes('openapi')) {
                  console.log(
                    `   ✅ Especificación OpenAPI JSON disponible en: http://localhost:${port}/api-docs.json`
                  );
                } else {
                  console.log(
                    `   ⚠️  Especificación OpenAPI JSON no disponible`
                  );
                }
                callback();
              }
            );
          }
        );
      } else {
        console.log(`   ❌ ${name} responde pero health check falló`);
        callback();
      }
    } catch (parseError) {
      console.log(`   ❌ Error al parsear respuesta de ${name}`);
      callback();
    }
  });
}

function runTests() {
  let completed = 0;
  const total = services.length;

  services.forEach(service => {
    testService(service, () => {
      completed++;
      if (completed === total) {
        console.log('\n🎉 Pruebas completadas!');
        console.log('\n📋 Resumen:');
        console.log('Para acceder a la documentación de cada servicio:');
        services.forEach(s => {
          console.log(`   ${s.name}: http://localhost:${s.port}/api-docs`);
        });
        console.log(
          '\n📖 Documentación unificada: http://localhost:3000/docs/api/index.html'
        );
      }
    });
  });
}

runTests();
