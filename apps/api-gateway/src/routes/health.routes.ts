import { Router } from "express";

const router = Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Gateway is healthy",
    timestamp: new Date().toISOString(),
    service: "api-gateway",
    version: "1.0.0",
  });
});

export default router;
