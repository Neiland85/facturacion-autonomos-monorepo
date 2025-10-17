import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// Import routes
import invoiceRoutes from "./routes/invoice.routes";
import healthRoutes from "./routes/health.routes";
import clientRoutes from "./routes/client.routes";
import companyRoutes from "./routes/company.routes";

// Validación temprana de variables de entorno críticas
if (!process.env.JWT_ACCESS_SECRET) {
  console.error('❌ ERROR CRÍTICO: JWT_ACCESS_SECRET no está definido');
  console.error('💡 Configura la variable de entorno JWT_ACCESS_SECRET antes de iniciar el servidor');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression() as any);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/companies", companyRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Invoice Service running on port ${PORT}`);
});

export default app;
