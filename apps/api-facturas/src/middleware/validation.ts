import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { validarNIF } from "../utils/fiscal";

// Esquema de validación para facturas
const facturaSchema = Joi.object({
  fecha: Joi.date().required().messages({
    "date.base": "La fecha debe ser una fecha válida",
    "any.required": "La fecha es requerida",
  }),
  fechaVencimiento: Joi.date().optional().allow(null),
  clienteId: Joi.string().uuid().required().messages({
    "string.guid": "El ID del cliente debe ser un UUID válido",
    "any.required": "El ID del cliente es requerido",
  }),
  tipo: Joi.string().valid("emitida", "recibida").required().messages({
    "any.only": 'El tipo debe ser "emitida" o "recibida"',
    "any.required": "El tipo de factura es requerido",
  }),
  concepto: Joi.string().min(1).max(500).required().messages({
    "string.min": "El concepto debe tener al menos 1 carácter",
    "string.max": "El concepto no puede tener más de 500 caracteres",
    "any.required": "El concepto es requerido",
  }),
  baseImponible: Joi.number().positive().precision(2).required().messages({
    "number.base": "La base imponible debe ser un número",
    "number.positive": "La base imponible debe ser mayor que 0",
    "any.required": "La base imponible es requerida",
  }),
  tipoIVA: Joi.number().min(0).max(100).precision(2).required().messages({
    "number.base": "El tipo de IVA debe ser un número",
    "number.min": "El tipo de IVA debe ser mayor o igual a 0",
    "number.max": "El tipo de IVA no puede ser mayor a 100",
    "any.required": "El tipo de IVA es requerido",
  }),
  tipoIRPF: Joi.number().min(0).max(100).precision(2).optional().messages({
    "number.base": "El tipo de IRPF debe ser un número",
    "number.min": "El tipo de IRPF debe ser mayor o igual a 0",
    "number.max": "El tipo de IRPF no puede ser mayor a 100",
  }),
  observaciones: Joi.string().max(1000).optional().allow("").messages({
    "string.max": "Las observaciones no pueden tener más de 1000 caracteres",
  }),
  lineas: Joi.array()
    .items(
      Joi.object({
        descripcion: Joi.string().min(1).max(500).required(),
        cantidad: Joi.number().positive().precision(3).required(),
        precioUnitario: Joi.number().positive().precision(2).required(),
        descuento: Joi.number()
          .min(0)
          .max(100)
          .precision(2)
          .optional()
          .default(0),
      })
    )
    .optional(),
});

// Esquema de validación para actualización de facturas
const facturaUpdateSchema = Joi.object({
  fecha: Joi.date().optional(),
  fechaVencimiento: Joi.date().optional().allow(null),
  concepto: Joi.string().min(1).max(500).optional(),
  baseImponible: Joi.number().positive().precision(2).optional(),
  tipoIVA: Joi.number().min(0).max(100).precision(2).optional(),
  tipoIRPF: Joi.number().min(0).max(100).precision(2).optional(),
  observaciones: Joi.string().max(1000).optional().allow(""),
  estado: Joi.string()
    .valid("borrador", "enviada", "pagada", "anulada")
    .optional(),
  lineas: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().optional(),
        descripcion: Joi.string().min(1).max(500).optional(),
        cantidad: Joi.number().positive().precision(3).optional(),
        precioUnitario: Joi.number().positive().precision(2).optional(),
        descuento: Joi.number().min(0).max(100).precision(2).optional(),
      })
    )
    .optional(),
});

// Esquema de validación para clientes
const clienteSchema = Joi.object({
  nombre: Joi.string().min(1).max(200).required().messages({
    "string.min": "El nombre debe tener al menos 1 carácter",
    "string.max": "El nombre no puede tener más de 200 caracteres",
    "any.required": "El nombre es requerido",
  }),
  nif: Joi.string()
    .custom((value, helpers) => {
      if (!validarNIF(value)) {
        return helpers.error("custom.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "El NIF es requerido",
      "custom.invalid": "El NIF no tiene un formato válido",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "El email debe tener un formato válido",
    "any.required": "El email es requerido",
  }),
  telefono: Joi.string().optional().allow(""),
  direccion: Joi.string().optional().allow(""),
  codigoPostal: Joi.string().optional().allow(""),
  ciudad: Joi.string().optional().allow(""),
  provincia: Joi.string().optional().allow(""),
  pais: Joi.string().optional().default("España"),
});

// Middleware de validación genérico
function validarEsquema(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const detalles = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        code: detail.type,
      }));

      return res.status(422).json({
        error: "VALIDATION_ERROR",
        message: "Los datos enviados no son válidos",
        details: detalles,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Reemplazar el body con los datos validados
    req.body = value;
    next();
  };
}

// Middleware específicos
export const validateFactura = validarEsquema(facturaSchema);
export const validateFacturaUpdate = validarEsquema(facturaUpdateSchema);
export const validateCliente = validarEsquema(clienteSchema);

// Middleware para validar parámetros de consulta
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const detalles = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        code: detail.type,
      }));

      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "Los parámetros de consulta no son válidos",
        details: detalles,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    req.query = value;
    next();
  };
};

// Middleware para validar parámetros de ruta
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const detalles = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        code: detail.type,
      }));

      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "Los parámetros de ruta no son válidos",
        details: detalles,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    req.params = value;
    next();
  };
};

// Esquemas comunes para parámetros
export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "El ID debe ser un UUID válido",
    "any.required": "El ID es requerido",
  }),
});

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const dateRangeQuerySchema = Joi.object({
  fechaDesde: Joi.date().required().messages({
    "date.base": "La fecha desde debe ser una fecha válida",
    "any.required": "La fecha desde es requerida",
  }),
  fechaHasta: Joi.date().required().messages({
    "date.base": "La fecha hasta debe ser una fecha válida",
    "any.required": "La fecha hasta es requerida",
  }),
});

export const trimestreQuerySchema = Joi.object({
  trimestre: Joi.number().integer().min(1).max(4).required().messages({
    "number.base": "El trimestre debe ser un número",
    "number.integer": "El trimestre debe ser un número entero",
    "number.min": "El trimestre debe ser entre 1 y 4",
    "number.max": "El trimestre debe ser entre 1 y 4",
    "any.required": "El trimestre es requerido",
  }),
  año: Joi.number().integer().min(2020).max(2030).required().messages({
    "number.base": "El año debe ser un número",
    "number.integer": "El año debe ser un número entero",
    "number.min": "El año debe ser mayor o igual a 2020",
    "number.max": "El año debe ser menor o igual a 2030",
    "any.required": "El año es requerido",
  }),
});
