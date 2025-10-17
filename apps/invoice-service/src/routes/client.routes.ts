import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware";
import { ClientController } from "../controllers/client.controller";

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/clients:
 *   get:
 *     summary: Listar clientes
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, NIF/CIF o email
 *     responses:
 *       200:
 *         description: Lista paginada de clientes
 */
router.get("/", ClientController.getClients);

/**
 * @swagger
 * /api/v1/clients:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - nifCif
 *             properties:
 *               name:
 *                 type: string
 *               nifCif:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               province:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 */
router.post("/", idempotencyMiddleware(), ClientController.createClient);

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 */
router.get("/:id", ClientController.getClientById);

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 */
router.put("/:id", idempotencyMiddleware(), ClientController.updateClient);

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 */
router.delete("/:id", ClientController.deleteClient);

export default router;
