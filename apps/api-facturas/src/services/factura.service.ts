import { PrismaClient } from '@prisma/client';
import { FacturaRepository } from '../repositories/factura.repository';
import { 
  CreateFacturaInput, 
  UpdateFacturaInput, 
  FacturaFilter,
  FacturaResponse 
} from '../schemas/factura.schema';
import logger from '../config/logger';
import { 
  invoicesCreated, 
  invoiceProcessingDuration, 
  invoiceErrors 
} from '../config/metrics';

export class FacturaService {
  private facturaRepository: FacturaRepository;

  constructor(private prisma: PrismaClient) {
    this.facturaRepository = new FacturaRepository(prisma);
  }

  async createFactura(data: CreateFacturaInput): Promise<FacturaResponse> {
    const timer = invoiceProcessingDuration.startTimer({ operation: 'create' });
    
    try {
      logger.info('Creating new factura', { clienteId: data.clienteId });
      
      // Calcular totales
      const { subtotal, totalIVA, totalRetencion, total } = this.calcularTotales(
        data.lineas,
        data.tipoRetencion
      );

      // Generar número de factura si no se proporciona
      const numeroFactura = data.numeroFactura || 
        await this.facturaRepository.getNextNumeroFactura();

      // Crear factura con transacción
      const factura = await this.prisma.$transaction(async (tx) => {
        // Crear cliente si se proporcionan datos
        let clienteId = data.clienteId;
        if (data.datosCliente && !clienteId) {
          const cliente = await tx.cliente.create({
            data: {
              nombre: data.datosCliente.nombre,
              nif: data.datosCliente.nif,
              direccion: data.datosCliente.direccion,
              codigoPostal: data.datosCliente.codigoPostal,
              ciudad: data.datosCliente.ciudad,
              provincia: data.datosCliente.provincia,
              pais: data.datosCliente.pais,
              email: data.datosCliente.email,
              telefono: data.datosCliente.telefono,
            },
          });
          clienteId = cliente.id;
        }

        // Crear factura
        const nuevaFactura = await tx.factura.create({
          data: {
            numeroFactura,
            fecha: new Date(data.fecha),
            clienteId,
            subtotal,
            totalIVA,
            tipoRetencion: data.tipoRetencion || 0,
            totalRetencion,
            total,
            estado: data.estado,
            observaciones: data.observaciones,
            formaPago: data.formaPago,
            vencimiento: data.vencimiento ? new Date(data.vencimiento) : null,
            moneda: data.moneda,
            idioma: data.idioma,
            lineas: {
              create: data.lineas.map((linea) => {
                const subtotalLinea = linea.cantidad * linea.precioUnitario;
                const descuentoImporte = subtotalLinea * (linea.descuento || 0) / 100;
                const baseImponible = subtotalLinea - descuentoImporte;
                const ivaImporte = baseImponible * linea.tipoIVA / 100;
                
                return {
                  descripcion: linea.descripcion,
                  cantidad: linea.cantidad,
                  precioUnitario: linea.precioUnitario,
                  tipoIVA: linea.tipoIVA,
                  descuento: linea.descuento || 0,
                  subtotal: subtotalLinea,
                  totalIVA: ivaImporte,
                  total: baseImponible + ivaImporte,
                };
              }),
            },
          },
          include: {
            cliente: true,
            lineas: true,
          },
        });

        return nuevaFactura;
      });

      // Registrar métrica
      invoicesCreated.inc({ 
        type: data.formaPago || 'OTRO', 
        status: factura.estado 
      });

      logger.info('Factura created successfully', { 
        id: factura.id, 
        numeroFactura: factura.numeroFactura 
      });

      return this.mapToResponse(factura);
    } catch (error) {
      invoiceErrors.inc({ error_type: 'creation_error', operation: 'create' });
      logger.error('Error creating factura', { error });
      throw error;
    } finally {
      timer();
    }
  }

