import { Router } from 'express';
import { generateInvoicePDF } from '../controllers/pdfController';
import { validateInvoice } from '../middlewares/validationMiddleware';

const router = Router();

// Ruta para generar facturas en PDF
router.post('/generate-pdf', validateInvoice, generateInvoicePDF);

export default router;
