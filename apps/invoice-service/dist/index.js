import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
// Importar extensiones de números llamables
if (process.env.NODE_ENV !== 'test') {
    import('./types/number-callable.prod');
}
// Configurar documentación API
const { setupSwagger } = require(path.join(__dirname, '../../config/invoice-service-swagger'));
const app = express();
const PORT = process.env.PORT ?? 3001;
// Middleware de seguridad
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
        'http://localhost:3000',
    ],
    credentials: true,
}));
// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: 'Demasiadas solicitudes, inténtalo de nuevo más tarde.',
});
app.use(limiter);
// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Logging
app.use(morgan('combined'));
// Configurar documentación API
setupSwagger(app);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'invoice-service',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '1.0.0',
    });
});
// Rutas principales
app.get('/api/invoices/stats', (req, res) => {
    res.json({
        message: 'Invoice service stats endpoint',
        totalInvoices: 0,
        pendingInvoices: 0,
        timestamp: new Date().toISOString(),
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
});
// Error handler
app.use((err, req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
    });
});
app.listen(PORT, () => {
    console.info(`📄 Invoice Service running on port ${PORT}`);
    console.info(`📖 API Documentation available at: http://localhost:${PORT}/api-docs`);
    console.info(`🔒 Security features enabled:`);
    console.info(`   ✅ Helmet security headers`);
    console.info(`   ✅ CORS protection`);
    console.info(`   ✅ Rate limiting`);
});
export default app;
//# sourceMappingURL=index.js.map