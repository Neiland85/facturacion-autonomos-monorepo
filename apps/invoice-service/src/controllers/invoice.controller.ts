import { Request, Response } from "express";
import { IdempotentRequest } from "../middleware/idempotency.middleware";
import { withTransaction, isUniqueConstraintError } from "@facturacion/database";
import { prisma } from "@facturacion/database";

export class InvoiceController {
  /**
   * Create a new invoice
   */
  static async createInvoice(req: IdempotentRequest, res: Response): Promise<void> {
    try {
      const {
        clientId,
        companyId,
        issueDate,
        dueDate,
        notes,
        lines,
      } = req.body;

      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      // Generate unique invoice number
      const series = "A";
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const number = `${series}${timestamp}${random}`;

      // Calculate totals
      let subtotal = 0;
      let vatAmount = 0;

      for (const line of lines) {
        const lineTotal = line.quantity * line.price;
        subtotal += lineTotal;
        vatAmount += lineTotal * (line.vatRate / 100);
      }

      const total = subtotal + vatAmount;

      // Use transaction for atomicity
      const result = await withTransaction(prisma, async (tx) => {
        try {
          // Check if invoice number already exists (extra safety)
          const existingInvoice = await tx.invoice.findUnique({
            where: { number },
          });

          if (existingInvoice) {
            // Regenerate number if collision
            const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
            const newNumber = `${series}${timestamp}${newRandom}`;

            const invoice = await tx.invoice.create({
              data: {
                number: newNumber,
                series,
                issueDate: new Date(issueDate),
                dueDate: dueDate ? new Date(dueDate) : null,
                subtotal,
                vatAmount,
                total,
                status: "DRAFT",
                notes,
                companyId,
                clientId,
                userId,
                lines: {
                  create: lines.map((line: any) => ({
                    description: line.description,
                    quantity: line.quantity,
                    price: line.price,
                    vatRate: line.vatRate,
                  })),
                },
              },
              include: {
                client: true,
                company: true,
                lines: true,
              },
            });

            return invoice;
          }

          // Create invoice
          const invoice = await tx.invoice.create({
            data: {
              number,
              series,
              issueDate: new Date(issueDate),
              dueDate: dueDate ? new Date(dueDate) : null,
              subtotal,
              vatAmount,
              total,
              status: "DRAFT",
              notes,
              companyId,
              clientId,
              userId,
              lines: {
                create: lines.map((line: any) => ({
                  description: line.description,
                  quantity: line.quantity,
                  price: line.price,
                  vatRate: line.vatRate,
                })),
              },
            },
            include: {
              client: true,
              company: true,
              lines: true,
            },
          });

          return invoice;
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            throw new Error("INVOICE_NUMBER_EXISTS");
          }
          throw error;
        }
      });

      res.status(201).json({
        success: true,
        message: "Factura creada exitosamente",
        data: result,
      });
    } catch (error) {
      console.error("Create invoice error:", error);

      if (error.message === "INVOICE_NUMBER_EXISTS") {
        res.status(409).json({
          success: false,
          message: "Número de factura ya existe",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Update an invoice
   */
  static async updateInvoice(req: IdempotentRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      // For now, simple update (could add optimistic locking later)
      const invoice = await prisma.invoice.update({
        where: {
          id,
          userId, // Ensure user owns the invoice
        },
        data: updates,
        include: {
          client: true,
          company: true,
          lines: true,
        },
      });

      res.json({
        success: true,
        message: "Factura actualizada exitosamente",
        data: invoice,
      });
    } catch (error) {
      console.error("Update invoice error:", error);

      if (error.code === "P2025") {
        res.status(404).json({
          success: false,
          message: "Factura no encontrada",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Delete an invoice (soft delete)
   */
  static async deleteInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      // Soft delete by updating status
      await prisma.invoice.update({
        where: {
          id,
          userId,
        },
        data: {
          status: "CANCELLED",
        },
      });

      res.json({
        success: true,
        message: "Factura eliminada exitosamente",
      });
    } catch (error) {
      console.error("Delete invoice error:", error);

      if (error.code === "P2025") {
        res.status(404).json({
          success: false,
          message: "Factura no encontrada",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Send invoice
   */
  static async sendInvoice(req: IdempotentRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      // Update status to sent
      const invoice = await prisma.invoice.update({
        where: {
          id,
          userId,
          status: "DRAFT", // Only allow sending draft invoices
        },
        data: {
          status: "SENT",
        },
        include: {
          client: true,
          company: true,
          lines: true,
        },
      });

      res.json({
        success: true,
        message: "Factura enviada exitosamente",
        data: invoice,
      });
    } catch (error) {
      console.error("Send invoice error:", error);

      if (error.code === "P2025") {
        res.status(404).json({
          success: false,
          message: "Factura no encontrada o ya enviada",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}