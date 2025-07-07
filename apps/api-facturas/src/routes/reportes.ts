import express from 'express';
import { ReportesController } from '../controllers/reportes';

const router = express.Router();
const reportesController = new ReportesController();

/**
 * @swagger
 * /api/v1/reportes/trimestral:
 *   get:
 *     summary: Reporte trimestral
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: trimestre
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         description: Número del trimestre
 *       - in: query
 *         name: año
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Año del reporte
 *     responses:
 *       200:
 *         description: Reporte generado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteTrimestral'
 */
router.get('/trimestral', reportesController.getTrimestral);

/**
 * @swagger
 * /api/v1/reportes/anual:
 *   get:
 *     summary: Reporte anual
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: año
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Año del reporte
 *     responses:
 *       200:
 *         description: Reporte anual generado correctamente
 */
router.get('/anual', reportesController.getAnual);

/**
 * @swagger
 * /api/v1/reportes/ventas:
 *   get:
 *     summary: Reporte de ventas
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fechaDesde
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: fechaHasta
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *     responses:
 *       200:
 *         description: Reporte de ventas generado correctamente
 */
router.get('/ventas', reportesController.getVentas);

/**
 * @swagger
 * /api/v1/reportes/gastos:
 *   get:
 *     summary: Reporte de gastos
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fechaDesde
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: fechaHasta
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *     responses:
 *       200:
 *         description: Reporte de gastos generado correctamente
 */
router.get('/gastos', reportesController.getGastos);

/**
 * @swagger
 * /api/v1/reportes/exportar/{formato}:
 *   post:
 *     summary: Exportar reporte
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: formato
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pdf, excel, csv]
 *         description: Formato de exportación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [trimestral, anual, ventas, gastos]
 *               parametros:
 *                 type: object
 *                 description: Parámetros específicos del reporte
 *     responses:
 *       200:
 *         description: Archivo generado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/exportar/:formato', reportesController.exportar);

export default router;
