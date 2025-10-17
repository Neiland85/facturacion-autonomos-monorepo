import { Response } from "express";
import { prisma } from "@facturacion/database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { validateTaxId } from "@facturacion/core";

export class CompanyController {
  static async getMyCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const company = await prisma.company.findUnique({
        where: { userId },
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: "No se encontró empresa registrada para el usuario",
        });
        return;
      }

      res.json({
        success: true,
        message: "Empresa obtenida exitosamente",
        data: company,
      });
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async createCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const existing = await prisma.company.findUnique({ where: { userId } });
      if (existing) {
        res.status(409).json({
          success: false,
          message: "El usuario ya tiene una empresa registrada",
        });
        return;
      }

      const { name, cif, address, city, postalCode, province, phone, email, website, taxRegime } = req.body;

      if (!name || !cif || !address || !city || !postalCode || !province) {
        res.status(400).json({
          success: false,
          message: "Nombre, CIF y dirección completa son obligatorios",
        });
        return;
      }

      if (!validateTaxId(cif)) {
        res.status(400).json({
          success: false,
          message: "CIF inválido",
        });
        return;
      }

      const company = await prisma.company.create({
        data: {
          name,
          cif: cif.toUpperCase(),
          address,
          city,
          postalCode,
          province,
          phone,
          email,
          website,
          taxRegime,
          userId,
        },
      });

      res.status(201).json({
        success: true,
        message: "Empresa creada exitosamente",
        data: company,
      });
    } catch (error) {
      console.error("Create company error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async updateCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autorizado",
        });
        return;
      }

      const company = await prisma.company.findUnique({ where: { userId } });

      if (!company) {
        res.status(404).json({
          success: false,
          message: "No se encontró empresa para actualizar",
        });
        return;
      }

      const { name, cif, address, city, postalCode, province, phone, email, website, taxRegime } = req.body;

      if (cif && !validateTaxId(cif)) {
        res.status(400).json({
          success: false,
          message: "CIF inválido",
        });
        return;
      }

      const updated = await prisma.company.update({
        where: { id: company.id },
        data: {
          name: name ?? company.name,
          cif: cif ? cif.toUpperCase() : company.cif,
          address: address ?? company.address,
          city: city ?? company.city,
          postalCode: postalCode ?? company.postalCode,
          province: province ?? company.province,
          phone: phone ?? company.phone,
          email: email ?? company.email,
          website: website ?? company.website,
          taxRegime: taxRegime ?? company.taxRegime,
        },
      });

      res.json({
        success: true,
        message: "Empresa actualizada exitosamente",
        data: updated,
      });
    } catch (error) {
      console.error("Update company error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}
