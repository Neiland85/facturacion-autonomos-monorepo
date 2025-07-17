"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const aeat_routes_1 = require("./aeat.routes");
const auth_routes_1 = require("./auth.routes");
const client_routes_1 = require("./client.routes");
const invoice_routes_1 = require("./invoice.routes");
const monitoring_routes_1 = require("./monitoring.routes");
const notification_routes_1 = require("./notification.routes");
const peppol_routes_1 = require("./peppol.routes");
const storage_routes_1 = require("./storage.routes");
const tax_routes_1 = require("./tax.routes");
const setupRoutes = (app, serviceRegistry, circuitBreaker) => {
    app.use('/api/v1/auth', (0, auth_routes_1.authRoutes)(serviceRegistry, circuitBreaker));
    app.use('/api/v1/invoices', (0, invoice_routes_1.invoiceRoutes)(serviceRegistry, circuitBreaker));
    app.use('/api/v1/clients', (0, client_routes_1.clientRoutes)(serviceRegistry, circuitBreaker));
    app.use('/api/v1/tax', (0, tax_routes_1.taxRoutes)(serviceRegistry, circuitBreaker));
    app.use('/api/v1/aeat', (0, aeat_routes_1.aeatRoutes)(serviceRegistry, circuitBreaker));
    app.use('/api/v1/peppol', (0, peppol_routes_1.peppolRoutes)(serviceRegistry, circuitBreaker));
    app.use('/api/v1/notifications', (0, notification_routes_1.notificationRoutes)(serviceRegistry, circuitBreaker));
    app.use('/api/v1/storage', (0, storage_routes_1.storageRoutes)(serviceRegistry, circuitBreaker));
    app.use('/api/v1/monitoring', (0, monitoring_routes_1.monitoringRoutes)(serviceRegistry, circuitBreaker));
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map