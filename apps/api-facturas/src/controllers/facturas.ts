import { CalculadorFiscal } from '@facturacion/core';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class FacturaController {
  async getFacturas(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const tipo = req.query.tipo as string;
      const estado = req.query.estado as string;
      const fechaDesde = req.query.fechaDesde as string;
      const fechaHasta = req.query.fechaHasta as string;
      const clienteId = req.query.clienteId as string;

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (tipo) where.tipo = tipo;
      if (estado) where.estado = estado;
      if (clienteId) where.clienteId = clienteId;
      
      if (fechaDesde || fechaHasta) {
        where.fecha = {};
        if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
        if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
      }

      // Obtener facturas con paginación
      const [facturas, total] = await Promise.all([
        prisma.factura.findMany({
          where,
          skip,
          take: limit,
          include: {
            cliente: true,
            lineas: true
          },
          orderBy: { fecha: 'desc' }
        }),
        prisma.factura.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        data: facturas,
        meta: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        links: {
          first: `/api/v1/facturas?page=1&limit=${limit}`,
          previous: page > 1 ? `/api/v1/facturas?page=${page - 1}&limit=${limit}` : null,
          next: page < totalPages ? `/api/v1/facturas?page=${page + 1}&limit=${limit}` : null,
          last: `/api/v1/facturas?page=${totalPages}&limit=${limit}`
        }
      });
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener las facturas',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async getFacturaById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const factura = await prisma.factura.findUnique({
        where: { id },
        include: {
          cliente: true,
          lineas: true
        }
      });

      if (!factura) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Factura no encontrada',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      res.json({ data: factura });
    } catch (error) {
      console.error('Error al obtener factura:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener la factura',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async createFactura(req: Request, res: Response) {
    try {
      const {
        fecha,
        fechaVencimiento,
        clienteId,
        tipo,
        concepto,
        baseImponible,
        tipoIVA,
        tipoIRPF,
        observaciones,
        lineas
      } = req.body;

      // Verificar que el cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId }
      });

      if (!cliente) {
        return res.status(404).json({
          error: 'CLIENT_NOT_FOUND',
          message: 'Cliente no encontrado',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Calcular impuestos
      const calculador = new CalculadorFiscal();
      const calculoFiscal = calculador.calcularImpuestos({
        baseImponible,
        tipoIVA: tipoIVA || 21,
        tipoIRPF: tipoIRPF || 0
      });

      // Generar número de factura
      const ultimaFactura = await prisma.factura.findFirst({
        where: { tipo },
        orderBy: { numero: 'desc' }
      });

      const numeroFactura = generarNumeroFactura(tipo, ultimaFactura?.numero);

      // Crear factura
      const factura = await prisma.factura.create({
        data: {
          id: uuidv4(),
          numero: numeroFactura,
          fecha: new Date(fecha),
          fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
          clienteId,
          tipo,
          concepto,
          baseImponible: calculoFiscal.baseImponible,
          tipoIVA: calculoFiscal.tipoIVA,
          importeIVA: calculoFiscal.importeIVA,
          tipoIRPF: calculoFiscal.tipoIRPF,
          importeIRPF: calculoFiscal.importeIRPF,
          total: calculoFiscal.total,
          observaciones,
          estado: 'borrador',
          lineas: {
            create: lineas?.map((linea: any) => ({
              id: uuidv4(),
              descripcion: linea.descripcion,
              cantidad: linea.cantidad,
              precioUnitario: linea.precioUnitario,
              descuento: linea.descuento || 0,
              total: linea.cantidad * linea.precioUnitario * (1 - (linea.descuento || 0) / 100)
            })) || []
          }
        },
        include: {
          cliente: true,
          lineas: true
        }
      });

      res.status(201).json({
        data: factura,
        message: 'Factura creada correctamente'
      });
    } catch (error) {
      console.error('Error al crear factura:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al crear la factura',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async updateFactura(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar que la factura existe
      const facturaExistente = await prisma.factura.findUnique({
        where: { id }
      });

      if (!facturaExistente) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Factura no encontrada',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar que se puede modificar
      if (facturaExistente.estado === 'enviada' || facturaExistente.estado === 'pagada') {
        return res.status(409).json({
          error: 'CONFLICT',
          message: 'No se puede modificar una factura enviada o pagada',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Recalcular impuestos si es necesario
      let calculoFiscal = null;
      if (updateData.baseImponible || updateData.tipoIVA || updateData.tipoIRPF) {
        const calculador = new CalculadorFiscal();
        calculoFiscal = calculador.calcularImpuestos({
          baseImponible: updateData.baseImponible || facturaExistente.baseImponible,
          tipoIVA: updateData.tipoIVA || facturaExistente.tipoIVA,
          tipoIRPF: updateData.tipoIRPF || facturaExistente.tipoIRPF
        });
      }

      // Actualizar factura
      const factura = await prisma.factura.update({
        where: { id },
        data: {
          ...updateData,
          ...(calculoFiscal && {
            baseImponible: calculoFiscal.baseImponible,
            tipoIVA: calculoFiscal.tipoIVA,
            importeIVA: calculoFiscal.importeIVA,
            tipoIRPF: calculoFiscal.tipoIRPF,
            importeIRPF: calculoFiscal.importeIRPF,
            total: calculoFiscal.total
          }),
          updatedAt: new Date()
        },
        include: {
          cliente: true,
          lineas: true
        }
      });

      res.json({
        data: factura,
        message: 'Factura actualizada correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar factura:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar la factura',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async deleteFactura(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar que la factura existe
      const factura = await prisma.factura.findUnique({
        where: { id }
      });

      if (!factura) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Factura no encontrada',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar que se puede eliminar
      if (factura.estado !== 'borrador') {
        return res.status(409).json({
          error: 'CONFLICT',
          message: 'Solo se pueden eliminar facturas en estado borrador',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Eliminar factura
      await prisma.factura.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al eliminar la factura',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async generatePDF(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Obtener factura
      const factura = await prisma.factura.findUnique({
        where: { id },
        include: {
          cliente: true,
          lineas: true
        }
      });

      if (!factura) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Factura no encontrada',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Implementar generación de PDF básica (placeholder)
      // En una implementación real, usar librerías como PDFKit o jsPDF
      console.log(`Generando PDF para factura ${factura.numero}`);
      
      // Por ahora, devolver un placeholder
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="factura-${factura.numero}.pdf"`);
      res.send(Buffer.from('PDF placeholder'));
    } catch (error) {
      console.error('Error al generar PDF:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al generar el PDF',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async enviarFactura(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { enviarCliente = true, enviarAEAT = false, emailPersonalizado } = req.body;

      // Obtener factura
      const factura = await prisma.factura.findUnique({
        where: { id },
        include: {
          cliente: true,
          lineas: true
        }
      });

      if (!factura) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Factura no encontrada',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const respuesta: any = {
        message: 'Factura enviada correctamente'
      };

      // Enviar al cliente
      if (enviarCliente) {
        // Implementar envío por email básico (placeholder)
        // En una implementación real, usar servicios como SendGrid, Nodemailer, etc.
        console.log(`Enviando factura ${factura.id} por email a ${emailPersonalizado || factura.cliente.email}`);
        
        respuesta.envioCliente = {
          estado: 'enviado',
          email: emailPersonalizado || factura.cliente.email,
          fechaEnvio: new Date().toISOString()
        };
      }

      // Enviar a AEAT
      if (enviarAEAT) {
        // Implementar envío a AEAT/SII básico (placeholder)
        // En una implementación real, usar la API del SII de la AEAT
        console.log(`Enviando factura ${factura.id} a AEAT/SII`);
        
        respuesta.envioAEAT = {
          estado: 'enviado',
          csv: 'CSV-' + Date.now(),
          fechaEnvio: new Date().toISOString()
        };
      }

      // Actualizar estado de la factura
      await prisma.factura.update({
        where: { id },
        data: {
          estado: 'enviada',
          updatedAt: new Date()
        }
      });

      res.json(respuesta);
    } catch (error) {
      console.error('Error al enviar factura:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al enviar la factura',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
}

// Función auxiliar para generar números de factura
function generarNumeroFactura(tipo: string, ultimoNumero?: string | null): string {
  const año = new Date().getFullYear();
  const prefijo = tipo === 'emitida' ? 'F' : 'R';
  
  let numeroSecuencial = 1;
  
  if (ultimoNumero) {
    const match = /-(\d+)$/.exec(ultimoNumero);
    if (match?.[1]) {
      numeroSecuencial = parseInt(match[1], 10) + 1;
    }
  }
  
  return `${prefijo}-${año}-${numeroSecuencial.toString().padStart(4, '0')}`;
}
