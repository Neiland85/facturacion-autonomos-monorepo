"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clientes_1 = require("../controllers/clientes");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const clienteController = new clientes_1.ClienteController();
router.get('/', clienteController.getClientes);
router.post('/', validation_1.validateCliente, clienteController.createCliente);
router.get('/:id', clienteController.getClienteById);
router.put('/:id', validation_1.validateCliente, clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);
exports.default = router;
//# sourceMappingURL=clientes.js.map