  async updateFactura(id: string, data: UpdateFacturaInput): Promise<FacturaResponse> {
    const timer = invoiceProcessingDuration.startTimer({ operation: 'update' });
    
    try {
      logger.info('Updating factura', { id });
      
      const facturaExistente = await this.facturaRepository.findById(id);
      if (!facturaExistente) {
        throw new Error('Factura no encontrada');
      }

      // Recalcular totales si se actualizan las líneas
      let updateData: any = { ...data };
      if (data.lineas) {
        const { subtotal, totalIVA, totalRetencion, total } = this.calcularTotales(
          data.lineas,
          data.tipoRetencion ?? facturaExistente.tipoRetencion
        );
        
        updateData = {
          ...updateData,
          subtotal,
          totalIVA,
          totalRetencion,
          total,
        };
      }

      const factura = await this.prisma.$transaction(async (tx) => {
        // Actualizar líneas si se proporcionan
        if (data.lineas) {
          // Eliminar líneas existentes
          await tx.lineaFactura.deleteMany({
            where: { facturaId: id },
          });

          // Crear nuevas líneas
          await tx.lineaFactura.createMany({
            data: data.lineas.map((linea) => {
              const subtotalLinea = linea.cantidad * linea.precioUnitario;
              const descuentoImporte = subtotalLinea * (linea.descuento || 0) / 100;
              const baseImponible = subtotalLinea - descuentoImporte;
              const ivaImporte = baseImponible * linea.tipoIVA / 100;
              
              return {
                facturaId: id,
                descripcion: linea.descripcion,
                cantidad: linea.cantidad,
                precioUnitario: linea.precioUnitario,
                tipoIVA: linea.tipoIVA,
                descuento: linea.descuento || 0,
                subtotal: subtotalLinea,
                totalIVA: ivaImporte,
                total: baseImponible + ivaImporte,
              };
            }),
          });
        }

        // Actualizar factura
        return await tx.factura.update({
          where: { id },
          data: updateData,
          include: {
            cliente: true,
            lineas: true,
          },
        });
      });

      logger.info('Factura updated successfully', { id });
      return this.mapToResponse(factura);
    } catch (error) {
      invoiceErrors.inc({ error_type: 'update_error', operation: 'update' });
      logger.error('Error updating factura', { error, id });
      throw error;
    } finally {
      timer();
    }
  }

  async getFactura(id: string): Promise<FacturaResponse> {
    try {
      const factura = await this.facturaRepository.findById(id);
      if (!factura) {
        throw new Error('Factura no encontrada');
      }
      return this.mapToResponse(factura);
    } catch (error) {
      logger.error('Error getting factura', { error, id });
      throw error;
    }
  }

  async getFacturaByNumero(numeroFactura: string): Promise<FacturaResponse> {
    try {
      const factura = await this.facturaRepository.findByNumero(numeroFactura);
      if (!factura) {
        throw new Error('Factura no encontrada');
      }
      return this.mapToResponse(factura);
    } catch (error) {
      logger.error('Error getting factura by numero', { error, numeroFactura });
      throw error;
    }
  }

  async listFacturas(filter: FacturaFilter): Promise<{
    data: FacturaResponse[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const result = await this.facturaRepository.findMany(filter);
      
      return {
        data: result.data.map(f => this.mapToResponse(f)),
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
      };
    } catch (error) {
      logger.error('Error listing facturas', { error, filter });
      throw error;
    }
  }

  async deleteFactura(id: string): Promise<void> {
    const timer = invoiceProcessingDuration.startTimer({ operation: 'delete' });
    
    try {
      logger.info('Deleting factura', { id });
      
      const factura = await this.facturaRepository.findById(id);
      if (!factura) {
        throw new Error('Factura no encontrada');
      }

      // Solo permitir eliminar facturas en estado BORRADOR
      if (factura.estado !== 'BORRADOR') {
        throw new Error('Solo se pueden eliminar facturas en estado borrador');
      }

      await this.prisma.$transaction(async (tx) => {
        // Eliminar líneas
        await tx.lineaFactura.deleteMany({
          where: { facturaId: id },
        });
        
        // Eliminar factura
        await tx.factura.delete({
          where: { id },
        });
      });

      logger.info('Factura deleted successfully', { id });
    } catch (error) {
      invoiceErrors.inc({ error_type: 'delete_error', operation: 'delete' });
      logger.error('Error deleting factura', { error, id });
      throw error;
    } finally {
      timer();
    }
  }

