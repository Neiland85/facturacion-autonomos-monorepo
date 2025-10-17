import express from "express";

const router = express.Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth Service is healthy",
    timestamp: new Date().toISOString(),
    service: "auth-service",
    version: "1.0.0",
  });
});

export default router;
