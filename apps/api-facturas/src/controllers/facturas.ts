import { Request, Response } from "express";
import { prisma } from "@facturacion/database";

export class FacturasController {
  /**
   * Obtener todas las facturas
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const facturas = await prisma.factura.findMany({
        include: {
          cliente: true,
          items: true,
        },
        orderBy: {
          fechaCreacion: "desc",
        },
      });

      res.json({
        success: true,
        data: facturas,
        total: facturas.length,
      });
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  /**
   * Obtener una factura por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const factura = await prisma.factura.findUnique({
        where: { id },
        include: {
          cliente: true,
          items: true,
        },
      });

      if (!factura) {
        res.status(404).json({
          success: false,
          error: "Factura no encontrada",
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
      });
    } catch (error) {
      console.error("Error al obtener factura:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  /**
   * Crear una nueva factura
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const facturaData = req.body;

      // Validación básica
      if (!facturaData.numeroFactura || !facturaData.clienteId) {
        res.status(400).json({
          success: false,
          error:
            "Datos requeridos faltantes: numeroFactura y clienteId son obligatorios",
        });
        return;
      }

      const factura = await prisma.factura.create({
        data: facturaData,
        include: {
          cliente: true,
          items: true,
        },
      });

      res.status(201).json({
        success: true,
        data: factura,
        message: "Factura creada exitosamente",
      });
    } catch (error) {
      console.error("Error al crear factura:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  /**
   * Actualizar una factura
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const factura = await prisma.factura.update({
        where: { id },
        data: updateData,
        include: {
          cliente: true,
          items: true,
        },
      });

      res.json({
        success: true,
        data: factura,
        message: "Factura actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar factura:", error);

      if ((error as any).code === "P2025") {
        res.status(404).json({
          success: false,
          error: "Factura no encontrada",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  /**
   * Eliminar una factura
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.factura.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: "Factura eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar factura:", error);

      if ((error as any).code === "P2025") {
        res.status(404).json({
          success: false,
          error: "Factura no encontrada",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }
}