  async cambiarEstado(id: string, nuevoEstado: string): Promise<FacturaResponse> {
    const timer = invoiceProcessingDuration.startTimer({ operation: 'change_status' });
    
    try {
      logger.info('Changing factura estado', { id, nuevoEstado });
      
      const factura = await this.facturaRepository.findById(id);
      if (!factura) {
        throw new Error('Factura no encontrada');
      }

      // Validar transición de estado
      this.validarTransicionEstado(factura.estado, nuevoEstado);

      const facturaActualizada = await this.facturaRepository.updateEstado(id, nuevoEstado);
      
      invoicesCreated.inc({ 
        type: facturaActualizada.formaPago || 'OTRO', 
        status: nuevoEstado 
      });

      logger.info('Factura estado changed successfully', { id, nuevoEstado });
      return this.mapToResponse(facturaActualizada);
    } catch (error) {
      invoiceErrors.inc({ error_type: 'status_change_error', operation: 'change_status' });
      logger.error('Error changing factura estado', { error, id, nuevoEstado });
      throw error;
    } finally {
      timer();
    }
  }

  async getEstadisticas(clienteId?: string): Promise<any> {
    try {
      return await this.facturaRepository.getEstadisticas(clienteId);
    } catch (error) {
      logger.error('Error getting estadisticas', { error, clienteId });
      throw error;
    }
  }

  private calcularTotales(lineas: any[], tipoRetencion?: number): {
    subtotal: number;
    totalIVA: number;
    totalRetencion: number;
    total: number;
  } {
    let subtotal = 0;
    let totalIVA = 0;

    for (const linea of lineas) {
      const subtotalLinea = linea.cantidad * linea.precioUnitario;
      const descuentoImporte = subtotalLinea * (linea.descuento || 0) / 100;
      const baseImponible = subtotalLinea - descuentoImporte;
      const ivaImporte = baseImponible * linea.tipoIVA / 100;
      
      subtotal += baseImponible;
      totalIVA += ivaImporte;
    }

    const totalRetencion = tipoRetencion ? subtotal * tipoRetencion / 100 : 0;
    const total = subtotal + totalIVA - totalRetencion;

    return { subtotal, totalIVA, totalRetencion, total };
  }

  private validarTransicionEstado(estadoActual: string, nuevoEstado: string): void {
    const transicionesValidas: Record<string, string[]> = {
      BORRADOR: ['EMITIDA', 'ANULADA'],
      EMITIDA: ['ENVIADA', 'COBRADA', 'ANULADA'],
      ENVIADA: ['COBRADA', 'ANULADA'],
      COBRADA: ['ANULADA'],
      ANULADA: [],
    };

    if (!transicionesValidas[estadoActual]?.includes(nuevoEstado)) {
      throw new Error(
        `Transición de estado inválida: ${estadoActual} -> ${nuevoEstado}`
      );
    }
  }

  private mapToResponse(factura: any): FacturaResponse {
    return {
      id: factura.id,
      numeroFactura: factura.numeroFactura,
      fecha: factura.fecha,
      cliente: {
        id: factura.cliente.id,
        nombre: factura.cliente.nombre,
        nif: factura.cliente.nif,
        email: factura.cliente.email,
      },
      lineas: factura.lineas.map((linea: any) => ({
        id: linea.id,
        descripcion: linea.descripcion,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario,
        tipoIVA: linea.tipoIVA,
        descuento: linea.descuento,
        subtotal: linea.subtotal,
        totalIVA: linea.totalIVA,
        total: linea.total,
      })),
      subtotal: factura.subtotal,
      totalIVA: factura.totalIVA,
      totalRetencion: factura.totalRetencion,
      total: factura.total,
      estado: factura.estado,
      observaciones: factura.observaciones,
      createdAt: factura.createdAt,
      updatedAt: factura.updatedAt,
    };
  }
}