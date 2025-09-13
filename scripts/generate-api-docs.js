#!/usr/bin/env node

/**
 * Script para generar documentación HTML unificada desde archivos OpenAPI
 * Utiliza Redoc para crear documentación interactiva
 */

const fs = require('fs');
const path = require('path');

// Configuración
const OPENAPI_DIR = path.join(__dirname, '..', 'openapi');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'api');
const MAIN_SPEC = 'unified-api.openapi.yaml';

// Asegurar que existe el directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función para generar HTML con Redoc
function generateRedocHTML(specPath, outputPath, title) {
  const specContent = fs.readFileSync(specPath, 'utf8');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Documentación API</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header h1 {
            color: white;
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .header p {
            color: rgba(255, 255, 255, 0.9);
            margin: 0.5rem 0 0 0;
            font-size: 1.1rem;
            font-weight: 400;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .api-docs {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin-top: 2rem;
        }

        .nav-tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }

        .nav-tab {
            padding: 1rem 1.5rem;
            border: none;
            background: none;
            cursor: pointer;
            font-weight: 500;
            color: #6c757d;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
        }

        .nav-tab:hover {
            color: #495057;
            background: rgba(0, 123, 255, 0.1);
        }

        .nav-tab.active {
            color: #007bff;
            border-bottom-color: #007bff;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .footer {
            text-align: center;
            padding: 2rem;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
        }

        .footer a {
            color: white;
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }

            .container {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 ${title}</h1>
        <p>Documentación completa de la API - Facturación Autónomos</p>
    </div>

    <div class="container">
        <div class="api-docs">
            <div class="nav-tabs">
                <button class="nav-tab active" onclick="showTab('unified')">📋 API Unificada</button>
                <button class="nav-tab" onclick="showTab('auth')">🔐 Auth Service</button>
                <button class="nav-tab" onclick="showTab('invoices')">📄 Invoice Service</button>
                <button class="nav-tab" onclick="showTab('tax')">🧮 Tax Calculator</button>
                <button class="nav-tab" onclick="showTab('facturas')">📊 API Facturas</button>
            </div>

            <div id="unified" class="tab-content active">
                <redoc spec-url="./unified-api.openapi.yaml"></redoc>
            </div>

            <div id="auth" class="tab-content">
                <redoc spec-url="./auth-service.openapi.yaml"></redoc>
            </div>

            <div id="invoices" class="tab-content">
                <redoc spec-url="./invoice-service.openapi.yaml"></redoc>
            </div>

            <div id="tax" class="tab-content">
                <redoc spec-url="./tax-calculator.openapi.yaml"></redoc>
            </div>

            <div id="facturas" class="tab-content">
                <redoc spec-url="./facturas.openapi.yaml"></redoc>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>
            📖 Documentación generada automáticamente |
            <a href="https://github.com/Neiland85/facturacion-autonomos-monorepo" target="_blank">
                Ver código fuente
            </a>
        </p>
    </div>

    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    <script>
        function showTab(tabName) {
            // Hide all tab contents
            const contents = document.querySelectorAll('.tab-content');
            contents.forEach(content => content.classList.remove('active'));

            // Remove active class from all tabs
            const tabs = document.querySelectorAll('.nav-tab');
            tabs.forEach(tab => tab.classList.remove('active'));

            // Show selected tab content
            document.getElementById(tabName).classList.add('active');

            // Add active class to clicked tab
            event.target.classList.add('active');
        }

        // Initialize Redoc for all tabs
        document.addEventListener('DOMContentLoaded', function() {
            // Redoc will automatically load when tabs become visible
            console.log('📖 Documentación API cargada correctamente');
        });
    </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`✅ Generado: ${outputPath}`);
}

// Función para generar documentación de un servicio específico
function generateServiceDocs(specFile, title) {
  const specPath = path.join(OPENAPI_DIR, specFile);
  const outputPath = path.join(OUTPUT_DIR, specFile.replace('.yaml', '.html'));

  if (!fs.existsSync(specPath)) {
    console.log(`⚠️  Archivo no encontrado: ${specFile}`);
    return;
  }

  const specContent = fs.readFileSync(specPath, 'utf8');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Documentación API</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
        }

        .header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }

        .back-link {
            display: inline-block;
            margin-bottom: 1rem;
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
        }

        .back-link:hover {
            background: #0056b3;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }

            .container {
                padding: 0 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>Documentación específica del servicio</p>
    </div>

    <div class="container">
        <a href="./index.html" class="back-link">← Volver a documentación unificada</a>
        <redoc spec-url="./${specFile}"></redoc>
    </div>

    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`✅ Generado: ${outputPath}`);
}

// Función principal
function main() {
  console.log('🚀 Generando documentación HTML unificada...\n');

  // Generar documentación principal
  const mainSpecPath = path.join(OPENAPI_DIR, MAIN_SPEC);
  const mainOutputPath = path.join(OUTPUT_DIR, 'index.html');

  if (fs.existsSync(mainSpecPath)) {
    generateRedocHTML(
      mainSpecPath,
      mainOutputPath,
      'Facturación Autónomos - API Unificada'
    );
  } else {
    console.log(`❌ Archivo principal no encontrado: ${MAIN_SPEC}`);
    return;
  }

  // Generar documentación específica para cada servicio
  const services = [
    { file: 'auth-service.openapi.yaml', title: '🔐 Auth Service API' },
    { file: 'invoice-service.openapi.yaml', title: '📄 Invoice Service API' },
    { file: 'tax-calculator.openapi.yaml', title: '🧮 Tax Calculator API' },
    { file: 'facturas.openapi.yaml', title: '📊 API Facturas' },
  ];

  services.forEach(service => {
    generateServiceDocs(service.file, service.title);
  });

  console.log('\n🎉 Documentación generada exitosamente!');
  console.log(`📁 Archivos creados en: ${OUTPUT_DIR}`);
  console.log('\n📋 Próximos pasos:');
  console.log('1. Abrir docs/api/index.html en un navegador');
  console.log('2. Verificar que todas las APIs estén documentadas');
  console.log('3. Compartir la documentación con el equipo');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { generateRedocHTML, generateServiceDocs };
