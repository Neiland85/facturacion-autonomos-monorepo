"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fiscal_1 = require("../controllers/fiscal");
const router = express_1.default.Router();
const fiscalController = new fiscal_1.FiscalController();
router.post('/calcular', fiscalController.calcular);
router.get('/tipos-iva', fiscalController.getTiposIVA);
router.post('/validar-nif', fiscalController.validarNIF);
exports.default = router;
//# sourceMappingURL=fiscal.js.map