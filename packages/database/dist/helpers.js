"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsHelpers = exports.clientHelpers = exports.invoiceHelpers = void 0;
const client_1 = require("./client");
exports.invoiceHelpers = {
    async getFilteredInvoices(filters = {}) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.dateFrom || filters.dateTo) {
            where.issueDate = {};
            if (filters.dateFrom)
                where.issueDate.gte = filters.dateFrom;
            if (filters.dateTo)
                where.issueDate.lte = filters.dateTo;
        }
        if (filters.clientId) {
            where.clientId = filters.clientId;
        }
        if (filters.search) {
            where.OR = [
                { number: { contains: filters.search, mode: 'insensitive' } },
                { client: { name: { contains: filters.search, mode: 'insensitive' } } },
                { notes: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return client_1.prisma.invoice.findMany({
            where,
            include: {
                client: true,
                company: true,
                lines: true,
            },
            orderBy: { issueDate: 'desc' },
        });
    },
    async getInvoiceStats(userId) {
        const invoices = await client_1.prisma.invoice.findMany({
            where: { userId },
            select: {
                status: true,
                total: true,
            },
        });
        const stats = invoices.reduce((acc, invoice) => {
            acc.total++;
            acc.totalAmount += Number(invoice.total);
            if (invoice.status === 'PAID') {
                acc.paid++;
                acc.paidAmount += Number(invoice.total);
            }
            else if (invoice.status === 'SENT') {
                acc.pending++;
                acc.pendingAmount += Number(invoice.total);
            }
            else if (invoice.status === 'OVERDUE') {
                acc.overdue++;
                acc.pendingAmount += Number(invoice.total);
            }
            return acc;
        }, {
            total: 0,
            paid: 0,
            pending: 0,
            overdue: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
        });
        return stats;
    },
    async getNextInvoiceNumber(userId, series = 'A') {
        const lastInvoice = await client_1.prisma.invoice.findFirst({
            where: {
                userId,
                series,
            },
            orderBy: { number: 'desc' },
        });
        if (!lastInvoice) {
            return `${series}001`;
        }
        const numberPart = lastInvoice.number.replace(series, '');
        const nextNumber = (parseInt(numberPart) + 1).toString().padStart(3, '0');
        return `${series}${nextNumber}`;
    },
};
exports.clientHelpers = {
    async getFilteredClients(userId, filters = {}) {
        const where = { userId };
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { nifCif: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters.city) {
            where.city = { contains: filters.city, mode: 'insensitive' };
        }
        if (filters.province) {
            where.province = { contains: filters.province, mode: 'insensitive' };
        }
        return client_1.prisma.client.findMany({
            where,
            include: {
                _count: {
                    select: { invoices: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    },
    async getClientWithInvoices(clientId) {
        return client_1.prisma.client.findUnique({
            where: { id: clientId },
            include: {
                invoices: {
                    include: {
                        lines: true,
                    },
                    orderBy: { issueDate: 'desc' },
                },
            },
        });
    },
};
exports.analyticsHelpers = {
    async getMonthlyRevenue(userId, year) {
        const whereClause = {
            userId,
            status: 'PAID',
        };
        if (year) {
            whereClause.issueDate = {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            };
        }
        const invoices = await client_1.prisma.invoice.findMany({
            where: whereClause,
            select: {
                issueDate: true,
                total: true,
            },
        });
        const monthlyData = invoices.reduce((acc, invoice) => {
            const date = new Date(invoice.issueDate);
            const month = date.toLocaleString('es-ES', { month: 'long' });
            const year = date.getFullYear();
            const key = `${year}-${month}`;
            if (!acc[key]) {
                acc[key] = {
                    month,
                    year,
                    amount: 0,
                    invoiceCount: 0,
                };
            }
            acc[key].amount += Number(invoice.total);
            acc[key].invoiceCount++;
            return acc;
        }, {});
        return Object.values(monthlyData).sort((a, b) => {
            if (a.year !== b.year)
                return a.year - b.year;
            return (new Date(`${a.month} 1, ${a.year}`).getMonth() -
                new Date(`${b.month} 1, ${b.year}`).getMonth());
        });
    },
};
//# sourceMappingURL=helpers.js.map