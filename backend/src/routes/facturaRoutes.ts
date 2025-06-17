import { Router } from 'express';
import { getAllFacturas, createFactura } from '../controllers/facturaController';

const router = Router();

router.get('/', getAllFacturas);
router.post('/', createFactura);

export default router;
