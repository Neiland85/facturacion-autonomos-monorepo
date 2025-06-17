import { Router } from 'express';
import { getUsers, createUser } from '../controllers/userController';
import { getInvoices, createInvoice } from '../controllers/invoiceController';
import { handleVoiceCommand } from '../controllers/voiceController';
import { getBankAccounts } from '../controllers/bankController';
import { setup2FA, verify2FA, setupWebAuthn, verifyWebAuthn } from '../controllers/securityController';

const router = Router();

// Rutas de usuarios
router.get('/users', getUsers);
router.post('/users', createUser);

// Rutas de facturas
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);

// Ruta para procesar comandos de voz
router.post('/api/voice-command', handleVoiceCommand);

// Ruta para obtener cuentas bancarias
router.post('/api/bank-accounts', getBankAccounts);

// Rutas de seguridad
router.post('/api/security/2fa/setup', setup2FA);
router.post('/api/security/2fa/verify', verify2FA);
router.post('/api/security/webauthn/setup', setupWebAuthn);
router.post('/api/security/webauthn/verify', verifyWebAuthn);

export default router;
