"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const index_1 = require("../index");
class TwoFactorService {
    serviceName = 'Facturación Autónomos';
    issuer = 'facturacion-autonomos.com';
    /**
     * Generar secreto 2FA y código QR para el usuario
     */
    async generateTwoFactorSecret(userId, userEmail) {
        try {
            // Generar secreto único
            const secret = speakeasy_1.default.generateSecret({
                name: `${this.serviceName} (${userEmail})`,
                issuer: this.issuer,
                length: 32
            });
            // Generar códigos de backup
            const backupCodes = this.generateBackupCodes();
            // Almacenar temporalmente en Redis (pendiente de verificación)
            const tempData = {
                secret: secret.base32,
                backupCodes,
                verified: false,
                createdAt: new Date().toISOString()
            };
            // TTL de 10 minutos para setup temporal
            await index_1.redis.setex(`2fa_setup:${userId}`, 600, JSON.stringify(tempData));
            // Generar código QR
            const qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
            return {
                secret: secret.base32,
                qrCodeUrl,
                backupCodes
            };
        }
        catch (error) {
            console.error('Error generando secreto 2FA:', error);
            throw new Error('Error al generar configuración 2FA');
        }
    }
    /**
     * Verificar código 2FA y confirmar setup
     */
    async verifyAndEnableCode(userId, token) {
        try {
            // Obtener setup temporal
            const setupData = await index_1.redis.get(`2fa_setup:${userId}`);
            if (!setupData) {
                throw new Error('Setup 2FA no encontrado o expirado');
            }
            const { secret, backupCodes } = JSON.parse(setupData);
            // Verificar el código TOTP
            const verified = speakeasy_1.default.totp.verify({
                secret,
                encoding: 'base32',
                token,
                window: 2 // Permitir +/- 2 intervalos de tiempo (60 segundos)
            });
            if (!verified) {
                return false;
            }
            // Si es válido, guardar permanentemente
            const permanentData = {
                secret,
                backupCodes: backupCodes.map((code) => ({ code, used: false })),
                enabled: true,
                createdAt: new Date().toISOString(),
                lastUsed: null
            };
            await index_1.redis.setex(`2fa:${userId}`, 86400 * 30, JSON.stringify(permanentData)); // 30 días
            // Limpiar setup temporal
            await index_1.redis.del(`2fa_setup:${userId}`);
            return true;
        }
        catch (error) {
            console.error('Error verificando código 2FA:', error);
            return false;
        }
    }
    /**
     * Verificar código 2FA durante login
     */
    async verifyCode(userId, token) {
        try {
            const userData = await index_1.redis.get(`2fa:${userId}`);
            if (!userData) {
                return false;
            }
            const { secret, backupCodes, enabled } = JSON.parse(userData);
            if (!enabled) {
                return false;
            }
            // Verificar si es un código backup
            if (this.isBackupCode(token)) {
                return await this.verifyBackupCode(userId, token, backupCodes);
            }
            // Verificar código TOTP
            const verified = speakeasy_1.default.totp.verify({
                secret,
                encoding: 'base32',
                token,
                window: 2
            });
            if (verified) {
                // Actualizar último uso
                const updatedData = JSON.parse(userData);
                updatedData.lastUsed = new Date().toISOString();
                await index_1.redis.setex(`2fa:${userId}`, 86400 * 30, JSON.stringify(updatedData));
            }
            return verified;
        }
        catch (error) {
            console.error('Error verificando código 2FA:', error);
            return false;
        }
    }
    /**
     * Verificar código de backup
     */
    async verifyBackupCode(userId, code, backupCodes) {
        try {
            const backupCode = backupCodes.find(bc => bc.code === code && !bc.used);
            if (!backupCode) {
                return false;
            }
            // Marcar código como usado
            backupCode.used = true;
            backupCode.usedAt = new Date().toISOString();
            // Actualizar en Redis
            const userData = await index_1.redis.get(`2fa:${userId}`);
            if (userData) {
                const parsedData = JSON.parse(userData);
                parsedData.backupCodes = backupCodes;
                parsedData.lastUsed = new Date().toISOString();
                await index_1.redis.setex(`2fa:${userId}`, 86400 * 30, JSON.stringify(parsedData));
            }
            return true;
        }
        catch (error) {
            console.error('Error verificando código backup:', error);
            return false;
        }
    }
    /**
     * Deshabilitar 2FA para un usuario
     */
    async disable2FA(userId) {
        try {
            await index_1.redis.del(`2fa:${userId}`);
            await index_1.redis.del(`2fa_setup:${userId}`);
            return true;
        }
        catch (error) {
            console.error('Error deshabilitando 2FA:', error);
            return false;
        }
    }
    /**
     * Generar nuevos códigos de backup
     */
    async regenerateBackupCodes(userId) {
        try {
            const userData = await index_1.redis.get(`2fa:${userId}`);
            if (!userData) {
                throw new Error('2FA no configurado para este usuario');
            }
            const parsedData = JSON.parse(userData);
            const newBackupCodes = this.generateBackupCodes();
            parsedData.backupCodes = newBackupCodes.map(code => ({ code, used: false }));
            parsedData.backupCodesRegeneratedAt = new Date().toISOString();
            await index_1.redis.setex(`2fa:${userId}`, 86400 * 30, JSON.stringify(parsedData));
            return newBackupCodes;
        }
        catch (error) {
            console.error('Error regenerando códigos backup:', error);
            throw new Error('Error al regenerar códigos de backup');
        }
    }
    /**
     * Obtener estado 2FA del usuario
     */
    async get2FAStatus(userId) {
        try {
            const userData = await index_1.redis.get(`2fa:${userId}`);
            if (!userData) {
                return { enabled: false };
            }
            const { enabled, backupCodes, lastUsed } = JSON.parse(userData);
            const unusedBackupCodes = backupCodes?.filter((bc) => !bc.used).length || 0;
            return {
                enabled,
                backupCodesRemaining: unusedBackupCodes,
                lastUsed
            };
        }
        catch (error) {
            console.error('Error obteniendo estado 2FA:', error);
            return { enabled: false };
        }
    }
    /**
     * Generar códigos de backup seguros
     */
    generateBackupCodes(count = 10) {
        const crypto = require('crypto');
        const codes = [];
        for (let i = 0; i < count; i++) {
            // Generar código de 8 dígitos
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
        }
        return codes;
    }
    /**
     * Verificar si un código es un código de backup (8 caracteres hex)
     */
    isBackupCode(code) {
        return /^[A-F0-9]{8}$/i.test(code);
    }
    /**
     * Limpiar configuraciones 2FA expiradas
     */
    async cleanup2FASetups() {
        try {
            const keys = await index_1.redis.keys('2fa_setup:*');
            const expiredKeys = [];
            for (const key of keys) {
                const ttl = await index_1.redis.ttl(key);
                if (ttl <= 0) {
                    expiredKeys.push(key);
                }
            }
            if (expiredKeys.length > 0) {
                await index_1.redis.del(...expiredKeys);
                console.log(`Limpiados ${expiredKeys.length} setups 2FA expirados`);
            }
        }
        catch (error) {
            console.error('Error limpiando setups 2FA:', error);
        }
    }
    /**
     * Validar formato de código TOTP
     */
    isValidTOTPFormat(token) {
        return /^\d{6}$/.test(token);
    }
    /**
     * Obtener tiempo restante para el próximo código TOTP
     */
    getTimeRemaining() {
        const now = Math.floor(Date.now() / 1000);
        const timeStep = 30; // TOTP usa intervalos de 30 segundos
        return timeStep - (now % timeStep);
    }
}
exports.TwoFactorService = TwoFactorService;
