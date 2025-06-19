"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var userController_1 = require("../controllers/userController");
// Importación de middlewares
var authMiddleware = require('../middlewares/authMiddleware').authMiddleware;
var validationMiddleware = require('../middlewares/validationMiddleware').validationMiddleware;
var router = (0, express_1.Router)();
// Rutas relacionadas con usuarios
router.get('/users', authMiddleware, userController_1.getUsers); // Obtener lista de usuarios
router.post('/users', validationMiddleware, userController_1.createUser); // Crear un nuevo usuario
// Exportación del módulo de rutas
exports.default = router;
