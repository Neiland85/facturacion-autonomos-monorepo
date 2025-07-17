import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';
import { catchAsync } from '../middleware/errorHandler';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required:
 *         - client
 *         - items
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the invoice
 *         number:
 *           type: string
 *           description: Invoice number (auto-generated)
 *         series:
 *           type: string
 *           description: Invoice series
 *         date:
 *           type: string
 *           format: date
 *           description: Invoice date
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Payment due date
 *         status:
 *           type: string
 *           enum: [draft, sent, paid, overdue, cancelled]
 *           description: Invoice status
 *         client:
 *           $ref: '#/components/schemas/Client'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LineItem'
 *         notes:
 *           type: string
 *           description: Additional notes
 *         subtotal:
 *           type: number
 *           description: Subtotal amount
 *         totalTax:
 *           type: number
 *           description: Total tax amount
 *         total:
 *           type: number
 *           description: Total amount
 *     
 *     Client:
 *       type: object
 *       required:
 *         - name
 *         - taxId
 *       properties:
 *         name:
 *           type: string
 *           description: Client name
 *         email:
 *           type: string
 *           format: email
 *           description: Client email
 *         taxId:
 *           type: string
 *           description: Tax identification number
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *     
 *     LineItem:
 *       type: object
 *       required:
 *         - description
 *         - quantity
 *         - unitPrice
 *       properties:
 *         description:
 *           type: string
 *           description: Item description
 *         quantity:
 *           type: number
 *           description: Item quantity
 *         unitPrice:
 *           type: number
 *           description: Unit price
 *         discount:
 *           type: number
 *           description: Discount percentage
 *         taxRate:
 *           type: number
 *           description: Tax rate percentage
 */

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', catchAsync(invoiceController.create));

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, paid, overdue, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoices:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Invoice'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get('/', catchAsync(invoiceController.getAll));

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Invoice not found
 */
router.get('/:id', catchAsync(invoiceController.getById));

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Invoice not found
 *       400:
 *         description: Validation error
 */
router.put('/:id', catchAsync(invoiceController.update));

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 */
router.delete('/:id', catchAsync(invoiceController.delete));

/**
 * @swagger
 * /api/invoices/{id}/pdf:
 *   get:
 *     summary: Generate invoice PDF
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Invoice not found
 */
router.get('/:id/pdf', catchAsync(invoiceController.generatePDF));

export { router as invoiceRoutes };
