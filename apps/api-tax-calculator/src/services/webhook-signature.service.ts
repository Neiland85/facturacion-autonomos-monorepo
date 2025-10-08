import crypto from "crypto";
import CryptoJS from "crypto-js";
import NodeRSA from "node-rsa";

/**
 * Servicio para verificación de firmas digitales de webhooks AEAT
 * Implementa verificación HMAC-SHA256 y RSA según especificaciones AEAT
 */
export class WebhookSignatureService {
  private readonly aeatPublicKey: string;
  private readonly webhookSecret: string;

  constructor() {
    // Secret compartido para HMAC - simplificado para uso básico
    this.webhookSecret = "basic-webhook-secret";
    // Clave pública RSA de AEAT (debería venir de variable de entorno en producción)
    this.aeatPublicKey = process.env.AEAT_PUBLIC_KEY ?? "";
  }

  /**
   * Verifica la firma HMAC-SHA256 de un webhook
   * @param payload - Payload del webhook como string
   * @param signature - Firma recibida en el header
   * @param timestamp - Timestamp del webhook
   * @returns boolean - true si la firma es válida
   */
  public verifyHMACSignature(
    payload: string,
    signature: string,
    timestamp?: string
  ): boolean {
    try {
      // Construir string a firmar (payload + timestamp si existe)
      const stringToSign = timestamp ? `${payload}.${timestamp}` : payload;

      // Calcular HMAC-SHA256
      const expectedSignature = CryptoJS.HmacSHA256(
        stringToSign,
        this.webhookSecret
      );
      const expectedSignatureHex = `sha256=${expectedSignature.toString(CryptoJS.enc.Hex)}`;

      // Comparación segura contra timing attacks
      return this.secureCompare(signature, expectedSignatureHex);
    } catch (error) {
      console.error("Error verificando firma HMAC:", error);
      return false;
    }
  }

  /**
   * Verifica la firma RSA de un webhook AEAT
   * @param payload - Payload del webhook
   * @param signature - Firma RSA en base64
   * @param algorithm - Algoritmo usado (default: SHA256withRSA)
   * @returns boolean - true si la firma es válida
   */
  public verifyRSASignature(
    payload: string,
    signature: string,
    algorithm: string = "SHA256withRSA"
  ): boolean {
    try {
      const key = new NodeRSA(this.aeatPublicKey, "public");

      // Configurar esquema de firma según algoritmo
      const scheme = this.getRSAScheme(algorithm);
      key.setOptions({
        signingScheme: scheme as "pkcs1-sha1" | "pkcs1-sha256" | "pkcs1-sha512",
      });

      // Verificar firma
      const signatureBuffer = Buffer.from(signature, "base64");
      return key.verify(payload, signatureBuffer);
    } catch (error) {
      console.error("Error verificando firma RSA:", error);
      return false;
    }
  }

  /**
   * Verifica la integridad del payload usando múltiples métodos
   * @param payload - Payload del webhook
   * @param headers - Headers HTTP del webhook
   * @returns VerificationResult - Resultado detallado de la verificación
   */
  public verifyWebhookIntegrity(
    payload: string,
    headers: Record<string, string>
  ): WebhookVerificationResult {
    const result: WebhookVerificationResult = {
      isValid: false,
      method: "none",
      errors: [],
    };

    // Extraer headers relevantes
    const signature = headers["x-aeat-signature"] ?? headers["x-signature"];
    const timestamp = headers["x-aeat-timestamp"] ?? headers["x-timestamp"];
    const algorithm = headers["x-aeat-algorithm"] ?? "HMAC-SHA256";

    if (!signature) {
      result.errors.push("Signature header missing");
      return result;
    }

    // Verificar timestamp si está presente (evitar replay attacks)
    if (timestamp && !this.verifyTimestamp(timestamp)) {
      result.errors.push("Timestamp verification failed");
      return result;
    }

    // Determinar método de verificación según el algoritmo
    if (algorithm.toUpperCase().includes("HMAC")) {
      result.method = "HMAC-SHA256";
      result.isValid = this.verifyHMACSignature(payload, signature, timestamp);
    } else if (algorithm.toUpperCase().includes("RSA")) {
      result.method = "RSA";
      result.isValid = this.verifyRSASignature(payload, signature, algorithm);
    } else {
      result.errors.push(`Unsupported algorithm: ${algorithm}`);
      return result;
    }

    if (!result.isValid) {
      result.errors.push("Signature verification failed");
    }

    return result;
  }

