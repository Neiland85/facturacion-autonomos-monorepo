import { WebhookSignatureService, } from './webhook-signature.service';
// const prisma = new PrismaClient();
/**
 * Servicio para procesar webhooks de AEAT y actualizar estados de presentaciones
 * TEMPORAL: Implementación básica sin tablas webhookNotificacion y presentacionModelo
 */
export class WebhookProcessorService {
    signatureService;
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
    async processWebhook(payload, headers, ipOrigen) {
        try {
            // TODO: Implementar procesamiento real cuando se agreguen las tablas al schema
            console.log('Webhook recibido (procesamiento temporal deshabilitado):', {
                payload,
                headers,
                ipOrigen,
            });
            return {
                success: true,
                message: 'Webhook recibido pero no procesado (tablas faltantes)',
                processed: false,
            };
        }
        catch (error) {
            console.error('Error procesando webhook:', error);
            return {
                success: false,
                error: 'Error procesando webhook',
                processed: false,
            };
        }
    }
    /**
     * Obtiene el estado de procesamiento de un webhook
     */
    async getWebhookStatus(webhookId) {
        // TODO: Implementar cuando se agregue tabla webhookNotificacion
        return {
            id: webhookId,
            status: 'not_implemented',
            message: 'Tabla webhookNotificacion no implementada',
        };
    }
    /**
     * Reprocesa webhooks fallidos
     */
    async reprocesarWebhooksFallidos() {
        // TODO: Implementar cuando se agreguen las tablas
        return {
            success: true,
            message: 'Reprocesamiento no implementado (tablas faltantes)',
            reprocessed: 0,
        };
    }
    /**
     * Obtiene estadísticas de webhooks
     */
    async getWebhookStats() {
        // TODO: Implementar cuando se agreguen las tablas
        return {
            total: 0,
            processed: 0,
            failed: 0,
            pending: 0,
            message: 'Estadísticas no disponibles (tablas faltantes)',
        };
    }
    /**
     * Lista webhooks con paginación
     */
    async listWebhooks(limit = 50, offset = 0) {
        // TODO: Implementar cuando se agregue tabla webhookNotificacion
        return {
            webhooks: [],
            total: 0,
            limit,
            offset,
            message: 'Lista no disponible (tablas faltantes)',
        };
    }
}
