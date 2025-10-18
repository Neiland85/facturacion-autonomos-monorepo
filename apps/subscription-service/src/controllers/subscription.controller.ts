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
      const userId = req.user?.id;

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
      const userId = req.user?.id;

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
      const userId = req.user?.id;

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

  /**
   * Get subscription by ID
   */
  static async getSubscriptionById(req: Request, res: Response): Promise<void> {
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

      const subscription = await prisma.subscription.findFirst({
        where: { id, userId },
        include: { plan: true },
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "Suscripción no encontrada",
        });
        return;
      }

      // Transform status to lowercase for frontend compatibility
      const transformed = {
        ...subscription,
        status: subscription.status.toLowerCase(),
      };

      res.json({
        success: true,
        message: "Suscripción obtenida exitosamente",
        data: transformed,
      });
    } catch (error) {
      console.error("Get subscription error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Get subscription plans
   */
  static async getSubscriptionPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      });

      // If no plans exist, return hardcoded plans
      if (plans.length === 0) {
        const defaultPlans = [
          {
            id: "plan_starter",
            name: "Starter",
            description: "Perfecto para freelancers que empiezan",
            price: 9.99,
            currency: "EUR",
            interval: "MONTH",
            features: [
              "Hasta 50 facturas al mes",
              "Hasta 20 clientes",
              "Soporte por email",
              "Escaneo OCR básico",
            ],
            maxInvoices: 50,
            maxClients: 20,
            isPopular: false,
          },
          {
            id: "plan_professional",
            name: "Professional",
            description: "Para profesionales con más demanda",
            price: 19.99,
            currency: "EUR",
            interval: "MONTH",
            features: [
              "Hasta 200 facturas al mes",
              "Hasta 100 clientes",
              "Soporte prioritario",
              "Escaneo OCR ilimitado",
              "Integración bancaria",
            ],
            maxInvoices: 200,
            maxClients: 100,
            isPopular: true,
          },
          {
            id: "plan_enterprise",
            name: "Enterprise",
            description: "Soluciones a medida para grandes empresas",
            price: 49.99,
            currency: "EUR",
            interval: "MONTH",
            features: [
              "Facturas ilimitadas",
              "Clientes ilimitados",
              "Soporte 24/7",
              "API de acceso",
              "Gestor de cuenta dedicado",
              "Informes personalizados",
            ],
            maxInvoices: 999999,
            maxClients: 999999,
            isPopular: false,
          },
        ];

        res.json({
          success: true,
          message: "Planes de suscripción obtenidos",
          data: defaultPlans,
        });
        return;
      }

      res.json({
        success: true,
        message: "Planes de suscripción obtenidos",
        data: plans,
      });
    } catch (error) {
      console.error("Get plans error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Get user subscriptions
   */
  static async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      });

      // Transform status values to lowercase
      const transformed = subscriptions.map((sub) => ({
        ...sub,
        status: sub.status.toLowerCase(),
      }));

      res.json({
        success: true,
        message: "Suscripciones obtenidas exitosamente",
        data: transformed,
      });
    } catch (error) {
      console.error("Get user subscriptions error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Get payment methods for a subscription
   */
  static async getPaymentMethods(req: Request, res: Response): Promise<void> {
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

      // Verify subscription ownership
      const subscription = await prisma.subscription.findFirst({
        where: { id, userId },
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "Suscripción no encontrada",
        });
        return;
      }

      // Return mock payment methods
      const mockPaymentMethods = [
        {
          id: "pm_mock_card",
          type: "card",
          card: {
            brand: "visa",
            last4: "4242",
            exp_month: 12,
            exp_year: 2025,
          },
          isDefault: true,
        },
      ];

      res.json({
        success: true,
        message: "Métodos de pago obtenidos",
        data: mockPaymentMethods,
      });
    } catch (error) {
      console.error("Get payment methods error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}