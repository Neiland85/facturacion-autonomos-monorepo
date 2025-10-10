import { prisma } from "@facturacion/database";
import type { Client, InvoiceLine } from "@facturacion/database";
import { Request, Response } from "express";

// Tipo para el select de facturas en reportes
type FacturaReporte = {
  number: string;
  issueDate: Date;
  subtotal: number;
  vatAmount: number;
  total: number;
  status: string;
};

// Tipo para facturas completas con includes
type FacturaCompleta = {
  number: string;
  issueDate: Date;
  subtotal: number;
  vatAmount: number;
  total: number;
  status: string;
  client?: Client;
  lines?: InvoiceLine[];
};

// Tipo para respuesta al frontend (con números en lugar de Decimal)
type FacturaRespuesta = {
  number: string;
  issueDate: Date;
  subtotal: number;
  vatAmount: number;
  total: number;
  status: string;
  client?: Client;
  lines?: InvoiceLine[];
};

export class ReportesController {
  async getTrimestral(req: Request, res: Response) {
    try {
      const trimestre = parseInt(req.query.trimestre as string);
      const año = parseInt(req.query.año as string);

      if (!trimestre || !año || trimestre < 1 || trimestre > 4) {
        return res.status(400).json({
          error: "BAD_REQUEST",
          message: "Trimestre y año son requeridos",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Calcular fechas del trimestre
      const mesesTrimestre = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ];

      const meses = mesesTrimestre[trimestre - 1];
      if (!meses || meses.length !== 3) {
        return res.status(400).json({
          error: "BAD_REQUEST",
          message: "Trimestre inválido",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Type assertion: después de la validación, sabemos que meses tiene exactamente 3 elementos
      const [mesInicio, , mesFin] = meses as [number, number, number];
      const fechaInicio = new Date(año, mesInicio - 1, 1);
      const fechaFin = new Date(año, mesFin, 0);

      // Obtener facturas del trimestre
      const facturas: FacturaReporte[] = await prisma.$queryRaw`
        SELECT number, "issueDate", CAST(subtotal AS FLOAT) as subtotal,
               CAST("vatAmount" AS FLOAT) as "vatAmount", CAST(total AS FLOAT) as total, status
        FROM "Invoice"
        WHERE "issueDate" >= ${fechaInicio} AND "issueDate" <= ${fechaFin}
      `;

      // Procesar datos
      // Por ahora asumimos que todas las facturas son emitidas
      const facturasEmitidas = facturas;
      const facturasRecibidas: FacturaReporte[] = [];

      const resumen = {
        facturasEmitidas: {
          cantidad: facturasEmitidas.length,
          baseImponible: facturasEmitidas.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.subtotal),
            0
          ),
          iva: facturasEmitidas.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.vatAmount),
            0
          ),
          irpf: 0, // No hay IRPF en el esquema actual
          total: facturasEmitidas.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.total),
            0
          ),
        },
        facturasRecibidas: {
          cantidad: facturasRecibidas.length,
          baseImponible: facturasRecibidas.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.subtotal),
            0
          ),
          iva: facturasRecibidas.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.vatAmount),
            0
          ),
          irpf: 0, // No hay IRPF en el esquema actual
          total: facturasRecibidas.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.total),
            0
          ),
        },
      };

      // Detalles por mes
      const detalles = meses.map((mes: number) => {
        const facturasMes = facturas.filter(
          (f: FacturaReporte) => f.issueDate.getMonth() + 1 === mes
        );
        const emitidas = facturasMes; // Por ahora todas son emitidas
        const recibidas: FacturaReporte[] = [];

        return {
          mes,
          facturasEmitidas: emitidas.length,
          facturasRecibidas: recibidas.length,
          baseImponible: facturasMes.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.subtotal),
            0
          ),
          iva: facturasMes.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.vatAmount),
            0
          ),
          irpf: 0, // No hay IRPF en el esquema actual
        };
      });

      res.json({
        trimestre,
        año,
        resumen,
        detalles,
      });
    } catch (error) {
      console.error("Error al generar reporte trimestral:", error);
      res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Error al generar el reporte trimestral",
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }

  async getAnual(req: Request, res: Response) {
    try {
      const año = parseInt(req.query.año as string);

      if (!año) {
        return res.status(400).json({
          error: "BAD_REQUEST",
          message: "Año es requerido",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      const fechaInicio = new Date(año, 0, 1);
      const fechaFin = new Date(año, 11, 31);

      // Obtener facturas del año
      const facturas: FacturaReporte[] = await prisma.$queryRaw`
        SELECT number, "issueDate", CAST(subtotal AS FLOAT) as subtotal,
               CAST("vatAmount" AS FLOAT) as "vatAmount", CAST(total AS FLOAT) as total, status
        FROM "Invoice"
        WHERE "issueDate" >= ${fechaInicio} AND "issueDate" <= ${fechaFin}
      `;

      // Procesar datos por trimestre
      const trimestres = [1, 2, 3, 4].map((trimestre: number) => {
        const mesesTrimestre = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [10, 11, 12],
        ];

        const meses = mesesTrimestre[trimestre - 1];
        if (!meses || meses.length !== 3) {
          throw new Error(`Trimestre inválido: ${trimestre}`);
        }

        const facturasTrimestre = facturas.filter((f: FacturaReporte) =>
          meses.includes(f.issueDate.getMonth() + 1)
        );

        const emitidas = facturasTrimestre; // Por ahora todas son emitidas
        const recibidas: FacturaReporte[] = [];

        return {
          trimestre,
          facturasEmitidas: emitidas.length,
          facturasRecibidas: recibidas.length,
          baseImponible: facturasTrimestre.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.subtotal),
            0
          ),
          iva: facturasTrimestre.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.vatAmount),
            0
          ),
          irpf: 0, // No hay IRPF en el esquema actual
          total: facturasTrimestre.reduce(
            (sum: number, f: FacturaReporte) => sum + Number(f.total),
            0
          ),
        };
      });

      const resumen = {
        totalFacturas: facturas.length,
        totalEmitidas: facturas.length, // Por ahora todas son emitidas
        totalRecibidas: 0,
        baseImponible: facturas.reduce(
          (sum: number, f: FacturaReporte) => sum + Number(f.subtotal),
          0
        ),
        iva: facturas.reduce(
          (sum: number, f: FacturaReporte) => sum + Number(f.vatAmount),
          0
        ),
        irpf: 0, // No hay IRPF en el esquema actual
        total: facturas.reduce(
          (sum: number, f: FacturaReporte) => sum + Number(f.total),
          0
        ),
      };

      res.json({
        año,
        resumen,
        trimestres,
      });
    } catch (error) {
      console.error("Error al generar reporte anual:", error);
      res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Error al generar el reporte anual",
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }

  async getVentas(req: Request, res: Response) {
    try {
      const fechaDesde = req.query.fechaDesde as string;
      const fechaHasta = req.query.fechaHasta as string;

      if (!fechaDesde || !fechaHasta) {
        return res.status(400).json({
          error: "BAD_REQUEST",
          message: "Fecha desde y fecha hasta son requeridas",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      const facturas = await prisma.invoice.findMany({
        where: {
          issueDate: {
            gte: new Date(fechaDesde),
            lte: new Date(fechaHasta),
          },
        },
        include: {
          client: true,
          lines: true,
        },
        orderBy: { issueDate: "desc" },
      });

      // Convertir Decimal a number para la respuesta
      const facturasRespuesta: FacturaRespuesta[] = facturas.map(
        (factura: any) => ({
          ...factura,
          subtotal: Number(factura.subtotal),
          vatAmount: Number(factura.vatAmount),
          total: Number(factura.total),
        })
      );

      const resumen = {
        totalFacturas: facturas.length,
        baseImponible: facturas.reduce(
          (sum: number, f: FacturaCompleta) => sum + Number(f.subtotal),
          0
        ),
        iva: facturas.reduce(
          (sum: number, f: FacturaCompleta) => sum + Number(f.vatAmount),
          0
        ),
        irpf: 0, // No hay IRPF en el esquema actual
        total: facturas.reduce(
          (sum: number, f: FacturaCompleta) => sum + Number(f.total),
          0
        ),
      };

      res.json({
        periodo: { desde: fechaDesde, hasta: fechaHasta },
        resumen,
        facturas: facturasRespuesta,
      });
    } catch (error) {
      console.error("Error al generar reporte de ventas:", error);
      res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Error al generar el reporte de ventas",
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }

  async getGastos(req: Request, res: Response) {
    try {
      const fechaDesde = req.query.fechaDesde as string;
      const fechaHasta = req.query.fechaHasta as string;

      if (!fechaDesde || !fechaHasta) {
        return res.status(400).json({
          error: "BAD_REQUEST",
          message: "Fecha desde y fecha hasta son requeridas",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      const facturas: FacturaCompleta[] = await prisma.invoice.findMany({
        where: {
          issueDate: {
            gte: new Date(fechaDesde),
            lte: new Date(fechaHasta),
          },
        },
        include: {
          client: true,
          lines: true,
        },
        orderBy: { issueDate: "desc" },
      });

      // Convertir Decimal a number para la respuesta
      const facturasRespuesta: FacturaRespuesta[] = facturas.map((factura) => ({
        ...factura,
        subtotal: Number(factura.subtotal),
        vatAmount: Number(factura.vatAmount),
        total: Number(factura.total),
      }));

      const resumen = {
        totalFacturas: facturas.length,
        baseImponible: facturas.reduce(
          (sum: number, f: FacturaCompleta) => sum + Number(f.subtotal),
          0
        ),
        iva: facturas.reduce(
          (sum: number, f: FacturaCompleta) => sum + Number(f.vatAmount),
          0
        ),
        irpf: 0, // No hay IRPF en el esquema actual
        total: facturas.reduce(
          (sum: number, f: FacturaCompleta) => sum + Number(f.total),
          0
        ),
      };

      res.json({
        periodo: { desde: fechaDesde, hasta: fechaHasta },
        resumen,
        facturas: facturasRespuesta,
      });
    } catch (error) {
      console.error("Error al generar reporte de gastos:", error);
      res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Error al generar el reporte de gastos",
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }

  async exportar(req: Request, res: Response) {
    try {
      const { formato } = req.params;
      const { tipo } = req.body;

      if (!formato || !["pdf", "excel", "csv"].includes(formato)) {
        return res.status(400).json({
          error: "BAD_REQUEST",
          message: "Formato no válido. Formatos soportados: pdf, excel, csv",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Implementar exportación según el formato
      res.json({
        tipo,
        formato: req.body.formato ?? "json",
        mensaje: "Funcionalidad de exportación en desarrollo",
      });
      // Por ahora, devolver placeholder
      const nombreArchivo = `reporte-${tipo}-${Date.now()}.${formato}`;

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nombreArchivo}"`
      );

      switch (formato) {
        case "pdf":
          res.setHeader("Content-Type", "application/pdf");
          res.send(Buffer.from("PDF placeholder"));
          break;
        case "excel":
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.send(Buffer.from("Excel placeholder"));
          break;
        case "csv":
          res.setHeader("Content-Type", "text/csv");
          res.send("CSV placeholder");
          break;
      }
    } catch (error) {
      console.error("Error al exportar reporte:", error);
      res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Error al exportar el reporte",
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
}
