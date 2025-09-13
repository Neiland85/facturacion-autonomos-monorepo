/**
 * Middleware para verificar lista blanca de IPs para webhooks de AEAT
 */
export class WebhookIPWhitelistMiddleware {
    allowedIPs;
    constructor() {
        // IPs permitidas para webhooks de AEAT (configurables por entorno)
        this.allowedIPs = this.getAllowedIPs();
    }
    /**
     * Middleware para verificar IP en lista blanca
     */
    checkIPWhitelist = (req, res, next) => {
        const clientIP = this.getClientIP(req);
        // En desarrollo, permitir localhost
        if (process.env.NODE_ENV === 'development' && this.isLocalhost(clientIP)) {
            console.log(`[WEBHOOK] IP permitida en desarrollo: ${clientIP}`);
            return next();
        }
        // Verificar IP en lista blanca
        if (this.isIPAllowed(clientIP)) {
            console.log(`[WEBHOOK] IP permitida: ${clientIP}`);
            return next();
        }
        console.warn(`[WEBHOOK] IP bloqueada: ${clientIP}`);
        res.status(403).json({
            status: 'error',
            message: 'IP no autorizada para webhooks',
            ip: clientIP,
        });
    };
    /**
     * Obtiene IPs permitidas desde configuración
     */
    getAllowedIPs() {
        const allowedIPs = process.env.WEBHOOK_ALLOWED_IPS?.split(',') || [];
        // IPs conocidas de AEAT (sandbox y producción)
        const aeatIPs = [
            '193.146.16.0/20', // Rango AEAT sandbox
            '193.146.32.0/19', // Rango AEAT producción
            '127.0.0.1', // Localhost para desarrollo
            '::1', // IPv6 localhost
        ];
        return [...allowedIPs, ...aeatIPs];
    }
    /**
     * Obtiene la IP real del cliente
     */
    getClientIP(req) {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return forwarded.split(',')[0]?.trim() || 'unknown';
        }
        return req.socket.remoteAddress || 'unknown';
    }
    /**
     * Verifica si la IP está permitida
     */
    isIPAllowed(ip) {
        return this.allowedIPs.some(allowedIP => {
            // Verificación exacta
            if (allowedIP === ip)
                return true;
            // Verificación de rango CIDR (simplificada)
            if (allowedIP.includes('/')) {
                return this.isIPInRange(ip, allowedIP);
            }
            return false;
        });
    }
    /**
     * Verifica si es localhost
     */
    isLocalhost(ip) {
        return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    }
    /**
     * Verifica si IP está en rango CIDR (implementación básica)
     */
    isIPInRange(ip, range) {
        try {
            const [rangeIP, cidr] = range.split('/');
            if (!rangeIP || !cidr)
                return false;
            const cidrNum = parseInt(cidr);
            // Conversión básica para IPv4
            const ipToNum = (ip) => {
                return ip
                    .split('.')
                    .reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
            };
            const mask = ~(0xffffffff >>> cidrNum);
            const ipNum = ipToNum(ip);
            const rangeNum = ipToNum(rangeIP);
            return (ipNum & mask) === (rangeNum & mask);
        }
        catch (error) {
            console.error('Error verificando rango IP:', error);
            return false;
        }
    }
}
