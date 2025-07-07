import { PrismaClient } from '@prisma/client';
import { AEATWebhookPayload, WebhookSignatureService } from './webhook-signature.service';

const prisma = new PrismaClient();

/**
 * Servicio para procesar webhooks de AEAT y actualizar estados de presentaciones
 */
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
   * @returns ProcessingResult - Resultado d      return {
        webhooks: webhooks.map((webhook: any) => ({
          id: webhook.id,
          estado: webhook.estado,
          tipoNotificacion: webhook.tipoNotificacion,
          origen: webhook.origen,
          fechaRecepcion: webhook.fechaRecepcion,
          fechaProcesamiento: webhook.fechaProcesamiento,
          metodoVerificacion: webhook.metodoVerificacion,
          usuarioId: webhook.usuarioId,
          usuario: webhook.usuario,
          intentos: webhook.intentos,
          ultimoError: webhook.ultimoError
        })),
        total
      };
   */
  public async processWebhook(
    payload: string,
    headers: Record<string, string>,
    ipOrigen?: string
  ): Promise<WebhookProcessingResult> {
    const result: WebhookProcessingResult = {
      success: false,
      webhookId: '',
      message: '',
      errors: [],
    };

    try {
      // 1. Verificar firma digital
      const verificationResult = this.signatureService.verifyWebhookIntegrity(payload, headers);

      if (!verificationResult.isValid) {
        result.errors.push(`Firma inválida: ${verificationResult.errors.join(', ')}`);
        await this.saveFailedWebhook(payload, headers, ipOrigen, result.errors);
        return result;
      }

      // 2. Parsear payload
      let parsedPayload: AEATWebhookPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (error) {
        console.error('Error parsing JSON payload:', error);
        result.errors.push('Payload JSON inválido');
        await this.saveFailedWebhook(payload, headers, ipOrigen, result.errors);
        return result;
      }

      // 3. Validar estructura del payload
      const validationErrors = this.validatePayloadStructure(parsedPayload);
      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
        await this.saveFailedWebhook(payload, headers, ipOrigen, result.errors);
        return result;
      }

      // 4. Guardar notificación webhook
      const webhookNotificacion = await this.saveWebhookNotification(
        payload,
        headers,
        ipOrigen,
        parsedPayload,
        verificationResult.method
      );
      result.webhookId = webhookNotificacion.id;

      // 5. Procesar según tipo de notificación
      const processingSuccess = await this.processNotificationByType(
        parsedPayload,
        webhookNotificacion.id
      );

      if (processingSuccess) {
        // Marcar webhook como procesado
        await prisma.webhookNotificacion.update({
          where: { id: webhookNotificacion.id },
          data: {
            estado: 'PROCESADO',
            fechaProcesamiento: new Date(),
          },
        });

        result.success = true;
        result.message = 'Webhook procesado correctamente';
      } else {
        result.errors.push('Error procesando notificación');
      }
    } catch (error) {
      console.error('Error procesando webhook:', error);
      result.errors.push(
        `Error interno: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      if (result.webhookId) {
        await this.markWebhookAsError(result.webhookId, result.errors.join('; '));
      }
    }

    return result;
  }

  /**
   * Valida la estructura del payload AEAT
   */
  private validatePayloadStructure(payload: AEATWebhookPayload): string[] {
    const errors: string[] = [];

    if (!payload.tipo) errors.push('Campo "tipo" requerido');
    if (!payload.modelo) errors.push('Campo "modelo" requerido');
    if (!payload.ejercicio) errors.push('Campo "ejercicio" requerido');
    if (!payload.periodo) errors.push('Campo "periodo" requerido');
    if (!payload.referencia) errors.push('Campo "referencia" requerido');
    if (!payload.estado) errors.push('Campo "estado" requerido');
    if (!payload.fechaEvento) errors.push('Campo "fechaEvento" requerido');

    // Validar formato de referencia AEAT
    if (payload.referencia && !this.signatureService.validateAEATReference(payload.referencia)) {
      errors.push('Formato de referencia AEAT inválido');
    }

    // Validar CSV si está presente
    if (payload.csv && !this.signatureService.validateCSV(payload.csv)) {
      errors.push('Formato de CSV inválido');
    }

    return errors;
  }

  /**
   * Guarda la notificación webhook en base de datos
   */
  private async saveWebhookNotification(
    payload: string,
    headers: Record<string, string>,
    ipOrigen: string | undefined,
    parsedPayload: AEATWebhookPayload,
    _verificationMethod: string
  ) {
    const tipoNotificacion = this.mapTipoNotificacion(parsedPayload.tipo);
    const origenWebhook = this.determineWebhookOrigin(headers);

    return await prisma.webhookNotificacion.create({
      data: {
        origenWebhook,
        tipoNotificacion,
        numeroModelo: parsedPayload.modelo,
        payload,
        firma: headers['x-aeat-signature'] || headers['x-signature'] || '',
        firmaValida: true,
        estado: 'PENDIENTE',
        userAgent: headers['user-agent'],
        ipOrigen,
        referenciaAEAT: parsedPayload.referencia,
        csvNotificacion: parsedPayload.csv,
        fechaEvento: parsedPayload.fechaEvento ? new Date(parsedPayload.fechaEvento) : null,
      },
    });
  }

  /**
   * Procesa la notificación según su tipo
   */
  private async processNotificationByType(
    payload: AEATWebhookPayload,
    webhookId: string
  ): Promise<boolean> {
    try {
      // Buscar la presentación correspondiente
      const presentacion = await prisma.presentacionModelo.findFirst({
        where: {
          numeroModelo: payload.modelo,
          ejercicio: payload.ejercicio,
          periodo: payload.periodo,
          referenciaCompleta: payload.referencia,
        },
      });

      if (!presentacion) {
        console.warn(
          `Presentación no encontrada para: ${payload.modelo}/${payload.ejercicio}/${payload.periodo}`
        );
        return false;
      }

      // Relacionar webhook con presentación
      await prisma.webhookNotificacion.update({
        where: { id: webhookId },
        data: { presentacionId: presentacion.id },
      });

      // Actualizar estado según tipo de notificación
      switch (payload.tipo.toUpperCase()) {
        case 'PRESENTACION_ACEPTADA':
          return await this.processPresentacionAceptada(presentacion.id, payload);

        case 'PRESENTACION_RECHAZADA':
          return await this.processPresentacionRechazada(presentacion.id, payload);

        case 'SUBSANACION_REQUERIDA':
          return await this.processSubsanacionRequerida(presentacion.id, payload);

        case 'LIQUIDACION_GENERADA':
          return await this.processLiquidacionGenerada(presentacion.id, payload);

        case 'DEVOLUCION_AUTORIZADA':
          return await this.processDevolucionAutorizada(presentacion.id, payload);

        case 'INGRESO_REALIZADO':
          return await this.processIngresoRealizado(presentacion.id, payload);

        case 'ACTUALIZACION_ESTADO':
          return await this.processActualizacionEstado(presentacion.id, payload);

        default:
          console.warn(`Tipo de notificación no soportado: ${payload.tipo}`);
          return false;
      }
    } catch (error) {
      console.error('Error procesando notificación:', error);
      return false;
    }
  }

  /**
   * Procesa notificación de presentación aceptada
   */
  private async processPresentacionAceptada(
    presentacionId: string,
    payload: AEATWebhookPayload
  ): Promise<boolean> {
    await prisma.presentacionModelo.update({
      where: { id: presentacionId },
      data: {
        estado: 'ACEPTADO',
        csv: payload.csv,
        numeroJustificante: payload.datos?.numeroJustificante,
        fechaActualizacion: new Date(),
      },
    });
    return true;
  }

  /**
   * Procesa notificación de presentación rechazada
   */
  private async processPresentacionRechazada(
    presentacionId: string,
    _payload: AEATWebhookPayload
  ): Promise<boolean> {
    await prisma.presentacionModelo.update({
      where: { id: presentacionId },
      data: {
        estado: 'RECHAZADO',
        fechaActualizacion: new Date(),
      },
    });
    return true;
  }

  /**
   * Procesa notificación de subsanación requerida
   */
  private async processSubsanacionRequerida(
    presentacionId: string,
    _payload: AEATWebhookPayload
  ): Promise<boolean> {
    await prisma.presentacionModelo.update({
      where: { id: presentacionId },
      data: {
        estado: 'SUBSANACION',
        fechaActualizacion: new Date(),
      },
    });
    return true;
  }

  /**
   * Procesa notificación de liquidación generada
   */
  private async processLiquidacionGenerada(
    presentacionId: string,
    payload: AEATWebhookPayload
  ): Promise<boolean> {
    await prisma.presentacionModelo.update({
      where: { id: presentacionId },
      data: {
        estado: 'PROCESADO',
        importeIngresar: payload.datos?.importeIngresar,
        importeDevolucion: payload.datos?.importeDevolucion,
        fechaActualizacion: new Date(),
      },
    });
    return true;
  }

  /**
   * Procesa notificación de devolución autorizada
   */
  private async processDevolucionAutorizada(
    presentacionId: string,
    payload: AEATWebhookPayload
  ): Promise<boolean> {
    await prisma.presentacionModelo.update({
      where: { id: presentacionId },
      data: {
        estado: 'PROCESADO',
        importeDevolucion: payload.datos?.importeDevolucion,
        fechaActualizacion: new Date(),
      },
    });
    return true;
  }

  /**
   * Procesa notificación de ingreso realizado
   */
  private async processIngresoRealizado(
    presentacionId: string,
    _payload: AEATWebhookPayload
  ): Promise<boolean> {
    await prisma.presentacionModelo.update({
      where: { id: presentacionId },
      data: {
        estado: 'PROCESADO',
        fechaActualizacion: new Date(),
      },
    });
    return true;
  }

  /**
   * Procesa actualización general de estado
   */
  private async processActualizacionEstado(
    presentacionId: string,
    payload: AEATWebhookPayload
  ): Promise<boolean> {
    const nuevoEstado = this.mapEstadoAEAT(payload.estado);

    await prisma.presentacionModelo.update({
      where: { id: presentacionId },
      data: {
        estado: nuevoEstado,
        fechaActualizacion: new Date(),
      },
    });
    return true;
  }

  /**
   * Mapea tipos de notificación a enums de base de datos
   */
  private mapTipoNotificacion(tipo: string): any {
    const mapping: Record<string, any> = {
      PRESENTACION_ACEPTADA: 'PRESENTACION_ACEPTADA',
      PRESENTACION_RECHAZADA: 'PRESENTACION_RECHAZADA',
      SUBSANACION_REQUERIDA: 'SUBSANACION_REQUERIDA',
      LIQUIDACION_GENERADA: 'LIQUIDACION_GENERADA',
      DEVOLUCION_AUTORIZADA: 'DEVOLUCION_AUTORIZADA',
      INGRESO_REALIZADO: 'INGRESO_REALIZADO',
      ERROR_PROCESAMIENTO: 'ERROR_PROCESAMIENTO',
      ACTUALIZACION_ESTADO: 'ACTUALIZACION_ESTADO',
    };
    return mapping[tipo.toUpperCase()] || 'ACTUALIZACION_ESTADO';
  }

  /**
   * Mapea estados de AEAT a enums de base de datos
   */
  private mapEstadoAEAT(estado: string): any {
    const mapping: Record<string, any> = {
      ACEPTADO: 'ACEPTADO',
      RECHAZADO: 'RECHAZADO',
      PROCESADO: 'PROCESADO',
      SUBSANACION: 'SUBSANACION',
      ERROR: 'ERROR_TECNICO',
    };
    return mapping[estado.toUpperCase()] || 'PRESENTADO';
  }

  /**
   * Determina el origen del webhook basado en headers
   */
  private determineWebhookOrigin(headers: Record<string, string>): any {
    const userAgent = headers['user-agent']?.toLowerCase() || '';

    if (userAgent.includes('aeat-sandbox')) {
      return 'AEAT_SANDBOX';
    } else if (userAgent.includes('aeat')) {
      return 'AEAT_PRODUCCION';
    } else {
      return 'SISTEMA_INTERNO';
    }
  }

  /**
   * Guarda un webhook fallido
   */
  private async saveFailedWebhook(
    payload: string,
    headers: Record<string, string>,
    ipOrigen: string | undefined,
    errors: string[]
  ) {
    try {
      await prisma.webhookNotificacion.create({
        data: {
          origenWebhook: this.determineWebhookOrigin(headers),
          tipoNotificacion: 'ERROR_PROCESAMIENTO',
          payload,
          firma: headers['x-aeat-signature'] || headers['x-signature'] || '',
          firmaValida: false,
          estado: 'ERROR',
          mensajeError: errors.join('; '),
          userAgent: headers['user-agent'],
          ipOrigen,
        },
      });
    } catch (error) {
      console.error('Error guardando webhook fallido:', error);
    }
  }

  /**
   * Marca un webhook como error
   */
  private async markWebhookAsError(webhookId: string, errorMessage: string) {
    try {
      await prisma.webhookNotificacion.update({
        where: { id: webhookId },
        data: {
          estado: 'ERROR',
          mensajeError: errorMessage,
          fechaProcesamiento: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marcando webhook como error:', error);
    }
  }

  /**
   * Reintenta procesar webhooks fallidos
   */
  public async retryFailedWebhooks(maxRetries: number = 3): Promise<number> {
    let processedCount = 0;

    try {
      const failedWebhooks = await prisma.webhookNotificacion.findMany({
        where: {
          estado: 'ERROR',
          intentosProceso: { lt: maxRetries },
        },
        orderBy: { fechaRecepcion: 'asc' },
        take: 10, // Procesar máximo 10 a la vez
      });

      for (const webhook of failedWebhooks) {
        try {
          // Incrementar contador de intentos
          await prisma.webhookNotificacion.update({
            where: { id: webhook.id },
            data: {
              intentosProceso: webhook.intentosProceso + 1,
              estado: 'REINTENTO',
            },
          });

          // Parsear payload y reintentarlo
          const parsedPayload = JSON.parse(webhook.payload);
          const success = await this.processNotificationByType(parsedPayload, webhook.id);

          if (success) {
            await prisma.webhookNotificacion.update({
              where: { id: webhook.id },
              data: {
                estado: 'PROCESADO',
                fechaProcesamiento: new Date(),
              },
            });
            processedCount++;
          } else {
            await prisma.webhookNotificacion.update({
              where: { id: webhook.id },
              data: { estado: 'ERROR' },
            });
          }
        } catch (error) {
          console.error(`Error reintentando webhook ${webhook.id}:`, error);
          await prisma.webhookNotificacion.update({
            where: { id: webhook.id },
            data: { estado: 'ERROR' },
          });
        }
      }
    } catch (error) {
      console.error('Error en reintento de webhooks:', error);
    }

    return processedCount;
  }

  /**
   * Obtiene el estado de un webhook
   * @param webhookId - ID del webhook
   * @returns WebhookStatus o null si no se encuentra
   */
  public async getWebhookStatus(webhookId: string): Promise<WebhookStatus | null> {
    try {
      const webhook = await prisma.webhookNotificacion.findUnique({
        where: { id: webhookId },
        include: {
          usuario: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (!webhook) {
        return null;
      }

      return {
        id: webhook.id,
        estado: webhook.estado,
        tipoNotificacion: webhook.tipoNotificacion,
        origen: webhook.origen,
        fechaRecepcion: webhook.fechaRecepcion,
        fechaProcesamiento: webhook.fechaProcesamiento,
        metodoVerificacion: webhook.metodoVerificacion,
        usuarioId: webhook.usuarioId,
        usuario: webhook.usuario,
        intentos: webhook.intentos,
        ultimoError: webhook.ultimoError,
      };
    } catch (error) {
      console.error('Error obteniendo estado del webhook:', error);
      return null;
    }
  }

  /**
   * Reintenta procesar un webhook específico
   * @param webhookId - ID del webhook a reintentar
   * @returns Resultado del reintento
   */
  public async retryWebhook(webhookId: string): Promise<WebhookProcessingResult> {
    const result: WebhookProcessingResult = {
      success: false,
      webhookId,
      message: '',
      errors: [],
    };

    try {
      const webhook = await prisma.webhookNotificacion.findUnique({
        where: { id: webhookId },
      });

      if (!webhook) {
        result.errors.push('Webhook no encontrado');
        return result;
      }

      if (webhook.estado === 'PROCESADO') {
        result.errors.push('Webhook ya fue procesado correctamente');
        return result;
      }

      // Incrementar contador de intentos
      await prisma.webhookNotificacion.update({
        where: { id: webhookId },
        data: { intentos: { increment: 1 } },
      });

      // Parsear payload y reintentarlo
      const parsedPayload = JSON.parse(webhook.payload);
      const success = await this.processNotificationByType(parsedPayload, webhookId);

      if (success) {
        await prisma.webhookNotificacion.update({
          where: { id: webhookId },
          data: {
            estado: 'PROCESADO',
            fechaProcesamiento: new Date(),
            ultimoError: null,
          },
        });
        result.success = true;
        result.message = 'Webhook reintentado correctamente';
      } else {
        await prisma.webhookNotificacion.update({
          where: { id: webhookId },
          data: { estado: 'ERROR' },
        });
        result.errors.push('Error procesando webhook en el reintento');
      }
    } catch (error) {
      console.error(`Error reintentando webhook ${webhookId}:`, error);
      result.errors.push(
        `Error interno: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      await prisma.webhookNotificacion.update({
        where: { id: webhookId },
        data: {
          estado: 'ERROR',
          ultimoError: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }

    return result;
  }

  /**
   * Lista webhooks con paginación y filtros
   * @param options - Opciones de paginación y filtros
   * @returns Lista de webhooks con total
   */
  public async listWebhooks(options: ListWebhooksOptions): Promise<ListWebhooksResult> {
    const { page = 1, limit = 10, estado, fechaDesde, fechaHasta } = options;
    const skip = (page - 1) * limit;

    try {
      const where: any = {};

      if (estado) {
        where.estado = estado;
      }

      if (fechaDesde || fechaHasta) {
        where.fechaRecepcion = {};
        if (fechaDesde) {
          where.fechaRecepcion.gte = fechaDesde;
        }
        if (fechaHasta) {
          where.fechaRecepcion.lte = fechaHasta;
        }
      }

      const [webhooks, total] = await Promise.all([
        prisma.webhookNotificacion.findMany({
          where,
          skip,
          take: limit,
          orderBy: { fechaRecepcion: 'desc' },
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        }),
        prisma.webhookNotificacion.count({ where }),
      ]);

      return {
        webhooks: webhooks.map((webhook: any) => ({
          id: webhook.id,
          estado: webhook.estado,
          tipoNotificacion: webhook.tipoNotificacion,
          origen: webhook.origen,
          fechaRecepcion: webhook.fechaRecepcion,
          fechaProcesamiento: webhook.fechaProcesamiento,
          metodoVerificacion: webhook.metodoVerificacion,
          usuarioId: webhook.usuarioId,
          usuario: webhook.usuario,
          intentos: webhook.intentos,
          ultimoError: webhook.ultimoError,
        })),
        total,
      };
    } catch (error) {
      console.error('Error listando webhooks:', error);
      return {
        webhooks: [],
        total: 0,
      };
    }
  }
}

// Tipos para el resultado de procesamiento
export interface WebhookProcessingResult {
  success: boolean;
  webhookId: string;
  message: string;
  errors: string[];
}

// Tipos para el estado del webhook
export interface WebhookStatus {
  id: string;
  estado: 'PENDIENTE' | 'PROCESADO' | 'ERROR';
  tipoNotificacion:
    | 'PRESENTACION_ACEPTADA'
    | 'PRESENTACION_RECHAZADA'
    | 'RECORDATORIO'
    | 'CONFIRMACION';
  origen: 'AEAT' | 'OTROS';
  fechaRecepcion: Date;
  fechaProcesamiento: Date | null;
  metodoVerificacion: string | null;
  usuarioId: string;
  usuario: {
    id: string;
    email: string;
  };
  intentos: number;
  ultimoError: string | null;
}

// Tipos para opciones de listado
export interface ListWebhooksOptions {
  page?: number;
  limit?: number;
  estado?: 'PENDIENTE' | 'PROCESADO' | 'ERROR';
  fechaDesde?: Date;
  fechaHasta?: Date;
}

// Tipos para resultado de listado
export interface ListWebhooksResult {
  webhooks: WebhookStatus[];
  total: number;
}

export default WebhookProcessorService;
