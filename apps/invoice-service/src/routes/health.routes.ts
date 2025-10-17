import { Router } from "express";

const router = Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Invoice Service is healthy",
    timestamp: new Date().toISOString(),
    service: "invoice-service",
    version: "1.0.0",
  });
});

export default router;
