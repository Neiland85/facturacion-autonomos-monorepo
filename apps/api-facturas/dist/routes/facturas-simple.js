"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const facturas_1 = require("../controllers/facturas");
const router = express_1.default.Router();
// Rutas básicas para facturas
router.get('/', facturas_1.FacturasController.getAll);
router.get('/:id', facturas_1.FacturasController.getById);
router.post('/', facturas_1.FacturasController.create);
router.put('/:id', facturas_1.FacturasController.update);
router.delete('/:id', facturas_1.FacturasController.delete);
exports.default = router;
