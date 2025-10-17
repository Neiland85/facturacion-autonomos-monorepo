import { Request, Response } from "express";
import { withTransaction, isUniqueConstraintError } from "@facturacion/database";
import { prisma } from "@facturacion/database";

export class SubscriptionController {
  /**
   * Create a new subscription
   */
  static async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { planId, paymentMethodId } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      // Check if user already has an active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ["ACTIVE", "TRIALING"] },
        },
      });

      if (existingSubscription) {
        res.status(409).json({
          success: false,
          message: "Ya tienes una suscripción activa",
        });
        return;
      }

      // Use transaction for atomic subscription creation
      const result = await withTransaction(prisma, async (tx) => {
        try {
          // Create subscription in database first
          const subscription = await tx.subscription.create({
            data: {
              userId,
              planId,
              status: "PENDING",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          });

          // Here you would integrate with Stripe to create the subscription
          // For now, we'll simulate it
          const stripeSubscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Update with Stripe ID
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              stripeSubscriptionId,
            },
          });

          return {
            ...subscription,
            stripeSubscriptionId,
          };
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            throw new Error("SUBSCRIPTION_EXISTS");
          }
          throw error;
        }
      });

      res.status(201).json({
        success: true,
        message: "Suscripción creada exitosamente",
        data: result,
      });
    } catch (error) {
      console.error("Create subscription error:", error);

      if (error.message === "SUBSCRIPTION_EXISTS") {
        res.status(409).json({
          success: false,
          message: "Ya tienes una suscripción activa",
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
   * Cancel subscription
   */
  static async cancelSubscription(req: Request, res: Response): Promise<void> {
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

      // Find subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "Suscripción no encontrada",
        });
        return;
      }

      // If already cancelled, return success (idempotent)
      if (subscription.status === "CANCELLED") {
        res.json({
          success: true,
          message: "La suscripción ya está cancelada",
          data: subscription,
        });
        return;
      }

      // Cancel in Stripe (would be implemented here)
      // For now, just update status

      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: "Suscripción cancelada exitosamente",
        data: updatedSubscription,
      });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Reactivate subscription
   */
  static async reactivateSubscription(req: Request, res: Response): Promise<void> {
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

      // Find subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          id,
          userId,
          status: "CANCELLED", // Only allow reactivation of cancelled subscriptions
        },
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "Suscripción cancelada no encontrada",
        });
        return;
      }

      // Reactivate in Stripe (would be implemented here)
      // For now, just update status

      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          status: "ACTIVE",
          cancelledAt: null,
          reactivatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: "Suscripción reactivada exitosamente",
        data: updatedSubscription,
      });
    } catch (error) {
      console.error("Reactivate subscription error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}