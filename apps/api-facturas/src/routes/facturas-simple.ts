import express from "express";
import { FacturasController } from "../controllers/facturas";

const router = express.Router();

// Rutas básicas para facturas
router.get("/", FacturasController.getAll);
router.get("/:id", FacturasController.getById);
router.post("/", FacturasController.create);
router.put("/:id", FacturasController.update);
router.delete("/:id", FacturasController.delete);

export default router;
