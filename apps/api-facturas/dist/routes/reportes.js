"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportes_1 = require("../controllers/reportes");
const router = express_1.default.Router();
const reportesController = new reportes_1.ReportesController();
router.get('/trimestral', reportesController.getTrimestral);
router.get('/anual', reportesController.getAnual);
router.get('/ventas', reportesController.getVentas);
router.get('/gastos', reportesController.getGastos);
router.post('/exportar/:formato', reportesController.exportar);
exports.default = router;
//# sourceMappingURL=reportes.js.map