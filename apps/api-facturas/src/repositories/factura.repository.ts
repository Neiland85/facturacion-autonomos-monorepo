import { PrismaClient, Factura, Prisma } from '@prisma/client';
import { FacturaFilter } from '../schemas/factura.schema';
import logger from '../config/logger';

export class FacturaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.FacturaCreateInput): Promise<Factura> {
    try {
      return await this.prisma.factura.create({
        data,
        include: {
          cliente: true,
          lineas: true,
        },
      });
    } catch (error) {
      logger.error('Error creating factura', { error, data });
      throw error;
    }
  }

  async findById(id: string): Promise<Factura | null> {
    try {
      return await this.prisma.factura.findUnique({
        where: { id },
        include: {
          cliente: true,
          lineas: true,
        },
      });
    } catch (error) {
      logger.error('Error finding factura by id', { error, id });
      throw error;
    }
  }

  async findByNumero(numeroFactura: string): Promise<Factura | null> {
    try {
      return await this.prisma.factura.findUnique({
        where: { numeroFactura },
        include: {
          cliente: true,
          lineas: true,
        },
      });
    } catch (error) {
      logger.error('Error finding factura by numero', { error, numeroFactura });
      throw error;
    }
  }

  async findMany(filter: FacturaFilter): Promise<{
    data: Factura[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const where: Prisma.FacturaWhereInput = {};
      
      if (filter.numeroFactura) {
        where.numeroFactura = { contains: filter.numeroFactura, mode: 'insensitive' };
      }
      
      if (filter.clienteId) {
        where.clienteId = filter.clienteId;
      }
      
      if (filter.estado) {
        where.estado = filter.estado;
      }
      
      if (filter.fechaDesde || filter.fechaHasta) {
        where.fecha = {};
        if (filter.fechaDesde) {
          where.fecha.gte = new Date(filter.fechaDesde);
        }
        if (filter.fechaHasta) {
          where.fecha.lte = new Date(filter.fechaHasta);
        }
      }
      
      if (filter.importeMinimo !== undefined || filter.importeMaximo !== undefined) {
        where.total = {};
        if (filter.importeMinimo !== undefined) {
          where.total.gte = filter.importeMinimo;
        }
        if (filter.importeMaximo !== undefined) {
          where.total.lte = filter.importeMaximo;
        }
      }

      const orderBy: Prisma.FacturaOrderByWithRelationInput = {};
      switch (filter.orderBy) {
        case 'numero':
          orderBy.numeroFactura = filter.orderDirection;
          break;
        case 'importe':
          orderBy.total = filter.orderDirection;
          break;
        case 'estado':
          orderBy.estado = filter.orderDirection;
          break;
        default:
          orderBy.fecha = filter.orderDirection;
      }

      const [data, total] = await Promise.all([
        this.prisma.factura.findMany({
          where,
          orderBy,
          skip: (filter.page - 1) * filter.limit,
          take: filter.limit,
          include: {
            cliente: true,
            lineas: true,
          },
        }),
        this.prisma.factura.count({ where }),
      ]);

      return {
        data,
        total,
        page: filter.page,
        totalPages: Math.ceil(total / filter.limit),
      };
    } catch (error) {
      logger.error('Error finding facturas', { error, filter });
      throw error;
    }
  }

  async update(id: string, data: Prisma.FacturaUpdateInput): Promise<Factura> {
    try {
      return await this.prisma.factura.update({
        where: { id },
        data,
        include: {
          cliente: true,
          lineas: true,
        },
      });
    } catch (error) {
      logger.error('Error updating factura', { error, id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<Factura> {
    try {
      return await this.prisma.factura.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('Error deleting factura', { error, id });
      throw error;
    }
  }

  async getNextNumeroFactura(prefix: string = ''): Promise<string> {
    // This implementation assumes you have a table called 'factura_sequence' with columns:
    // 'prefix' (string), 'year' (int), 'lastNumber' (int)
    // and a unique constraint on (prefix, year)
    try {
      const year = new Date().getFullYear();
      let nextNumber: number;

      await this.prisma.$transaction(async (tx) => {
        // Try to update the sequence row for this prefix/year
        const updated = await tx.factura_sequence.updateMany({
          where: { prefix, year },
          data: { lastNumber: { increment: 1 } },
        });
        if (updated.count === 0) {
          // If no row exists, create it
          await tx.factura_sequence.create({
            data: { prefix, year, lastNumber: 1 },
          });
          nextNumber = 1;
        } else {
          // Fetch the updated value
          const seq = await tx.factura_sequence.findUnique({
            where: { prefix_year: { prefix, year } },
          });
          nextNumber = seq?.lastNumber ?? 1;
        }
      });

      const numeroFactura = `${prefix}${year}/${nextNumber.toString().padStart(4, '0')}`;
      return numeroFactura;
    } catch (error) {
      logger.error('Error getting next numero factura', { error, prefix });
      throw error;
    }
  }

  async updateEstado(id: string, estado: string): Promise<Factura> {
    try {
      return await this.prisma.factura.update({
        where: { id },
        data: { estado },
        include: {
          cliente: true,
          lineas: true,
        },
      });
    } catch (error) {
      logger.error('Error updating factura estado', { error, id, estado });
      throw error;
    }
  }

  async getEstadisticas(clienteId?: string): Promise<{
    totalFacturas: number;
    totalImporte: number;
    facturasPorEstado: Record<string, number>;
    facturasUltimoMes: number;
    importeUltimoMes: number;
  }> {
    try {
      const where: Prisma.FacturaWhereInput = clienteId ? { clienteId } : {};
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

      const [
        totalFacturas,
        totalImporte,
        facturasPorEstado,
        facturasUltimoMes,
      ] = await Promise.all([
        this.prisma.factura.count({ where }),
        this.prisma.factura.aggregate({
          where,
          _sum: { total: true },
        }),
        this.prisma.factura.groupBy({
          by: ['estado'],
          where,
          _count: true,
        }),
        this.prisma.factura.aggregate({
          where: {
            ...where,
            fecha: { gte: lastMonthDate },
          },
          _count: true,
          _sum: { total: true },
        }),
      ]);

      return {
        totalFacturas,
        totalImporte: totalImporte._sum.total || 0,
        facturasPorEstado: facturasPorEstado.reduce((acc, curr) => {
          acc[curr.estado] = curr._count;
          return acc;
        }, {} as Record<string, number>),
        facturasUltimoMes: facturasUltimoMes._count,
        importeUltimoMes: facturasUltimoMes._sum.total || 0,
      };
    } catch (error) {
      logger.error('Error getting estadisticas', { error, clienteId });
      throw error;
    }
  }
}