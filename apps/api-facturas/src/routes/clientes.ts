import express from "express";
import { ClienteController } from "../controllers/clientes";
import { validateCliente } from "../middleware/validation";

const router = express.Router();
const clienteController = new ClienteController();

/**
 * @swagger
 * /api/v1/clientes:
 *   get:
 *     summary: Obtener lista de clientes
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Elementos por página
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o NIF
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get("/", clienteController.getClientes);

/**
 * @swagger
 * /api/v1/clientes:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteCreate'
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 */
router.post("/", validateCliente, clienteController.createCliente);

/**
 * @swagger
 * /api/v1/clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get("/:id", clienteController.getClienteById);

/**
 * @swagger
 * /api/v1/clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteCreate'
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.put("/:id", validateCliente, clienteController.updateCliente);

/**
 * @swagger
 * /api/v1/clientes/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Cliente eliminado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.delete("/:id", clienteController.deleteCliente);

export default router;
