import { Router } from "express";

const router = Router();

// Placeholder gateway routes - to be implemented with proxy middleware
router.use("/auth/*", (req, res) => {
  res.json({
    success: false,
    message: "Auth proxy routes not yet implemented",
    path: req.path,
  });
});

router.use("/subscriptions/*", (req, res) => {
  res.json({
    success: false,
    message: "Subscription proxy routes not yet implemented",
    path: req.path,
  });
});

router.use("/invoices/*", (req, res) => {
  res.json({
    success: false,
    message: "Invoice proxy routes not yet implemented",
    path: req.path,
  });
});

export default router;
