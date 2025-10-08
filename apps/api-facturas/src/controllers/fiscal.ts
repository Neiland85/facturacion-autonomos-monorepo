import { Request, Response } from "express";
import { validarNIF } from "../utils/fiscal";

// Funciones fiscales locales
const calcularIVA = (base: number, tipo: number = 0.21): number => {
  return base * tipo;
};

const calcularIRPF = (base: number, tipo: number = 0.15): number => {
  return base * tipo;
};

export const calcularImpuestos = async (req: Request, res: Response) => {
  try {
    const { baseImponible, tipoIVA = 21, tipoIRPF = 15 } = req.body;

    if (!baseImponible || baseImponible <= 0) {
      return res.status(400).json({ error: "Base imponible inválida" });
    }

    const iva = calcularIVA(baseImponible, tipoIVA / 100);
    const irpf = calcularIRPF(baseImponible, tipoIRPF / 100);
    const total = baseImponible + iva - irpf;

    res.json({
      baseImponible,
      iva,
      irpf,
      total,
    });
  } catch (error) {
    console.error("Error al calcular impuestos:", error);
    res.status(500).json({ error: "Error al calcular impuestos" });
  }
};

export const validarNIFController = async (req: Request, res: Response) => {
  try {
    const { nif } = req.body;
    const valido = validarNIF(nif);
    res.json({ nif, valido });
  } catch (error) {
    console.error("Error al validar NIF:", error);
    res.status(500).json({ error: "Error al validar NIF" });
  }
};
