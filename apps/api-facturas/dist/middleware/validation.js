"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimestreQuerySchema = exports.dateRangeQuerySchema = exports.paginationQuerySchema = exports.idParamSchema = exports.validateParams = exports.validateQuery = exports.validateCliente = exports.validateFacturaUpdate = exports.validateFactura = void 0;
const joi_1 = __importDefault(require("joi"));
const fiscal_1 = require("../utils/fiscal");
const facturaSchema = joi_1.default.object({
    fecha: joi_1.default.date().required().messages({
        'date.base': 'La fecha debe ser una fecha válida',
        'any.required': 'La fecha es requerida'
    }),
    fechaVencimiento: joi_1.default.date().optional().allow(null),
    clienteId: joi_1.default.string().uuid().required().messages({
        'string.guid': 'El ID del cliente debe ser un UUID válido',
        'any.required': 'El ID del cliente es requerido'
    }),
    tipo: joi_1.default.string().valid('emitida', 'recibida').required().messages({
        'any.only': 'El tipo debe ser "emitida" o "recibida"',
        'any.required': 'El tipo de factura es requerido'
    }),
    concepto: joi_1.default.string().min(1).max(500).required().messages({
        'string.min': 'El concepto debe tener al menos 1 carácter',
        'string.max': 'El concepto no puede tener más de 500 caracteres',
        'any.required': 'El concepto es requerido'
    }),
    baseImponible: joi_1.default.number().positive().precision(2).required().messages({
        'number.base': 'La base imponible debe ser un número',
        'number.positive': 'La base imponible debe ser mayor que 0',
        'any.required': 'La base imponible es requerida'
    }),
    tipoIVA: joi_1.default.number().min(0).max(100).precision(2).required().messages({
        'number.base': 'El tipo de IVA debe ser un número',
        'number.min': 'El tipo de IVA debe ser mayor o igual a 0',
        'number.max': 'El tipo de IVA no puede ser mayor a 100',
        'any.required': 'El tipo de IVA es requerido'
    }),
    tipoIRPF: joi_1.default.number().min(0).max(100).precision(2).optional().messages({
        'number.base': 'El tipo de IRPF debe ser un número',
        'number.min': 'El tipo de IRPF debe ser mayor o igual a 0',
        'number.max': 'El tipo de IRPF no puede ser mayor a 100'
    }),
    observaciones: joi_1.default.string().max(1000).optional().allow('').messages({
        'string.max': 'Las observaciones no pueden tener más de 1000 caracteres'
    }),
    lineas: joi_1.default.array().items(joi_1.default.object({
        descripcion: joi_1.default.string().min(1).max(500).required(),
        cantidad: joi_1.default.number().positive().precision(3).required(),
        precioUnitario: joi_1.default.number().positive().precision(2).required(),
        descuento: joi_1.default.number().min(0).max(100).precision(2).optional().default(0)
    })).optional()
});
const facturaUpdateSchema = joi_1.default.object({
    fecha: joi_1.default.date().optional(),
    fechaVencimiento: joi_1.default.date().optional().allow(null),
    concepto: joi_1.default.string().min(1).max(500).optional(),
    baseImponible: joi_1.default.number().positive().precision(2).optional(),
    tipoIVA: joi_1.default.number().min(0).max(100).precision(2).optional(),
    tipoIRPF: joi_1.default.number().min(0).max(100).precision(2).optional(),
    observaciones: joi_1.default.string().max(1000).optional().allow(''),
    estado: joi_1.default.string().valid('borrador', 'enviada', 'pagada', 'anulada').optional(),
    lineas: joi_1.default.array().items(joi_1.default.object({
        id: joi_1.default.string().uuid().optional(),
        descripcion: joi_1.default.string().min(1).max(500).optional(),
        cantidad: joi_1.default.number().positive().precision(3).optional(),
        precioUnitario: joi_1.default.number().positive().precision(2).optional(),
        descuento: joi_1.default.number().min(0).max(100).precision(2).optional()
    })).optional()
});
const clienteSchema = joi_1.default.object({
    nombre: joi_1.default.string().min(1).max(200).required().messages({
        'string.min': 'El nombre debe tener al menos 1 carácter',
        'string.max': 'El nombre no puede tener más de 200 caracteres',
        'any.required': 'El nombre es requerido'
    }),
    nif: joi_1.default.string().custom((value, helpers) => {
        if (!(0, fiscal_1.validarNIF)(value)) {
            return helpers.error('custom.invalid');
        }
        return value;
    }).required().messages({
        'any.required': 'El NIF es requerido',
        'custom.invalid': 'El NIF no tiene un formato válido'
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es requerido'
    }),
    telefono: joi_1.default.string().optional().allow(''),
    direccion: joi_1.default.string().optional().allow(''),
    codigoPostal: joi_1.default.string().optional().allow(''),
    ciudad: joi_1.default.string().optional().allow(''),
    provincia: joi_1.default.string().optional().allow(''),
    pais: joi_1.default.string().optional().default('España')
});
function validarEsquema(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const detalles = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                code: detail.type
            }));
            return res.status(422).json({
                error: 'VALIDATION_ERROR',
                message: 'Los datos enviados no son válidos',
                details: detalles,
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
        req.body = value;
        next();
    };
}
exports.validateFactura = validarEsquema(facturaSchema);
exports.validateFacturaUpdate = validarEsquema(facturaUpdateSchema);
exports.validateCliente = validarEsquema(clienteSchema);
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const detalles = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                code: detail.type
            }));
            return res.status(400).json({
                error: 'BAD_REQUEST',
                message: 'Los parámetros de consulta no son válidos',
                details: detalles,
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const detalles = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                code: detail.type
            }));
            return res.status(400).json({
                error: 'BAD_REQUEST',
                message: 'Los parámetros de ruta no son válidos',
                details: detalles,
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
        req.params = value;
        next();
    };
};
exports.validateParams = validateParams;
exports.idParamSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'El ID debe ser un UUID válido',
        'any.required': 'El ID es requerido'
    })
});
exports.paginationQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20)
});
exports.dateRangeQuerySchema = joi_1.default.object({
    fechaDesde: joi_1.default.date().required().messages({
        'date.base': 'La fecha desde debe ser una fecha válida',
        'any.required': 'La fecha desde es requerida'
    }),
    fechaHasta: joi_1.default.date().required().messages({
        'date.base': 'La fecha hasta debe ser una fecha válida',
        'any.required': 'La fecha hasta es requerida'
    })
});
exports.trimestreQuerySchema = joi_1.default.object({
    trimestre: joi_1.default.number().integer().min(1).max(4).required().messages({
        'number.base': 'El trimestre debe ser un número',
        'number.integer': 'El trimestre debe ser un número entero',
        'number.min': 'El trimestre debe ser entre 1 y 4',
        'number.max': 'El trimestre debe ser entre 1 y 4',
        'any.required': 'El trimestre es requerido'
    }),
    año: joi_1.default.number().integer().min(2020).max(2030).required().messages({
        'number.base': 'El año debe ser un número',
        'number.integer': 'El año debe ser un número entero',
        'number.min': 'El año debe ser mayor o igual a 2020',
        'number.max': 'El año debe ser menor o igual a 2030',
        'any.required': 'El año es requerido'
    })
});
//# sourceMappingURL=validation.js.map