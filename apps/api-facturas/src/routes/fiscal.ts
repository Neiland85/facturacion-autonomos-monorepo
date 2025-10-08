import { Router } from "express";
import type { Router as RouterType } from "express";
import { calcularImpuestos, validarNIFController } from "../controllers/fiscal";

const router: RouterType = Router();

router.post("/calcular", calcularImpuestos);
router.post("/validar-nif", validarNIFController);

export default router;
