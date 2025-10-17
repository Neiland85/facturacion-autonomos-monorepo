import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

// Proxy to Auth Service
router.use(
  "/auth/*",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    changeOrigin: true,
    preserveHeaderKeyCase: true, // Important for Idempotency-Key header
    pathRewrite: {
      "^/auth": "", // Remove /auth prefix when forwarding
    },
    onProxyReq: (proxyReq, req) => {
      console.log(`[Gateway] Proxying ${req.method} ${req.path} to Auth Service`);
    },
    onError: (err, req, res) => {
      console.error("[Gateway] Auth service proxy error:", err);
      if (res && typeof res.status === 'function') {
        res.status(502).json({
          success: false,
          message: "Auth service unavailable",
        });
      }
    },
  })
);

// Proxy to Subscription Service
router.use(
  "/subscriptions/*",
  createProxyMiddleware({
    target: process.env.SUBSCRIPTION_SERVICE_URL || "http://localhost:3003",
    changeOrigin: true,
    preserveHeaderKeyCase: true,
    pathRewrite: {
      "^/subscriptions": "",
    },
    onProxyReq: (proxyReq, req) => {
      console.log(`[Gateway] Proxying ${req.method} ${req.path} to Subscription Service`);
    },
    onError: (err, req, res) => {
      console.error("[Gateway] Subscription service proxy error:", err);
      if (res && typeof res.status === 'function') {
        res.status(502).json({
          success: false,
          message: "Subscription service unavailable",
        });
      }
    },
  })
);

// Proxy to Invoice Service
router.use(
  "/invoices/*",
  createProxyMiddleware({
    target: process.env.INVOICE_SERVICE_URL || "http://localhost:3002",
    changeOrigin: true,
    preserveHeaderKeyCase: true,
    pathRewrite: {
      "^/invoices": "",
    },
    onProxyReq: (proxyReq, req) => {
      console.log(`[Gateway] Proxying ${req.method} ${req.path} to Invoice Service`);
    },
    onError: (err, req, res) => {
      console.error("[Gateway] Invoice service proxy error:", err);
      if (res && typeof res.status === 'function') {
        res.status(502).json({
          success: false,
          message: "Invoice service unavailable",
        });
      }
    },
  })
);

export default router;
