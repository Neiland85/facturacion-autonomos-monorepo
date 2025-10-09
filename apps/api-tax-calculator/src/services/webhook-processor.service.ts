import { prisma } from "@facturacion/database";
import { randomUUID } from "crypto";
import {
  AEATWebhookPayload,
  WebhookSignatureService,
} from "./webhook-signature.service";

/**
 * Servicio para procesar webhooks de AEAT y actualizar estados de presentaciones
 */

// Tipos para respuestas de métodos
interface WebhookStatusResponse {
  id: string;
  webhookId: string | null;
  estado: string;
  tipoNotificacion: string;
  origen: string;
  fechaRecepcion: Date;
  fechaProcesamiento: Date | null;
  metodoVerificacion: string | null;
  firmaVerificada: boolean;
  intentos: number;
  ultimoError: string | null;
  presentacion: Record<string, unknown> | null;
}

interface RetryWebhookResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

interface ListWebhooksResponse {
  webhooks: Record<string, unknown>[];
  total: number;
}
export class WebhookProcessorService {
  private signatureService: WebhookSignatureService;

  constructor() {
    this.signatureService = new WebhookSignatureService();
  }

  /**
   * Procesa un webhook recibido de AEAT
   * @param payload - Payload del webhook
   * @param headers - Headers HTTP del webhook
   * @param ipOrigen - IP de origen del webhook
   * @returns ProcessingResult - Resultado del procesamiento
   */
  async processWebhook(
    rawPayload: string,
    headers: Record<string, string>,
    _ipOrigen: string
  ): Promise<{
    success: boolean;
    message: string;
    webhookId?: string;
    processed: boolean;
    error?: string;
  }> {
    try {
      // Parsear el payload
      const payload: AEATWebhookPayload = JSON.parse(rawPayload);

      // Generar ID único para el webhook
      const webhookId = randomUUID();

      // Verificar firma si está presente
      let firmaVerificada = false;
      let metodoVerificacion: string | undefined;

      try {
        const verificationResult = this.signatureService.verifyWebhookIntegrity(
          rawPayload,
          headers
        );
        firmaVerificada = verificationResult.isValid;
        metodoVerificacion = verificationResult.method;
      } catch (error) {
        console.warn("Error verificando firma del webhook:", error);
      }

      // Crear registro del webhook
      const webhookRecord = await prisma.webhookNotificacion.create({
        data: {
          webhookId,
          tipoNotificacion: payload.tipo ?? "DESCONOCIDO",
          origen: "AEAT",
          modeloId: payload.referencia,
          numeroJustificante: payload.datos?.numeroJustificante,
          estado: "PROCESADO",
          payload: payload as unknown as object,
          firmaVerificada,
          metodoVerificacion,
          fechaRecepcion: new Date(),
          fechaProcesamiento: new Date(),
          intentos: 1,
        },
      });

      // Procesar según el tipo de notificación
      await this.processNotificationType(payload, webhookRecord.id);

      return {
        success: true,
        message: "Webhook procesado correctamente",
        webhookId,
        processed: true,
      };
    } catch (error) {
      console.error("Error procesando webhook:", error);
      return {
        success: false,
        message: "Error procesando webhook",
        processed: false,
        error: "Error procesando webhook",
      };
    }
  }

  /**
   * Obtiene el estado de procesamiento de un webhook
   */
  async getWebhookStatus(
    webhookId: string
  ): Promise<WebhookStatusResponse | null> {
    const webhook = await prisma.webhookNotificacion.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      return null;
    }

    // Buscar la presentación relacionada si existe
    const presentacion = webhook.webhookId
      ? await prisma.presentacionModelo.findUnique({
          where: { webhookId: webhook.id },
        })
      : null;

