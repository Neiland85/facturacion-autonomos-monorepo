import { Request, Response } from "express";
import { z } from "zod";
import { WebhookProcessorService } from "../services/webhook-processor.service";

/**
 * Controlador para manejar webhooks de AEAT
 */
export class WebhookController {
  private readonly webhookProcessor: WebhookProcessorService;

  constructor() {
    this.webhookProcessor = new WebhookProcessorService();
  }

  /**
   * Endpoint para recibir webhooks de AEAT
   * POST /api/webhooks/aeat
   */
  public receiveAeatWebhook = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Obtener payload crudo como string
      const rawPayload = JSON.stringify(req.body);

      // Obtener headers
      const headers: Record<string, string> = {};
      Object.keys(req.headers).forEach((key) => {
        const value = req.headers[key];
        if (typeof value === "string") {
          headers[key] = value;
        } else if (Array.isArray(value)) {
          headers[key] = value.join(", ");
        }
      });

      // Obtener IP de origen
      const ipOrigen = this.getClientIp(req);

      console.log("Recibiendo webhook AEAT:", {
        ip: ipOrigen,
        headers: this.filterSensitiveHeaders(headers),
        payloadSize: rawPayload.length,
      });

      // Procesar webhook
      const result = await this.webhookProcessor.processWebhook(
        rawPayload,
        headers,
        ipOrigen
      );

      if (result.success) {
        res.status(200).json({
          status: "success",
          message: result.message,
          webhookId: result.webhookId,
        });
      } else {
        console.error("Error procesando webhook AEAT:", result.error);
        res.status(400).json({
          status: "error",
          message: "Error procesando webhook",
          errors: result.error,
          webhookId: result.webhookId,
        });
      }
    } catch (error) {
      console.error("Error en webhook endpoint:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
      });
    }
  };

  /**
   * Endpoint para verificar el estado de un webhook
   * GET /api/webhooks/aeat/:webhookId/status
   */
  public getWebhookStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const webhookIdSchema = z.string().uuid();
      const webhookId = webhookIdSchema.parse(req.params.webhookId);

      const status = await this.webhookProcessor.getWebhookStatus(webhookId);

      if (!status) {
        res.status(404).json({
          status: "error",
          message: "Webhook no encontrado",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: status,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: "error",
          message: "ID de webhook inválido",
          errors: error.errors,
        });
        return;
      }

      console.error("Error obteniendo estado del webhook:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
      });
    }
  };

  /**
   * Endpoint para reenviar un webhook fallido
   * POST /api/webhooks/aeat/:webhookId/retry
   */
  public retryWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const webhookIdSchema = z.string().uuid();
      const webhookId = webhookIdSchema.parse(req.params.webhookId);

      const result = await this.webhookProcessor.retryWebhook(webhookId);

      if (result.success) {
        res.status(200).json({
          status: "success",
          message: result.message,
        });
      } else {
        res.status(400).json({
          status: "error",
          message: result.message,
          errors: result.errors,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: "error",
          message: "ID de webhook inválido",
          errors: error.errors,
        });
        return;
      }

      console.error("Error reintentando webhook:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
      });
    }
  };

  /**
   * Endpoint para listar webhooks (con paginación)
   * GET /api/webhooks/aeat
   */
  public listWebhooks = async (req: Request, res: Response): Promise<void> => {
    try {
      const querySchema = z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("10"),
        estado: z.enum(["PENDIENTE", "PROCESADO", "ERROR"]).optional(),
        fechaDesde: z.string().optional(),
        fechaHasta: z.string().optional(),
      });

      const query = querySchema.parse(req.query);
      const page = parseInt(query.page);
      const limit = parseInt(query.limit);

      const result = await this.webhookProcessor.listWebhooks({
        page,
        limit,
        estado: query.estado,
        fechaDesde: query.fechaDesde ? new Date(query.fechaDesde) : undefined,
        fechaHasta: query.fechaHasta ? new Date(query.fechaHasta) : undefined,
      });

      res.status(200).json({
        status: "success",
        data: result.webhooks,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: "error",
          message: "Parámetros de consulta inválidos",
          errors: error.errors,
        });
        return;
      }

      console.error("Error listando webhooks:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
      });
    }
  };

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0]?.trim() ?? "unknown";
    }
    return req.socket.remoteAddress ?? "unknown";
  }

  /**
   * Filtra headers sensibles para logging
   */
  private filterSensitiveHeaders(
    headers: Record<string, string>
  ): Record<string, string> {
    const filtered = { ...headers };

    // Ocultar headers sensibles
    const sensitiveHeaders = [
      "authorization",
      "x-aeat-signature",
      "x-aeat-hmac",
    ];
    sensitiveHeaders.forEach((header) => {
      if (filtered[header]) {
        filtered[header] = "***";
      }
    });

    return filtered;
  }
}
