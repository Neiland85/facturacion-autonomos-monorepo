// Archivo de rutas principales
import { Router } from 'express';

const router = Router();

// Ejemplo de ruta
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default router;
