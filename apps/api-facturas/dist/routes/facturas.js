"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', facturaController.getFacturas);
router.post('/', validateFactura, facturaController.createFactura);
router.get('/:id', facturaController.getFacturaById);
router.put('/:id', validateFacturaUpdate, facturaController.updateFactura);
router.delete('/:id', facturaController.deleteFactura);
router.get('/:id/pdf', facturaController.generatePDF);
router.post('/:id/enviar', facturaController.enviarFactura);
exports.default = router;
//# sourceMappingURL=facturas.js.map