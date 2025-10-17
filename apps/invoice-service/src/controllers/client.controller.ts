import { Response } from "express";
import { prisma } from "@facturacion/database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { validateTaxId } from "@facturacion/core";

const parsePositiveNumber = (value: unknown, fallback: number, max?: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return max ? Math.min(parsed, max) : parsed;
};

const formatPaginationResponse = <T>(items: T[], page: number, limit: number, total: number) => ({
  items,
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});

export class ClientController {
  static async getClients(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const page = parsePositiveNumber(req.query.page, 1);
      const limit = parsePositiveNumber(req.query.limit, 20, 100);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

      const where = search
        ? {
            userId,
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { nifCif: { contains: search.toUpperCase(), mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : { userId };

      const [total, clients] = await Promise.all([
        prisma.client.count({ where }),
        prisma.client.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      res.json({
        success: true,
        message: "Clientes obtenidos exitosamente",
        data: formatPaginationResponse(clients, page, limit, total),
      });
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async getClientById(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const client = await prisma.client.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          invoices: true,
        },
      });

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
        return;
      }

      res.json({
        success: true,
        message: "Cliente obtenido exitosamente",
        data: client,
      });
    } catch (error) {
      console.error("Get client by id error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async createClient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const { name, nifCif, address, city, postalCode, province, phone, email } = req.body;

      if (!name || !nifCif) {
        res.status(400).json({
          success: false,
          message: "El nombre y el NIF/CIF son obligatorios",
        });
        return;
      }

      if (!validateTaxId(nifCif)) {
        res.status(400).json({
          success: false,
          message: "NIF/CIF inválido",
        });
        return;
      }

      const existing = await prisma.client.findFirst({
        where: {
          userId,
          nifCif: nifCif.toUpperCase(),
        },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: "Ya existe un cliente con este NIF/CIF",
        });
        return;
      }

      const client = await prisma.client.create({
        data: {
          name,
          nifCif: nifCif.toUpperCase(),
          address,
          city,
          postalCode,
          province,
          phone,
          email,
          userId,
        },
      });

      res.status(201).json({
        success: true,
        message: "Cliente creado exitosamente",
        data: client,
      });
    } catch (error) {
      console.error("Create client error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async updateClient(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const client = await prisma.client.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
        return;
      }

      const { name, nifCif, address, city, postalCode, province, phone, email } = req.body;

      if (nifCif && !validateTaxId(nifCif)) {
        res.status(400).json({
          success: false,
          message: "NIF/CIF inválido",
        });
        return;
      }

      const updated = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: name ?? client.name,
          nifCif: nifCif ? nifCif.toUpperCase() : client.nifCif,
          address: address ?? client.address,
          city: city ?? client.city,
          postalCode: postalCode ?? client.postalCode,
          province: province ?? client.province,
          phone: phone ?? client.phone,
          email: email ?? client.email,
        },
      });

      res.json({
        success: true,
        message: "Cliente actualizado exitosamente",
        data: updated,
      });
    } catch (error) {
      console.error("Update client error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async deleteClient(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const client = await prisma.client.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
        return;
      }

      await prisma.client.delete({
        where: { id: client.id },
      });

      res.json({
        success: true,
        message: "Cliente eliminado exitosamente",
      });
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}
