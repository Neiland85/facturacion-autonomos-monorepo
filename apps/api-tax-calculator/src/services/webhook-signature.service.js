"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSignatureService = void 0;
var crypto_1 = require("crypto");
var crypto_js_1 = require("crypto-js");
var node_rsa_1 = require("node-rsa");
/**
 * Servicio para verificación de firmas digitales de webhooks AEAT
 * Implementa verificación HMAC-SHA256 y RSA según especificaciones AEAT
 */
var WebhookSignatureService = /** @class */ (function () {
    function WebhookSignatureService() {
        // Clave pública de AEAT (sandbox/producción)
        this.aeatPublicKey = process.env.AEAT_PUBLIC_KEY || this.getDefaultAEATPublicKey();
        // Secret compartido para HMAC
        this.webhookSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret';
    }
    /**
     * Verifica la firma HMAC-SHA256 de un webhook
     * @param payload - Payload del webhook como string
     * @param signature - Firma recibida en el header
     * @param timestamp - Timestamp del webhook
     * @returns boolean - true si la firma es válida
     */
    WebhookSignatureService.prototype.verifyHMACSignature = function (payload, signature, timestamp) {
        try {
            // Construir string a firmar (payload + timestamp si existe)
            var stringToSign = timestamp ? "".concat(payload, ".").concat(timestamp) : payload;
            // Calcular HMAC-SHA256
            var expectedSignature = crypto_js_1.default.HmacSHA256(stringToSign, this.webhookSecret);
            var expectedSignatureHex = "sha256=".concat(expectedSignature.toString(crypto_js_1.default.enc.Hex));
            // Comparación segura contra timing attacks
            return this.secureCompare(signature, expectedSignatureHex);
        }
        catch (error) {
            console.error('Error verificando firma HMAC:', error);
            return false;
        }
    };
    /**
     * Verifica la firma RSA de un webhook AEAT
     * @param payload - Payload del webhook
     * @param signature - Firma RSA en base64
     * @param algorithm - Algoritmo usado (default: SHA256withRSA)
     * @returns boolean - true si la firma es válida
     */
    WebhookSignatureService.prototype.verifyRSASignature = function (payload, signature, algorithm) {
        if (algorithm === void 0) { algorithm = 'SHA256withRSA'; }
        try {
            var key = new node_rsa_1.default(this.aeatPublicKey, 'public');
            // Configurar esquema de firma según algoritmo
            var scheme = this.getRSAScheme(algorithm);
            key.setOptions({ signingScheme: scheme });
            // Verificar firma
            var signatureBuffer = Buffer.from(signature, 'base64');
            return key.verify(payload, signatureBuffer);
        }
        catch (error) {
            console.error('Error verificando firma RSA:', error);
            return false;
        }
    };
    /**
     * Verifica la integridad del payload usando múltiples métodos
     * @param payload - Payload del webhook
     * @param headers - Headers HTTP del webhook
     * @returns VerificationResult - Resultado detallado de la verificación
     */
    WebhookSignatureService.prototype.verifyWebhookIntegrity = function (payload, headers) {
        var result = {
            isValid: false,
            method: 'none',
            errors: [],
        };
        // Extraer headers relevantes
        var signature = headers['x-aeat-signature'] || headers['x-signature'];
        var timestamp = headers['x-aeat-timestamp'] || headers['x-timestamp'];
        var algorithm = headers['x-aeat-algorithm'] || 'HMAC-SHA256';
        if (!signature) {
            result.errors.push('Signature header missing');
            return result;
        }
        // Verificar timestamp si está presente (evitar replay attacks)
        if (timestamp && !this.verifyTimestamp(timestamp)) {
            result.errors.push('Timestamp verification failed');
            return result;
        }
        // Determinar método de verificación según el algoritmo
        if (algorithm.toUpperCase().includes('HMAC')) {
            result.method = 'HMAC-SHA256';
            result.isValid = this.verifyHMACSignature(payload, signature, timestamp);
        }
        else if (algorithm.toUpperCase().includes('RSA')) {
            result.method = 'RSA';
            result.isValid = this.verifyRSASignature(payload, signature, algorithm);
        }
        else {
            result.errors.push("Unsupported algorithm: ".concat(algorithm));
            return result;
        }
        if (!result.isValid) {
            result.errors.push('Signature verification failed');
        }
        return result;
    };
    /**
     * Verifica que el timestamp no sea demasiado antiguo (protección contra replay)
     * @param timestamp - Timestamp en segundos desde epoch
     * @param tolerance - Tolerancia en segundos (default: 300 = 5 minutos)
     * @returns boolean - true si el timestamp es válido
     */
    WebhookSignatureService.prototype.verifyTimestamp = function (timestamp, tolerance) {
        if (tolerance === void 0) { tolerance = 300; }
        try {
            var webhookTime = parseInt(timestamp, 10);
            var currentTime = Math.floor(Date.now() / 1000);
            var timeDiff = Math.abs(currentTime - webhookTime);
            return timeDiff <= tolerance;
        }
        catch (error) {
            console.error('Error verificando timestamp:', error);
            return false;
        }
    };
    /**
     * Comparación segura de strings para evitar timing attacks
     * @param a - String a comparar
     * @param b - String a comparar
     * @returns boolean - true si son iguales
     */
    WebhookSignatureService.prototype.secureCompare = function (a, b) {
        if (a.length !== b.length) {
            return false;
        }
        var result = 0;
        for (var i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    };
    /**
     * Obtiene el esquema RSA apropiado según el algoritmo
     * @param algorithm - Algoritmo especificado
     * @returns string - Esquema para node-rsa
     */
    WebhookSignatureService.prototype.getRSAScheme = function (algorithm) {
        switch (algorithm.toUpperCase()) {
            case 'SHA1WITHRSA':
                return 'pkcs1-sha1';
            case 'SHA256WITHRSA':
                return 'pkcs1-sha256';
            case 'SHA512WITHRSA':
                return 'pkcs1-sha512';
            default:
                return 'pkcs1-sha256'; // Default seguro
        }
    };
    /**
     * Clave pública por defecto para testing (AEAT Sandbox)
     * En producción, esta clave debe venir de variables de entorno
     */
    WebhookSignatureService.prototype.getDefaultAEATPublicKey = function () {
        return "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdefghij\nklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij\nklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij\nklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij\nklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij\nklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij\nQIDAQAB\n-----END PUBLIC KEY-----";
    };
    /**
     * Genera un hash del payload para auditoría
     * @param payload - Payload a hashear
     * @returns string - Hash SHA256 en hexadecimal
     */
    WebhookSignatureService.prototype.generatePayloadHash = function (payload) {
        return crypto_1.default.createHash('sha256').update(payload).digest('hex');
    };
    /**
     * Valida el formato de una referencia AEAT
     * @param referencia - Referencia a validar
     * @returns boolean - true si el formato es válido
     */
    WebhookSignatureService.prototype.validateAEATReference = function (referencia) {
        // Formato típico: LLNNNNNNNNNNNNNNN (2 letras + 15 números)
        var pattern = /^[A-Z]{2}\d{15}$/;
        return pattern.test(referencia);
    };
    /**
     * Valida el formato de un CSV (Código Seguro de Verificación)
     * @param csv - CSV a validar
     * @returns boolean - true si el formato es válido
     */
    WebhookSignatureService.prototype.validateCSV = function (csv) {
        // Formato típico: 16 caracteres alfanuméricos
        var pattern = /^[A-Z0-9]{16}$/;
        return pattern.test(csv);
    };
    return WebhookSignatureService;
}());
exports.WebhookSignatureService = WebhookSignatureService;
exports.default = WebhookSignatureService;
