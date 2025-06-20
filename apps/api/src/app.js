"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Corregir importación de Response
const swagger_ui_express_1 = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
const js_yaml_1 = require("js-yaml");
const app = (0, express_1.default)();
// Middleware para parsear JSON
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// Manejo de errores al cargar openapi.yaml
let swaggerDocument;
try {
    swaggerDocument = js_yaml_1.default.load(fs.readFileSync(path.resolve(__dirname, '../openapi.yaml'), 'utf8'));
}
catch (e) {
    console.error('Error al cargar el archivo openapi.yaml:', e);
    swaggerDocument = {}; // Cargar un documento vacío en caso de error
}
// Configurar Swagger UI correctamente con tipos
app.use('/api-docs', swagger_ui_express_1.default.serve, (req, res, next) => {
    swagger_ui_express_1.default.setup(swaggerDocument)(req, res, next);
});
// Middleware de ejemplo
app.use((req, res, next) => {
    console.log('Middleware ejecutado');
    next();
});
// Ruta de ejemplo
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
// Ruta raíz
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Servidor funcionando correctamente' });
});
// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error('Error capturado por el middleware:', err.message);
    res.status(500).json({
        error: 'Ocurrió un error inesperado en el servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});
exports.default = app;