  /**
   * Verifica que el timestamp no sea demasiado antiguo (protección contra replay)
   * @param timestamp - Timestamp en segundos desde epoch
   * @param tolerance - Tolerancia en segundos (default: 300 = 5 minutos)
   * @returns boolean - true si el timestamp es válido
   */
  private verifyTimestamp(timestamp: string, tolerance: number = 300): boolean {
    try {
      const webhookTime = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeDiff = Math.abs(currentTime - webhookTime);

      return timeDiff <= tolerance;
    } catch (error) {
      console.error("Error verificando timestamp:", error);
      return false;
    }
  }

  /**
   * Comparación segura de strings para evitar timing attacks
   * @param a - String a comparar
   * @param b - String a comparar
   * @returns boolean - true si son iguales
   */
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Obtiene el esquema RSA apropiado según el algoritmo
   * @param algorithm - Algoritmo especificado
   * @returns string - Esquema para node-rsa
   */
  private getRSAScheme(algorithm: string): string {
    switch (algorithm.toUpperCase()) {
      case "SHA1WITHRSA":
        return "pkcs1-sha1";
      case "SHA256WITHRSA":
        return "pkcs1-sha256";
      case "SHA512WITHRSA":
        return "pkcs1-sha512";
      default:
        return "pkcs1-sha256"; // Default seguro
    }
  }

  /**
   * Clave pública por defecto para testing (AEAT Sandbox)
   * En producción, esta clave debe venir de variables de entorno
   */
  private getDefaultAEATPublicKey(): string {
    return `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdefghij
klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij
klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij
klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij
klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij
klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij
QIDAQAB
-----END PUBLIC KEY-----`;
  }

  /**
   * Genera un hash del payload para auditoría
   * @param payload - Payload a hashear
   * @returns string - Hash SHA256 en hexadecimal
   */
  public generatePayloadHash(payload: string): string {
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  /**
   * Valida el formato de una referencia AEAT
   * @param referencia - Referencia a validar
   * @returns boolean - true si el formato es válido
   */
  public validateAEATReference(referencia: string): boolean {
    // Formato típico: LLNNNNNNNNNNNNNNN (2 letras + 15 números)
    const pattern = /^[A-Z]{2}\d{15}$/;
    return pattern.test(referencia);
  }

  /**
   * Valida el formato de un CSV (Código Seguro de Verificación)
   * @param csv - CSV a validar
   * @returns boolean - true si el formato es válido
   */
  public validateCSV(csv: string): boolean {
    // Formato típico: 16 caracteres alfanuméricos
    const pattern = /^[A-Z0-9]{16}$/;
    return pattern.test(csv);
  }
}

// Tipos para el resultado de verificación
export interface WebhookVerificationResult {
  isValid: boolean;
  method: "HMAC-SHA256" | "RSA" | "none";
  errors: string[];
  timestamp?: string;
  algorithm?: string;
}

// Tipos para el payload de notificaciones AEAT
export interface AEATWebhookPayload {
  tipo: string;
  modelo: string;
  ejercicio: number;
  periodo: string;
  referencia: string;
  csv?: string;
  estado: string;
  fechaEvento: string;
  datos?: {
    importeDevolucion?: number;
    importeIngresar?: number;
    numeroJustificante?: string;
    motivoRechazo?: string;
    subsanaciones?: string[];
  };
  metadatos?: {
    version: string;
    origen: string;
  };
}

export default WebhookSignatureService;
