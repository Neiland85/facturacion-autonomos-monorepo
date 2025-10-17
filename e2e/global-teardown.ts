import { FullConfig } from '@playwright/test';

/**
 * Limpieza global que se ejecuta después de todos los tests E2E.
 * Se utiliza para:
 * - Limpiar base de datos de test
 * - Cerrar conexiones abiertas
 * - Generar reportes finales
 * - Limpiar archivos temporales
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando limpieza global de tests E2E...');

  const fs = require('fs');
  const path = require('path');

  try {
    // Limpiar datos de sesión
    const sessionFile = path.join(
      process.cwd(),
      'test-results',
      'session.json'
    );
    if (fs.existsSync(sessionFile)) {
      fs.unlinkSync(sessionFile);
      console.log('🧹 Datos de sesión limpiados');
    }

    // Limpiar screenshots antiguos (mantener solo los últimos)
    const screenshotsDir = path.join(process.cwd(), 'e2e', 'screenshots');
    if (fs.existsSync(screenshotsDir)) {
      const files = fs.readdirSync(screenshotsDir);
      const maxFiles = 50; // Mantener máximo 50 screenshots

      if (files.length > maxFiles) {
        // Ordenar por fecha de modificación (más antiguos primero)
        const sortedFiles = files
          .map(file => ({
            name: file,
            path: path.join(screenshotsDir, file),
            stats: fs.statSync(path.join(screenshotsDir, file)),
          }))
          .sort((a, b) => a.stats.mtime - b.stats.mtime);

        // Eliminar archivos antiguos
        const filesToDelete = sortedFiles.slice(0, files.length - maxFiles);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
        });

        console.log(
          `🧹 ${filesToDelete.length} screenshots antiguos eliminados`
        );
      }
    }

    // Limpiar videos antiguos
    const videosDir = path.join(process.cwd(), 'e2e', 'videos');
    if (fs.existsSync(videosDir)) {
      const files = fs.readdirSync(videosDir);
      const maxFiles = 20; // Mantener máximo 20 videos

      if (files.length > maxFiles) {
        const sortedFiles = files
          .map(file => ({
            name: file,
            path: path.join(videosDir, file),
            stats: fs.statSync(path.join(videosDir, file)),
          }))
          .sort((a, b) => a.stats.mtime - b.stats.mtime);

        const filesToDelete = sortedFiles.slice(0, files.length - maxFiles);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
        });

        console.log(`🧹 ${filesToDelete.length} videos antiguos eliminados`);
      }
    }

    // Generar resumen final si existe reporte JSON
    const resultsFile = path.join(
      process.cwd(),
      'test-results',
      'results.json'
    );
    if (fs.existsSync(resultsFile)) {
      try {
        const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        const totalTests =
          results.suites?.reduce(
            (acc: number, suite: any) =>
              acc +
              (suite.specs?.reduce(
                (specAcc: number, spec: any) => specAcc + spec.tests.length,
                0
              ) || 0),
            0
          ) || 0;

        const passedTests =
          results.suites?.reduce(
            (acc: number, suite: any) =>
              acc +
              (suite.specs?.reduce(
                (specAcc: number, spec: any) =>
                  specAcc +
                  spec.tests.filter((t: any) =>
                    t.results.some((r: any) => r.status === 'passed')
                  ).length,
                0
              ) || 0),
            0
          ) || 0;

        const failedTests = totalTests - passedTests;

        console.log('\n📊 Resumen de Tests E2E:');
        console.log(`   Total: ${totalTests}`);
        console.log(`   ✅ Pasaron: ${passedTests}`);
        console.log(`   ❌ Fallaron: ${failedTests}`);
        console.log(
          `   📈 Tasa de éxito: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`
        );
      } catch (error) {
        console.warn('⚠️  No se pudo generar resumen de resultados:', error);
      }
    }

    console.log('✅ Limpieza global completada');
  } catch (error) {
    console.error('❌ Error durante la limpieza global:', error);
    // No lanzamos el error para no fallar el teardown
  }
}

export default globalTeardown;
