"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fiscal_1 = require("../controllers/fiscal");
const router = express_1.default.Router();
const fiscalController = new fiscal_1.FiscalController();
/**
 * @swagger
 * /api/v1/fiscal/calcular:
 *   post:
 *     summary: Calcular impuestos
 *     tags: [Fiscal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalculoFiscal'
 *     responses:
 *       200:
 *         description: Cálculo realizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ResultadoCalculoFiscal'
 */
router.post('/calcular', fiscalController.calcular);
/**
 * @swagger
 * /api/v1/fiscal/tipos-iva:
 *   get:
 *     summary: Obtener tipos de IVA vigentes
 *     tags: [Fiscal]
 *     responses:
 *       200:
 *         description: Lista de tipos de IVA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipo:
 *                         type: number
 *                         format: decimal
 *                       descripcion:
 *                         type: string
 *                       vigente:
 *                         type: boolean
 */
router.get('/tipos-iva', fiscalController.getTiposIVA);
/**
 * @swagger
 * /api/v1/fiscal/validar-nif:
 *   post:
 *     summary: Validar NIF/CIF
 *     tags: [Fiscal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nif:
 *                 type: string
 *                 description: NIF o CIF a validar
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 tipo:
 *                   type: string
 *                   enum: [NIF, CIF]
 *                 message:
 *                   type: string
 */
router.post('/validar-nif', fiscalController.validarNIF);
exports.default = router;
