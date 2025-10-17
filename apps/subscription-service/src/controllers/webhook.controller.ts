import { Request, Response } from "express";
import { withTransaction, isWebhookDuplicate } from "@facturacion/database";
import { prisma } from "@facturacion/database";

export class WebhookController {
  /**
   * Handle Stripe webhook
   */
  static async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const event = req.body;

      // Extract event ID for deduplication
      const eventId = event.id;
      if (!eventId) {
        res.status(400).json({
          success: false,
          message: "Invalid webhook: missing event ID",
        });
        return;
      }

      // Use transaction for atomic webhook processing
      await withTransaction(prisma, async (tx) => {
        // Check if webhook already processed
        const isDuplicate = await isWebhookDuplicate(tx, eventId);
        if (isDuplicate) {
          // Webhook already processed, return success
          return;
        }

        // Create webhook record
        await tx.webhookNotificacion.create({
          data: {
            webhookId: eventId,
            tipoNotificacion: event.type,
            origen: "STRIPE",
            payload: event,
            estado: "PROCESADO",
            fechaProcesamiento: new Date(),
            respuesta: { processed: true },
          },
        });

        // Process webhook based on event type
        switch (event.type) {
          case "payment_intent.succeeded":
            await WebhookController.processPaymentIntentSucceeded(tx, event);
            break;
          case "customer.subscription.deleted":
            await WebhookController.processSubscriptionDeleted(tx, event);
            break;
          case "invoice.payment_succeeded":
            await WebhookController.processInvoicePaymentSucceeded(tx, event);
            break;
          default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
        }
      });

      // Always return 200 OK for webhooks (even if already processed)
      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error) {
      console.error("Stripe webhook error:", error);

      // For webhooks, we should still return 200 to prevent retries
      // unless it's a validation error
      if (error.message?.includes("signature")) {
        res.status(400).json({
          success: false,
          message: "Invalid webhook signature",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Webhook processing failed, but acknowledged",
      });
    }
  }

  /**
   * Handle AEAT webhook
   */
  static async handleAEATWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      // Extract justificante number for deduplication
      const numeroJustificante = payload.numeroJustificante;
      if (!numeroJustificante) {
        res.status(400).json({
          success: false,
          message: "Invalid AEAT webhook: missing numeroJustificante",
        });
        return;
      }

      // Use transaction for atomic webhook processing
      await withTransaction(prisma, async (tx) => {
        // Check if webhook already processed
        const isDuplicate = await isWebhookDuplicate(tx, numeroJustificante);
        if (isDuplicate) {
          // Webhook already processed, return success
          return;
        }

        // Create webhook record
        await tx.webhookNotificacion.create({
          data: {
            webhookId: numeroJustificante,
            tipoNotificacion: payload.estado || "NOTIFICACION_AEAT",
            origen: "AEAT",
            payload,
            estado: "PROCESADO",
            fechaProcesamiento: new Date(),
            respuesta: { processed: true },
          },
        });

        // Process AEAT notification
        await WebhookController.processAEATNotification(tx, payload);
      });

      res.status(200).json({
        success: true,
        message: "AEAT webhook processed successfully",
      });
    } catch (error) {
      console.error("AEAT webhook error:", error);

      res.status(200).json({
        success: true,
        message: "AEAT webhook processing failed, but acknowledged",
      });
    }
  }

  /**
   * Process Stripe payment_intent.succeeded
   */
  private static async processPaymentIntentSucceeded(tx: any, event: any): Promise<void> {
    const paymentIntent = event.data.object;

    // Find subscription by payment intent ID
    const subscription = await tx.subscription.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (subscription) {
      // Update subscription status to active
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          activatedAt: new Date(),
        },
      });

      console.log(`Subscription ${subscription.id} activated via payment`);
    }
  }

  /**
   * Process Stripe customer.subscription.deleted
   */
  private static async processSubscriptionDeleted(tx: any, event: any): Promise<void> {
    const subscription = event.data.object;

    // Find and update subscription
    const localSubscription = await tx.subscription.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    });

    if (localSubscription) {
      await tx.subscription.update({
        where: { id: localSubscription.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      console.log(`Subscription ${localSubscription.id} cancelled via Stripe`);
    }
  }

  /**
   * Process Stripe invoice.payment_succeeded
   */
  private static async processInvoicePaymentSucceeded(tx: any, event: any): Promise<void> {
    const invoice = event.data.object;

    // Update subscription payment status if needed
    // This could trigger billing cycle updates, etc.

    console.log(`Invoice payment succeeded: ${invoice.id}`);
  }

  /**
   * Process AEAT notification
   */
  private static async processAEATNotification(tx: any, payload: any): Promise<void> {
    const numeroJustificante = payload.numeroJustificante;

    // Find related presentacion
    const presentacion = await tx.presentacionModelo.findFirst({
      where: {
        numeroJustificante,
      },
    });

    if (presentacion) {
      // Update presentacion status based on AEAT response
      let newStatus = "PENDIENTE";
      if (payload.estado === "ACEPTADA") {
        newStatus = "ACEPTADO";
      } else if (payload.estado === "RECHAZADA") {
        newStatus = "RECHAZADO";
      }

      await tx.presentacionModelo.update({
        where: { id: presentacion.id },
        data: {
          estado: newStatus,
          fechaAceptacion: payload.fechaAceptacion ? new Date(payload.fechaAceptacion) : null,
          datosPresentacion: payload,
        },
      });

      console.log(`Presentacion ${presentacion.id} updated via AEAT webhook`);
    }
  }
}