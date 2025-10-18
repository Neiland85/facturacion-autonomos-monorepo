import { Response } from "express";
import { IdempotentRequest } from "../middleware/idempotency.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { withTransaction, isUniqueConstraintError } from "@facturacion/database";
import { prisma } from "@facturacion/database";
import { XmlGeneratorService } from "../services/xml-generator.service";
import { siiIntegrationService } from "../services/sii-integration.service";

export class InvoiceController {
  /**
   * Get paginated list of invoices for the authenticated user
   */
  static async getInvoices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const parseNumberParam = (value: unknown, fallback: number) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
      };

      const page = parseNumberParam(req.query.page, 1);
      const limit = Math.min(parseNumberParam(req.query.limit, 10), 100);
      const statusParam = typeof req.query.status === "string" ? req.query.status : undefined;
      const searchParam = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
      const seriesParam = typeof req.query.series === "string" ? req.query.series.trim() : undefined;
      const dateFromParam = typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined;
      const dateToParam = typeof req.query.dateTo === "string" ? req.query.dateTo : undefined;

      const filters: any[] = [];

      if (statusParam) {
        filters.push({ status: statusParam.toUpperCase() });
      }

      if (seriesParam) {
        filters.push({ series: seriesParam });
      }

      if (dateFromParam) {
        const fromDate = new Date(dateFromParam);
        if (!Number.isNaN(fromDate.getTime())) {
          filters.push({ issueDate: { gte: fromDate } });
        }
      }

      if (dateToParam) {
        const toDate = new Date(dateToParam);
        if (!Number.isNaN(toDate.getTime())) {
          filters.push({ issueDate: { lte: toDate } });
        }
      }

      if (searchParam) {
        filters.push({
          OR: [
            { number: { contains: searchParam, mode: "insensitive" } },
            { notes: { contains: searchParam, mode: "insensitive" } },
            {
              client: {
                name: {
                  contains: searchParam,
                  mode: "insensitive",
                },
              },
            },
            {
              company: {
                name: {
                  contains: searchParam,
                  mode: "insensitive",
                },
              },
            },
          ],
        });
      }

      const where = filters.length
        ? {
            userId,
            AND: filters,
          }
        : { userId };

      const [total, invoices] = await Promise.all([
        prisma.invoice.count({ where }),
        prisma.invoice.findMany({
          where,
          include: {
            client: true,
            company: true,
            lines: true,
          },
          orderBy: { issueDate: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      res.json({
        success: true,
        message: "Facturas obtenidas exitosamente",
        data: {
          items: invoices,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (error) {
      console.error("Get invoices error:", error);

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Get invoice by ID
   */
  static async getInvoiceById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const invoice = await prisma.invoice.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          client: true,
          company: true,
          lines: true,
        },
      });

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: "Factura no encontrada",
        });
        return;
      }

      res.json({
        success: true,
        message: "Factura obtenida exitosamente",
        data: invoice,
      });
    } catch (error) {
      console.error("Get invoice by id error:", error);

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Create a new invoice
   */
  static async createInvoice(req: IdempotentRequest & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        clientId,
        companyId,
        issueDate,
        dueDate,
        notes,
        lines,
      } = req.body;

      const userId = req.user?.id;
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
                    amount: line.quantity * line.price,
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
                  amount: line.quantity * line.price,
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

      if ((error as any).message === "INVOICE_NUMBER_EXISTS") {
        res.status(409).json({
          success: false,
          message: "Ya existe una factura con este número",
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
  static async updateInvoice(req: IdempotentRequest & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.id;

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

      if ((error as any).code === "P2025") {
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
  static async deleteInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

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

      if ((error as any).code === "P2025") {
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
  static async sendInvoice(req: IdempotentRequest & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const userId = req.user?.id;

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

      if ((error as any).code === "P2025") {
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

  /**
   * Get aggregated stats for invoices
   */
  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const numberFromDecimal = (value: any) => (value ? Number(value) : 0);

      const [totals, statusSummary, recentInvoices] = await Promise.all([
        prisma.invoice.aggregate({
          where: { userId },
          _count: { _all: true },
          _sum: {
            subtotal: true,
            vatAmount: true,
            total: true,
          },
        }),
        prisma.invoice.groupBy({
          by: ["status"],
          where: { userId },
          _count: { _all: true },
          _sum: { total: true },
        }),
        prisma.invoice.findMany({
          where: { userId },
          include: {
            client: true,
            company: true,
            lines: true,
          },
          orderBy: { issueDate: "desc" },
          take: 5,
        }),
      ]);

      res.json({
        success: true,
        message: "Estadísticas obtenidas exitosamente",
        data: {
          totals: {
            totalInvoices: totals._count._all ?? 0,
            subtotal: numberFromDecimal(totals._sum?.subtotal),
            vatAmount: numberFromDecimal(totals._sum?.vatAmount),
            totalRevenue: numberFromDecimal(totals._sum?.total),
          },
          byStatus: statusSummary.map((item) => ({
            status: item.status,
            count: item._count._all,
            totalAmount: numberFromDecimal(item._sum.total),
          })),
          recentInvoices,
        },
      });
    } catch (error) {
      console.error("Get invoice stats error:", error);

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Get signed XML for an invoice
   */
  static async getSignedXml(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const invoice = await prisma.invoice.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          client: true,
          company: true,
          lines: true,
        },
      });

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: "Factura no encontrada",
        });
        return;
      }

      // Validar que la factura tiene datos requeridos
      if (!invoice.client || !invoice.company || !invoice.lines || invoice.lines.length === 0) {
        res.status(400).json({
          success: false,
          message: "Invoice data incomplete for XML generation",
        });
        return;
      }

      let signedXml = invoice.signedXml;

      if (!signedXml) {
        try {
          signedXml = await XmlGeneratorService.generateAndSignXml(invoice);

          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              signedXml,
            },
          });
        } catch (generationError) {
          console.error("Error generando XML firmado:", generationError);

          const msg = generationError instanceof Error ? generationError.message : String(generationError);

          // Mapear errores a códigos HTTP específicos
          if (msg.includes("XML transformer")) {
            res.status(503).json({
              success: false,
              message: "XML generation service temporarily unavailable",
            });
            return;
          }

          if (msg.includes("certificate") || msg.includes("certificado")) {
            res.status(500).json({
              success: false,
              message: "Error loading digital certificate",
              details: "Check certificate configuration in environment variables",
            });
            return;
          }

          if (msg.includes("sign") || msg.includes("firma")) {
            res.status(500).json({
              success: false,
              message: "Error during XML signing",
              details: "Check digital signature configuration",
            });
            return;
          }

          res.status(500).json({
            success: false,
            message: "Error generating signed XML",
          });
          return;
        }
      }

      // Detectar estado de firma y timestamp
      const isSigned = signedXml.includes("<ds:Signature>");
      const hasTimestamp = signedXml.includes("<xades:SigningTime>") || signedXml.includes("<xades:TimeStampToken>");

      // Agregar headers de estado
      res.setHeader("Content-Type", "application/xml");
      res.setHeader("Content-Disposition", `attachment; filename="factura-${invoice.number}.xml"`);
      res.setHeader("X-Signature-Status", isSigned ? "signed" : "unsigned");
      res.setHeader("X-Timestamp-Status", hasTimestamp ? "timestamped" : "not-timestamped");

      console.log(`📋 XML descargado: ${invoice.number} (Firma: ${isSigned}, Timestamp: ${hasTimestamp})`);

      res.send(signedXml);
    } catch (error) {
      console.error("Get signed XML error:", error);

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Submit invoice to AEAT SII
   */
  static async submitToAEAT(
    req: (IdempotentRequest & AuthenticatedRequest) | any,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      // Check if SII is enabled
      if (!siiIntegrationService.isEnabled()) {
        res.status(503).json({
          success: false,
          message: "Integración AEAT SII no está habilitada",
        });
        return;
      }

      // Fetch invoice with details
      const invoice = await prisma.invoice.findFirst({
        where: { id, userId },
        include: {
          client: true,
          company: true,
          lines: true,
        },
      });

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: "Factura no encontrada",
        });
        return;
      }

      // Check if already submitted
      if (invoice.siiSent) {
        res.status(409).json({
          success: false,
          message: "Factura ya enviada a AEAT",
          data: {
            siiReference: invoice.siiReference,
            siiSentAt: invoice.siiSentAt,
          },
        });
        return;
      }

      // Submit to AEAT
      await siiIntegrationService.submitInvoiceToAEAT(invoice as any);

      // Fetch updated invoice
      const updatedInvoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: true,
          company: true,
          lines: true,
        },
      });

      res.json({
        success: true,
        message: "Factura enviada a AEAT exitosamente",
        data: {
          invoice: updatedInvoice,
          siiReference: updatedInvoice?.siiReference,
        },
      });
    } catch (error) {
      console.error("Submit to AEAT error:", error);

      res.status(500).json({
        success: false,
        message: "Error al enviar factura a AEAT",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}