    return {
      id: webhook.id,
      webhookId: webhook.webhookId,
      estado: webhook.estado,
      tipoNotificacion: webhook.tipoNotificacion,
      origen: webhook.origen,
      fechaRecepcion: webhook.fechaRecepcion,
      fechaProcesamiento: webhook.fechaProcesamiento,
      metodoVerificacion: webhook.metodoVerificacion,
      firmaVerificada: webhook.firmaVerificada,
      intentos: webhook.intentos,
      ultimoError: webhook.ultimoError,
      presentacion: presentacion,
    };
  }

  /**
   * Reprocesa webhooks fallidos
   */
  async retryWebhook(webhookId: string): Promise<RetryWebhookResponse> {
    const webhook = await prisma.webhookNotificacion.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      return {
        success: false,
        message: "Webhook no encontrado",
        errors: ["Webhook no encontrado"],
      };
    }

    if (webhook.estado === "PROCESADO") {
      return {
        success: true,
        message: "Webhook ya fue procesado correctamente",
        errors: ["Webhook ya fue procesado correctamente"],
      };
    }

    // Intentar reprocesar
    try {
      const payload = webhook.payload as unknown as AEATWebhookPayload;
      await this.processNotificationType(payload, webhook.id);

      // Actualizar estado
      await prisma.webhookNotificacion.update({
        where: { id: webhook.id },
        data: {
          estado: "PROCESADO",
          fechaProcesamiento: new Date(),
          intentos: { increment: 1 },
          ultimoError: null,
        },
      });

      return {
        success: true,
        message: "Webhook reprocesado correctamente",
      };
    } catch (error) {
      // Actualizar error
      await prisma.webhookNotificacion.update({
        where: { id: webhook.id },
        data: {
          estado: "ERROR",
          intentos: { increment: 1 },
          ultimoIntento: new Date(),
          ultimoError:
            error instanceof Error ? error.message : "Error desconocido",
        },
      });

      return {
        success: false,
        message: "Error reprocesando webhook",
        errors: [error instanceof Error ? error.message : "Error desconocido"],
      };
    }
  }

  /**
   * Lista webhooks con paginación
   */
  async listWebhooks(options: {
    page: number;
    limit: number;
    estado?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<ListWebhooksResponse> {
    const { page, limit, estado, fechaDesde, fechaHasta } = options;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (estado) {
      where.estado = estado;
    }
    if (fechaDesde || fechaHasta) {
      where.fechaRecepcion = {};
      if (fechaDesde)
        (where.fechaRecepcion as Record<string, unknown>).gte = fechaDesde;
      if (fechaHasta)
        (where.fechaRecepcion as Record<string, unknown>).lte = fechaHasta;
    }

    const [webhooks, total] = await Promise.all([
      prisma.webhookNotificacion.findMany({
        where,
        orderBy: { fechaRecepcion: "desc" },
        skip,
        take: limit,
        include: {
          presentacion: true,
        },
      }),
      prisma.webhookNotificacion.count({ where }),
    ]);

    return {
      webhooks,
      total,
    };
  }

  /**
   * Procesa el tipo específico de notificación
   */
  private async processNotificationType(
    payload: AEATWebhookPayload,
    webhookId: string
  ): Promise<void> {
    switch (payload.tipo) {
      case "PRESENTACION_ACEPTADA":
        await this.handlePresentacionAceptada(payload, webhookId);
        break;
      case "PRESENTACION_RECHAZADA":
        await this.handlePresentacionRechazada(payload, webhookId);
        break;
      case "PRESENTACION_CORREGIDA":
        await this.handlePresentacionCorregida(payload, webhookId);
        break;
      default:
        console.log("Tipo de notificación no manejado:", payload.tipo);
    }
  }

  /**
   * Maneja presentaciones aceptadas
   */
  private async handlePresentacionAceptada(
    payload: AEATWebhookPayload,
    webhookId: string
  ): Promise<void> {
    if (!payload.referencia) return;

    // Extraer trimestre del periodo (ej: "2024T1" -> trimestre = 1)
    const trimestreMatch = payload.periodo.match(/T(\d+)/);
    const trimestre = trimestreMatch?.[1] ? parseInt(trimestreMatch[1]) : null;

    // Usar referencia como usuarioId por ahora (debería extraerse del JWT o similar)
    // Validar formato de referencia antes de extraer usuarioId
    // Ejemplo de formato esperado: "userId-modelo-ejercicio-periodo"
    const referenciaRegex =
      /^([a-zA-Z0-9_]+)-[a-zA-Z0-9_]+-[a-zA-Z0-9_]+-[a-zA-Z0-9_]+$/;
    let usuarioId: string;
    if (referenciaRegex.test(payload.referencia)) {
      usuarioId = payload.referencia.split("-")[0] ?? "unknown";
    } else {
      console.error("Formato de referencia inválido:", payload.referencia);
      return;
    }

    // Crear o actualizar presentación
    const presentacion = await prisma.presentacionModelo.upsert({
      where: {
        usuarioId_modelo_ejercicio_periodo: {
          usuarioId,
          modelo: payload.modelo,
          ejercicio: payload.ejercicio,
          periodo: payload.periodo,
        },
      },
      update: {
        estado: "ACEPTADO",
        numeroJustificante: payload.datos?.numeroJustificante,
        fechaAceptacion: new Date(payload.fechaEvento),
        webhookId,
      },
      create: {
        modelo: payload.modelo,
        ejercicio: payload.ejercicio,
        periodo: payload.periodo,
        trimestre,
        estado: "ACEPTADO",
        numeroJustificante: payload.datos?.numeroJustificante,
        fechaPresentacion: new Date(payload.fechaEvento),
        fechaAceptacion: new Date(payload.fechaEvento),
        usuarioId,
        webhookId,
        importeTotal:
          payload.datos?.importeIngresar ?? payload.datos?.importeDevolucion,
        datosPresentacion: payload as unknown as object,
      },
    });

    console.log("Presentación aceptada procesada:", presentacion.id);
  }

  /**
   * Maneja presentaciones rechazadas
   */
  private async handlePresentacionRechazada(
    payload: AEATWebhookPayload,
    webhookId: string
  ): Promise<void> {
    if (!payload.referencia) return;

    const trimestreMatch = payload.periodo.match(/T(\d+)/);
    const trimestre = trimestreMatch?.[1] ? parseInt(trimestreMatch[1]) : null;
    const usuarioId = payload.referencia.split("-")[0] ?? "unknown";

    await prisma.presentacionModelo.upsert({
      where: {
        usuarioId_modelo_ejercicio_periodo: {
          usuarioId,
          modelo: payload.modelo,
          ejercicio: payload.ejercicio,
          periodo: payload.periodo,
        },
      },
      update: {
        estado: "RECHAZADO",
        webhookId,
      },
      create: {
        modelo: payload.modelo,
        ejercicio: payload.ejercicio,
        periodo: payload.periodo,
        trimestre,
        estado: "RECHAZADO",
        fechaPresentacion: new Date(payload.fechaEvento),
        usuarioId,
        webhookId,
        datosPresentacion: payload as unknown as object,
      },
    });
  }

  /**
   * Maneja presentaciones corregidas
   */
  private async handlePresentacionCorregida(
    payload: AEATWebhookPayload,
    webhookId: string
  ): Promise<void> {
    if (!payload.referencia) return;

    const trimestreMatch = payload.periodo.match(/T(\d+)/);
    const trimestre = trimestreMatch?.[1] ? parseInt(trimestreMatch[1]) : null;
    const usuarioId = payload.referencia.split("-")[0] ?? "unknown";

    await prisma.presentacionModelo.upsert({
      where: {
        usuarioId_modelo_ejercicio_periodo: {
          usuarioId,
          modelo: payload.modelo,
          ejercicio: payload.ejercicio,
          periodo: payload.periodo,
        },
      },
      update: {
        estado: "CORREGIDO",
        numeroJustificante: payload.datos?.numeroJustificante,
        fechaAceptacion: new Date(payload.fechaEvento),
        webhookId,
      },
      create: {
        modelo: payload.modelo,
        ejercicio: payload.ejercicio,
        periodo: payload.periodo,
        trimestre,
        estado: "CORREGIDO",
        numeroJustificante: payload.datos?.numeroJustificante,
        fechaPresentacion: new Date(payload.fechaEvento),
        fechaAceptacion: new Date(payload.fechaEvento),
        usuarioId,
        webhookId,
        datosPresentacion: payload as unknown as object,
      },
    });
  }
}
