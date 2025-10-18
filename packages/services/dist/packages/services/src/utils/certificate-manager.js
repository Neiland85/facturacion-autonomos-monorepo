"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateManager = void 0;
const fs = __importStar(require("fs"));
const forge = __importStar(require("node-forge"));
/**
 * Gestiona la carga y el parseo de certificados digitales,
 * especialmente desde archivos P12/PFX.
 */
class CertificateManager {
    /**
     * Carga un certificado y su clave privada desde un archivo P12/PFX.
     * @param p12Path - Ruta al archivo .p12 o .pfx.
     * @param password - Contraseña del archivo.
     * @returns Un objeto con los datos del certificado o null si hay un error.
     */
    static loadFromP12(p12Path, password) {
        try {
            const p12Asn1 = forge.asn1.fromDer(fs.readFileSync(p12Path, 'binary'));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
            // Encontrar la bolsa del certificado y la de la clave privada
            const certBag = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag]?.[0];
            const keyBag = p12.getBags({
                bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
            })[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];
            if (!certBag || !keyBag) {
                console.error('No se pudo encontrar el certificado o la clave privada en el archivo P12.');
                return null;
            }
            const certificate = certBag.cert;
            const privateKey = keyBag.key;
            return {
                privateKey: forge.pki.privateKeyToPem(privateKey),
                certificate: forge.pki.certificateToPem(certificate),
                publicKey: forge.pki.publicKeyToPem(certificate.publicKey),
                issuer: certificate.issuer.attributes
                    .map((attr) => `${attr.shortName}=${attr.value}`)
                    .join(', '),
                subject: certificate.subject.attributes
                    .map((attr) => `${attr.shortName}=${attr.value}`)
                    .join(', '),
                validFrom: certificate.validity.notBefore,
                validTo: certificate.validity.notAfter,
            };
        }
        catch (error) {
            console.error('Error al cargar el certificado P12:', error);
            return null;
        }
    }
}
exports.CertificateManager = CertificateManager;
