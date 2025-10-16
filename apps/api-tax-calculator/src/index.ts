import "dotenv/config";
import express from "express";
import path from "path";

// Configurar documentación API
const { setupSwagger } = require(
  path.join(__dirname, "../../config/api-tax-calculator-swagger")
);

const app: express.Application = express();
const PORT = process.env.PORT ?? 3004;

// Trust proxy for rate limiting and IP logging behind proxies/CDNs
app.set("trust proxy", 1);

// TODO: Crear middlewares faltantes
// import { errorHandler } from './middleware/errorHandler';
// import { requestLogger } from './middleware/logger.middleware';

// TODO: Verificar rutas existentes
// import { configuracionFiscalRoutes } from './routes/configuracion-fiscal.routes';
// import { quarterClosureRoutes } from './routes/quarter-closure.routes';
// import { taxRoutes } from './routes/tax.routes';
// import { webhookRoutes } from './routes/webhook.routes';
import healthRoutes from "./routes/health.routes";

// Configurar documentación API
setupSwagger(app);

// Health check
app.use("/api/health", healthRoutes);

// Rutas
// TODO: Crear rutas faltantes
// app.use('/api/tax', taxRoutes);
// app.use('/api/quarter-closure', quarterClosureRoutes);
// app.use('/api/configuracion-fiscal', configuracionFiscalRoutes);
// app.use('/api/webhooks', webhookRoutes);

// Error handler básico
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🧾 Tax Calculator API running on port ${PORT}`);
  console.log(
    `📖 API Documentation available at: http://localhost:${PORT}/api-docs`
  );
  console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);

  // TODO: Habilitar cron jobs cuando estén disponibles
  // cronManager.startCronJobs();
});

// Manejo de señales de cierre
process.on("SIGTERM", async () => {
  console.log("Señal SIGTERM recibida, cerrando servidor...");

  // TODO: Habilitar cuando cron jobs estén disponibles
  // await cronManager.shutdown();

  // Cerrar servidor
  server.close(() => {
    console.log("Servidor cerrado correctamente");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("Señal SIGINT recibida, cerrando servidor...");

  // TODO: Habilitar cuando cron jobs estén disponibles
  // await cronManager.shutdown();

  // Cerrar servidor
  server.close(() => {
    console.log("Servidor cerrado correctamente");
    process.exit(0);
  });
});
