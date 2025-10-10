import { prisma } from "@facturacion/database";
import compression from "compression";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import facturasRoutes from "./routes/facturas-simple";

// Configurar documentación API
const { setupSwagger } = require(
//   path.join(__dirname, "../../config/api-facturas-swagger")
);

const app: express.Application = express();
const PORT = process.env.PORT ?? 3004;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: "Too many requests from this IP, please try again later.",
});

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(compression() as any);
app.use(morgan("combined"));
app.use(limiter as any); // Aplicar rate limiting globalmente

// Middleware para parsing JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Configurar documentación API
setupSwagger(app);

// Ruta de health check
app.get("/health", (req: express.Request, res: express.Response) => {
  res.json({
    status: "OK",
    service: "API Facturas",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Rutas principales
app.use("/api/facturas", facturasRoutes);

// Manejo de errores 404
app.use("*", (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Manejo global de errores
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API de Facturas ejecutándose en puerto ${PORT}`);
  console.log(
    `📖 API Documentation available at: http://localhost:${PORT}/api-docs`
  );
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🔄 Cerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
