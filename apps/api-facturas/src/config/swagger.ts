import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Facturas - TributariApp',
      version,
      description: 'API REST para la gestión de facturas electrónicas con soporte para PEPPOL y AEAT',
      contact: {
        name: 'Soporte TributariApp',
        email: 'soporte@tributariapp.com',
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.tributariapp.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        LineaFactura: {
          type: 'object',
          required: ['descripcion', 'cantidad', 'precioUnitario', 'tipoIVA'],
          properties: {
            descripcion: {
              type: 'string',
              minLength: 1,
              description: 'Descripción del producto o servicio',
            },
            cantidad: {
              type: 'number',
              minimum: 0.01,
              description: 'Cantidad',
            },
            precioUnitario: {
              type: 'number',
              minimum: 0,
              description: 'Precio unitario sin IVA',
            },
            tipoIVA: {
              type: 'number',
              minimum: 0,
              maximum: 21,
              description: 'Tipo de IVA (%)',
            },
            descuento: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Descuento aplicado (%)',
            },
          },
        },
        CreateFactura: {
          type: 'object',
          required: ['fecha', 'clienteId', 'lineas'],
          properties: {
            numeroFactura: {
              type: 'string',
              pattern: '^[A-Z0-9\\-\\/]+$',
              description: 'Número de factura (se genera automáticamente si no se proporciona)',
            },
            fecha: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de emisión',
            },
            clienteId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del cliente',
            },
            datosCliente: {
              type: 'object',
              description: 'Datos del cliente para facturación rápida',
              properties: {
                nombre: {
                  type: 'string',
                },
                nif: {
                  type: 'string',
                  pattern: '^[A-Z]?\\d{7,8}[A-Z]$',
                },
                direccion: {
                  type: 'string',
                },
                codigoPostal: {
                  type: 'string',
                  pattern: '^\\d{5}$',
                },
                ciudad: {
                  type: 'string',
                },
                provincia: {
                  type: 'string',
                },
                pais: {
                  type: 'string',
                  default: 'ES',
                },
                email: {
                  type: 'string',
                  format: 'email',
                },
                telefono: {
                  type: 'string',
                },
              },
            },
            lineas: {
              type: 'array',
              minItems: 1,
              items: {
                $ref: '#/components/schemas/LineaFactura',
              },
            },
            tipoRetencion: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Tipo de retención IRPF (%)',
            },
            observaciones: {
              type: 'string',
              maxLength: 500,
            },
            formaPago: {
              type: 'string',
              enum: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'DOMICILIACION', 'OTRO'],
            },
            vencimiento: {
              type: 'string',
              format: 'date-time',
            },
            estado: {
              type: 'string',
              enum: ['BORRADOR', 'EMITIDA', 'ENVIADA', 'COBRADA', 'ANULADA'],
              default: 'BORRADOR',
            },
            moneda: {
              type: 'string',
              default: 'EUR',
              minLength: 3,
              maxLength: 3,
            },
            idioma: {
              type: 'string',
              default: 'es',
              minLength: 2,
              maxLength: 2,
            },
          },
        },
        FacturaResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            numeroFactura: {
              type: 'string',
            },
            fecha: {
              type: 'string',
              format: 'date-time',
            },
            cliente: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                },
                nombre: {
                  type: 'string',
                },
                nif: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  nullable: true,
                },
              },
            },
            lineas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  descripcion: {
                    type: 'string',
                  },
                  cantidad: {
                    type: 'number',
                  },
                  precioUnitario: {
                    type: 'number',
                  },
                  tipoIVA: {
                    type: 'number',
                  },
                  descuento: {
                    type: 'number',
                    nullable: true,
                  },
                  subtotal: {
                    type: 'number',
                  },
                  totalIVA: {
                    type: 'number',
                  },
                  total: {
                    type: 'number',
                  },
                },
              },
            },
            subtotal: {
              type: 'number',
              description: 'Subtotal sin IVA',
            },
            totalIVA: {
              type: 'number',
              description: 'Total IVA',
            },
            totalRetencion: {
              type: 'number',
              description: 'Total retención IRPF',
            },
            total: {
              type: 'number',
              description: 'Total factura',
            },
            estado: {
              type: 'string',
            },
            observaciones: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        FacturaFilter: {
          type: 'object',
          properties: {
            numeroFactura: {
              type: 'string',
            },
            clienteId: {
              type: 'string',
              format: 'uuid',
            },
            estado: {
              type: 'string',
              enum: ['BORRADOR', 'EMITIDA', 'ENVIADA', 'COBRADA', 'ANULADA'],
            },
            fechaDesde: {
              type: 'string',
              format: 'date-time',
            },
            fechaHasta: {
              type: 'string',
              format: 'date-time',
            },
            importeMinimo: {
              type: 'number',
              minimum: 0,
            },
            importeMaximo: {
              type: 'number',
              minimum: 0,
            },
            page: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
            orderBy: {
              type: 'string',
              enum: ['fecha', 'numero', 'importe', 'estado'],
              default: 'fecha',
            },
            orderDirection: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
            },
          },
        },
        Estadisticas: {
          type: 'object',
          properties: {
            totalFacturas: {
              type: 'integer',
            },
            totalImporte: {
              type: 'number',
            },
            facturasPorEstado: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
            },
            facturasUltimoMes: {
              type: 'integer',
            },
            importeUltimoMes: {
              type: 'number',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);