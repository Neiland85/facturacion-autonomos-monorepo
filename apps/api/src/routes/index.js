import { Router } from 'express';
import { getUsers, createUser } from '../controllers/userController';
import { getInvoices, createInvoice } from '../controllers/invoiceController';

const router = Router();

// Rutas de usuarios
router.get('/users', getUsers);
router.post('/users', createUser);

// Rutas de facturas
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);

export default router;
