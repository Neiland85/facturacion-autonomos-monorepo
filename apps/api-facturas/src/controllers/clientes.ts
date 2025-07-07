import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validarNIF } from '../utils/fiscal';

const prisma = new PrismaClient();

export class ClienteController {
  async getClientes(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const buscar = req.query.buscar as string;

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (buscar) {
        where.OR = [
          { nombre: { contains: buscar, mode: 'insensitive' } },
          { nif: { contains: buscar, mode: 'insensitive' } },
          { email: { contains: buscar, mode: 'insensitive' } }
        ];
      }

      // Obtener clientes con paginación
      const [clientes, total] = await Promise.all([
        prisma.cliente.findMany({
          where,
          skip,
          take: limit,
          orderBy: { nombre: 'asc' }
        }),
        prisma.cliente.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        data: clientes,
        meta: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener los clientes',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async getClienteById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cliente = await prisma.cliente.findUnique({
        where: { id },
        include: {
          facturas: {
            select: {
              id: true,
              numero: true,
              fecha: true,
              estado: true,
              total: true
            },
            orderBy: { fecha: 'desc' },
            take: 10
          }
        }
      });

      if (!cliente) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Cliente no encontrado',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      res.json({ data: cliente });
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener el cliente',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async createCliente(req: Request, res: Response) {
    try {
      const {
        nombre,
        nif,
        email,
        telefono,
        direccion,
        codigoPostal,
        ciudad,
        provincia,
        pais = 'España'
      } = req.body;

      // Validar NIF
      if (!validarNIF(nif)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Los datos enviados no son válidos',
          details: [{
            field: 'nif',
            message: 'El NIF/CIF no tiene un formato válido',
            code: 'INVALID_NIF'
          }],
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar que el NIF no existe
      const clienteExistente = await prisma.cliente.findFirst({
        where: { nif }
      });

      if (clienteExistente) {
        return res.status(409).json({
          error: 'CONFLICT',
          message: 'Ya existe un cliente con ese NIF',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Crear cliente
      const cliente = await prisma.cliente.create({
        data: {
          id: uuidv4(),
          nombre,
          nif,
          email,
          telefono,
          direccion,
          codigoPostal,
          ciudad,
          provincia,
          pais,
          activo: true
        }
      });

      res.status(201).json({
        data: cliente,
        message: 'Cliente creado correctamente'
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al crear el cliente',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async updateCliente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar que el cliente existe
      const clienteExistente = await prisma.cliente.findUnique({
        where: { id }
      });

      if (!clienteExistente) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Cliente no encontrado',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Validar NIF si se está actualizando
      if (updateData.nif && updateData.nif !== clienteExistente.nif) {
        if (!validarNIF(updateData.nif)) {
          return res.status(422).json({
            error: 'VALIDATION_ERROR',
            message: 'Los datos enviados no son válidos',
            details: [{
              field: 'nif',
              message: 'El NIF/CIF no tiene un formato válido',
              code: 'INVALID_NIF'
            }],
            timestamp: new Date().toISOString(),
            path: req.path
          });
        }

        // Verificar que el NIF no existe
        const clienteConNIF = await prisma.cliente.findFirst({
          where: { 
            nif: updateData.nif,
            id: { not: id }
          }
        });

        if (clienteConNIF) {
          return res.status(409).json({
            error: 'CONFLICT',
            message: 'Ya existe un cliente con ese NIF',
            timestamp: new Date().toISOString(),
            path: req.path
          });
        }
      }

      // Actualizar cliente
      const cliente = await prisma.cliente.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      res.json({
        data: cliente,
        message: 'Cliente actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar el cliente',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async deleteCliente(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar que el cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id },
        include: {
          facturas: true
        }
      });

      if (!cliente) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Cliente no encontrado',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar que no tiene facturas
      if (cliente.facturas.length > 0) {
        return res.status(409).json({
          error: 'CONFLICT',
          message: 'No se puede eliminar un cliente con facturas asociadas',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Eliminar cliente
      await prisma.cliente.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al eliminar el cliente',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
}
