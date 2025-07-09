"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ReportesController {
    async getTrimestral(req, res) {
        try {
            const trimestre = parseInt(req.query.trimestre);
            const año = parseInt(req.query.año);
            if (!trimestre || !año || trimestre < 1 || trimestre > 4) {
                return res.status(400).json({
                    error: 'BAD_REQUEST',
                    message: 'Trimestre y año son requeridos',
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            const mesesTrimestre = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
                [10, 11, 12]
            ];
            const meses = mesesTrimestre[trimestre - 1];
            const fechaInicio = new Date(año, meses[0] - 1, 1);
            const fechaFin = new Date(año, meses[2], 0);
            const facturas = await prisma.factura.findMany({
                where: {
                    fecha: {
                        gte: fechaInicio,
                        lte: fechaFin
                    }
                },
                select: {
                    tipo: true,
                    fecha: true,
                    baseImponible: true,
                    importeIVA: true,
                    importeIRPF: true,
                    total: true
                }
            });
            const facturasEmitidas = facturas.filter(f => f.tipo === 'emitida');
            const facturasRecibidas = facturas.filter(f => f.tipo === 'recibida');
            const resumen = {
                facturasEmitidas: {
                    cantidad: facturasEmitidas.length,
                    baseImponible: facturasEmitidas.reduce((sum, f) => sum + f.baseImponible, 0),
                    iva: facturasEmitidas.reduce((sum, f) => sum + f.importeIVA, 0),
                    irpf: facturasEmitidas.reduce((sum, f) => sum + f.importeIRPF, 0),
                    total: facturasEmitidas.reduce((sum, f) => sum + f.total, 0)
                },
                facturasRecibidas: {
                    cantidad: facturasRecibidas.length,
                    baseImponible: facturasRecibidas.reduce((sum, f) => sum + f.baseImponible, 0),
                    iva: facturasRecibidas.reduce((sum, f) => sum + f.importeIVA, 0),
                    irpf: facturasRecibidas.reduce((sum, f) => sum + f.importeIRPF, 0),
                    total: facturasRecibidas.reduce((sum, f) => sum + f.total, 0)
                }
            };
            const detalles = meses.map(mes => {
                const facturasMes = facturas.filter(f => f.fecha.getMonth() + 1 === mes);
                const emitidas = facturasMes.filter(f => f.tipo === 'emitida');
                const recibidas = facturasMes.filter(f => f.tipo === 'recibida');
                return {
                    mes,
                    facturasEmitidas: emitidas.length,
                    facturasRecibidas: recibidas.length,
                    baseImponible: facturasMes.reduce((sum, f) => sum + f.baseImponible, 0),
                    iva: facturasMes.reduce((sum, f) => sum + f.importeIVA, 0),
                    irpf: facturasMes.reduce((sum, f) => sum + f.importeIRPF, 0)
                };
            });
            res.json({
                trimestre,
                año,
                resumen,
                detalles
            });
        }
        catch (error) {
            console.error('Error al generar reporte trimestral:', error);
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Error al generar el reporte trimestral',
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
    }
    async getAnual(req, res) {
        try {
            const año = parseInt(req.query.año);
            if (!año) {
                return res.status(400).json({
                    error: 'BAD_REQUEST',
                    message: 'Año es requerido',
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            const fechaInicio = new Date(año, 0, 1);
            const fechaFin = new Date(año, 11, 31);
            const facturas = await prisma.factura.findMany({
                where: {
                    fecha: {
                        gte: fechaInicio,
                        lte: fechaFin
                    }
                },
                select: {
                    tipo: true,
                    fecha: true,
                    baseImponible: true,
                    importeIVA: true,
                    importeIRPF: true,
                    total: true
                }
            });
            const trimestres = [1, 2, 3, 4].map(trimestre => {
                const mesesTrimestre = [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                    [10, 11, 12]
                ];
                const meses = mesesTrimestre[trimestre - 1];
                const facturasTrimestre = facturas.filter(f => meses.includes(f.fecha.getMonth() + 1));
                const emitidas = facturasTrimestre.filter(f => f.tipo === 'emitida');
                const recibidas = facturasTrimestre.filter(f => f.tipo === 'recibida');
                return {
                    trimestre,
                    facturasEmitidas: emitidas.length,
                    facturasRecibidas: recibidas.length,
                    baseImponible: facturasTrimestre.reduce((sum, f) => sum + f.baseImponible, 0),
                    iva: facturasTrimestre.reduce((sum, f) => sum + f.importeIVA, 0),
                    irpf: facturasTrimestre.reduce((sum, f) => sum + f.importeIRPF, 0),
                    total: facturasTrimestre.reduce((sum, f) => sum + f.total, 0)
                };
            });
            const resumen = {
                totalFacturas: facturas.length,
                totalEmitidas: facturas.filter(f => f.tipo === 'emitida').length,
                totalRecibidas: facturas.filter(f => f.tipo === 'recibida').length,
                baseImponible: facturas.reduce((sum, f) => sum + f.baseImponible, 0),
                iva: facturas.reduce((sum, f) => sum + f.importeIVA, 0),
                irpf: facturas.reduce((sum, f) => sum + f.importeIRPF, 0),
                total: facturas.reduce((sum, f) => sum + f.total, 0)
            };
            res.json({
                año,
                resumen,
                trimestres
            });
        }
        catch (error) {
            console.error('Error al generar reporte anual:', error);
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Error al generar el reporte anual',
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
    }
    async getVentas(req, res) {
        try {
            const fechaDesde = req.query.fechaDesde;
            const fechaHasta = req.query.fechaHasta;
            if (!fechaDesde || !fechaHasta) {
                return res.status(400).json({
                    error: 'BAD_REQUEST',
                    message: 'Fecha desde y fecha hasta son requeridas',
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            const facturas = await prisma.factura.findMany({
                where: {
                    tipo: 'emitida',
                    fecha: {
                        gte: new Date(fechaDesde),
                        lte: new Date(fechaHasta)
                    }
                },
                include: {
                    cliente: true,
                    lineas: true
                },
                orderBy: { fecha: 'desc' }
            });
            const resumen = {
                totalFacturas: facturas.length,
                baseImponible: facturas.reduce((sum, f) => sum + f.baseImponible, 0),
                iva: facturas.reduce((sum, f) => sum + f.importeIVA, 0),
                irpf: facturas.reduce((sum, f) => sum + f.importeIRPF, 0),
                total: facturas.reduce((sum, f) => sum + f.total, 0)
            };
            res.json({
                periodo: { desde: fechaDesde, hasta: fechaHasta },
                resumen,
                facturas
            });
        }
        catch (error) {
            console.error('Error al generar reporte de ventas:', error);
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Error al generar el reporte de ventas',
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
    }
    async getGastos(req, res) {
        try {
            const fechaDesde = req.query.fechaDesde;
            const fechaHasta = req.query.fechaHasta;
            if (!fechaDesde || !fechaHasta) {
                return res.status(400).json({
                    error: 'BAD_REQUEST',
                    message: 'Fecha desde y fecha hasta son requeridas',
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            const facturas = await prisma.factura.findMany({
                where: {
                    tipo: 'recibida',
                    fecha: {
                        gte: new Date(fechaDesde),
                        lte: new Date(fechaHasta)
                    }
                },
                include: {
                    cliente: true,
                    lineas: true
                },
                orderBy: { fecha: 'desc' }
            });
            const resumen = {
                totalFacturas: facturas.length,
                baseImponible: facturas.reduce((sum, f) => sum + f.baseImponible, 0),
                iva: facturas.reduce((sum, f) => sum + f.importeIVA, 0),
                irpf: facturas.reduce((sum, f) => sum + f.importeIRPF, 0),
                total: facturas.reduce((sum, f) => sum + f.total, 0)
            };
            res.json({
                periodo: { desde: fechaDesde, hasta: fechaHasta },
                resumen,
                facturas
            });
        }
        catch (error) {
            console.error('Error al generar reporte de gastos:', error);
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Error al generar el reporte de gastos',
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
    }
    async exportar(req, res) {
        try {
            const { formato } = req.params;
            const { tipo } = req.body;
            if (!['pdf', 'excel', 'csv'].includes(formato)) {
                return res.status(400).json({
                    error: 'BAD_REQUEST',
                    message: 'Formato no válido. Formatos soportados: pdf, excel, csv',
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            res.json({
                tipo,
                formato: req.body.formato || 'json',
                mensaje: 'Funcionalidad de exportación en desarrollo'
            });
            const nombreArchivo = `reporte-${tipo}-${Date.now()}.${formato}`;
            res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
            switch (formato) {
                case 'pdf':
                    res.setHeader('Content-Type', 'application/pdf');
                    res.send(Buffer.from('PDF placeholder'));
                    break;
                case 'excel':
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.send(Buffer.from('Excel placeholder'));
                    break;
                case 'csv':
                    res.setHeader('Content-Type', 'text/csv');
                    res.send('CSV placeholder');
                    break;
            }
        }
        catch (error) {
            console.error('Error al exportar reporte:', error);
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Error al exportar el reporte',
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
    }
}
exports.ReportesController = ReportesController;
//# sourceMappingURL=reportes.js.map