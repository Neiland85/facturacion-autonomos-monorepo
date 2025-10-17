import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware";
import { CompanyController } from "../controllers/company.controller";

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/companies/me:
 *   get:
 *     summary: Obtener la empresa del usuario autenticado
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Empresa encontrada
 */
router.get("/me", CompanyController.getMyCompany);

/**
 * @swagger
 * /api/v1/companies:
 *   post:
 *     summary: Crear empresa del usuario
 *     tags: [Companies]
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
 *               - cif
 *               - address
 *               - city
 *               - postalCode
 *               - province
 *             properties:
 *               name:
 *                 type: string
 *               cif:
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
 *         description: Empresa creada correctamente
 */
router.post("/", idempotencyMiddleware(), CompanyController.createCompany);

/**
 * @swagger
 * /api/v1/companies/me:
 *   put:
 *     summary: Actualizar empresa del usuario
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Empresa actualizada correctamente
 */
router.put("/me", idempotencyMiddleware(), CompanyController.updateCompany);

export default router;
