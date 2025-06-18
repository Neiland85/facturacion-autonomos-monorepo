"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Archivo principal del backend
var express_1 = require("express");
var userRoutes_1 = require("./routes/userRoutes");
var logger_1 = require("./utils/logger");
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
// Middlewares
app.use(express_1.default.json());
// Rutas
app.use('/api', userRoutes_1.default);
// Iniciar servidor
app.listen(PORT, function () {
    logger_1.logger.info("Servidor corriendo en el puerto ".concat(PORT));
});
