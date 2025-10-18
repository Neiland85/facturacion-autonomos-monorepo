import * as fs from 'fs';
import * as forge from 'node-forge';
import * as crypto from 'crypto';

export interface CertificateData {
  privateKey: string; // PEM format
  certificate: string; // PEM format
  publicKey: string; // PEM format
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Gestiona la carga y el parseo de certificados digitales,
 * especialmente desde archivos P12/PFX, con validación y caché.
 */
export class CertificateManager {
  // Cache de certificados cargados (almacenamiento en memoria con TTL)
  private static readonly certificateCache = new Map<
    string,
    { data: CertificateData; loadedAt: Date }
  >();
  private static readonly CACHE_TTL_MS = 3600000; // 1 hora

  /**
   * Carga un certificado y su clave privada desde un archivo P12/PFX.
   * Utiliza caché si el certificado fue cargado recientemente.
   * @param p12Path - Ruta al archivo .p12 o .pfx.
   * @param password - Contraseña del archivo.
   * @returns Un objeto con los datos del certificado o null si hay un error.
   */
  public static loadFromP12(
    p12Path: string,
    password: string
  ): CertificateData | null {
    try {
      // Crear clave de caché
      const cacheKey = this.getCacheKey(p12Path, password);

      // Verificar caché
      const cached = this.certificateCache.get(cacheKey);
      if (cached) {
        const ageMs = Date.now() - cached.loadedAt.getTime();
        if (ageMs < this.CACHE_TTL_MS) {
          console.log(`✅ Certificado cargado desde caché (${p12Path})`);
          return cached.data;
        }
        // Caché expirado, eliminar
        this.certificateCache.delete(cacheKey);
      }

      // Cargar desde archivo
      console.log(`📜 Cargando certificado P12: ${p12Path}`);
      const p12Asn1 = forge.asn1.fromDer(fs.readFileSync(p12Path, 'binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

      // Encontrar la bolsa del certificado y la de la clave privada
      const certBag = p12.getBags({ bagType: forge.pki.oids.certBag })[
        forge.pki.oids.certBag
      ]?.[0];

      const keyBag = p12.getBags({
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
      })[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

      if (!certBag || !keyBag) {
        console.error(
          'No se pudo encontrar el certificado o la clave privada en el archivo P12.'
        );
        return null;
      }

      const certificate = certBag.cert as forge.pki.Certificate;
      const privateKey = keyBag.key as forge.pki.PrivateKey;

      const certData: CertificateData = {
        privateKey: forge.pki.privateKeyToPem(privateKey),
        certificate: forge.pki.certificateToPem(certificate),
        publicKey: forge.pki.publicKeyToPem(
          certificate.publicKey as forge.pki.rsa.PublicKey
        ),
        issuer: certificate.issuer.attributes
          .map((attr: any) => `${attr.shortName}=${attr.value}`)
          .join(', '),
        subject: certificate.subject.attributes
          .map((attr: any) => `${attr.shortName}=${attr.value}`)
          .join(', '),
        validFrom: certificate.validity.notBefore,
        validTo: certificate.validity.notAfter,
      };

      // Guardar en caché
      this.certificateCache.set(cacheKey, {
        data: certData,
        loadedAt: new Date(),
      });

      console.log(
        `✅ Certificado P12 cargado correctamente: ${this.getCertificateInfo(certData)}`
      );
      return certData;
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Error desconocido al cargar P12';
      console.error(`❌ Error al cargar el certificado P12 (${p12Path}):`, errorMsg);
      return null;
    }
  }

  /**
   * Carga certificado y clave privada desde archivos PEM separados.
   * @param certPath - Ruta al archivo de certificado PEM
   * @param keyPath - Ruta al archivo de clave privada PEM
   * @returns Un objeto con los datos del certificado o null si hay un error
   */
  public static loadFromPEM(
    certPath: string,
    keyPath: string
  ): CertificateData | null {
    try {
      console.log(`📜 Cargando certificados PEM: ${certPath}`);

      // Leer archivos
      const certPem = fs.readFileSync(certPath, 'utf-8');
      const keyPem = fs.readFileSync(keyPath, 'utf-8');

      // Parsear con node-forge
      const cert = forge.pki.certificateFromPem(certPem);
      const privateKey = forge.pki.privateKeyFromPem(keyPem);

      const certData: CertificateData = {
        privateKey: keyPem,
        certificate: certPem,
        publicKey: forge.pki.publicKeyToPem(
          cert.publicKey as forge.pki.rsa.PublicKey
        ),
        issuer: cert.issuer.attributes
          .map((attr: any) => `${attr.shortName}=${attr.value}`)
          .join(', '),
        subject: cert.subject.attributes
          .map((attr: any) => `${attr.shortName}=${attr.value}`)
          .join(', '),
        validFrom: cert.validity.notBefore,
        validTo: cert.validity.notAfter,
      };

      console.log(
        `✅ Certificados PEM cargados correctamente: ${this.getCertificateInfo(certData)}`
      );
      return certData;
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Error desconocido al cargar PEM';
      console.error(`❌ Error al cargar certificados PEM:`, errorMsg);
      return null;
    }
  }

  /**
   * Valida que un certificado sea válido y no esté expirado.
   * @param certData - Datos del certificado a validar
   * @returns Resultado de validación con lista de errores si aplica
   */
  public static validateCertificate(certData: CertificateData): ValidationResult {
    const errors: string[] = [];

    // Validar campos requeridos
    if (!certData.privateKey || certData.privateKey.length === 0) {
      errors.push('Clave privada vacía o faltante');
    }

    if (!certData.certificate || certData.certificate.length === 0) {
      errors.push('Certificado vacío o faltante');
    }

    if (!certData.publicKey || certData.publicKey.length === 0) {
      errors.push('Clave pública vacía o faltante');
    }

    // Validar formato PEM
    if (certData.privateKey && !this.isPemFormat(certData.privateKey)) {
      errors.push('Clave privada no está en formato PEM válido');
    }

    if (certData.certificate && !this.isPemFormat(certData.certificate)) {
      errors.push('Certificado no está en formato PEM válido');
    }

    // Validar fechas
    const now = new Date();
    if (certData.validFrom > now) {
      errors.push(
        `Certificado aún no válido (válido desde ${certData.validFrom.toISOString()})`
      );
    }

    if (certData.validTo < now) {
      errors.push(
        `Certificado expirado (expiró el ${certData.validTo.toISOString()})`
      );
    }

    // Validar que la clave privada sea válida
    try {
      forge.pki.privateKeyFromPem(certData.privateKey);
    } catch {
      errors.push('Clave privada no puede ser parseada');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Limpia el caché de certificados
   */
  public static clearCache(): void {
    this.certificateCache.clear();
    console.log('🧹 Caché de certificados limpiado');
  }

  /**
   * Obtiene información legible del certificado
   * @param certData - Datos del certificado
   * @returns String con información del certificado
   */
  public static getCertificateInfo(certData: CertificateData): string {
    const dateFormat = (d: Date) => d.toISOString().split('T')[0];
    return (
      `Subject: ${certData.subject.substring(0, 50)}... | ` +
      `Valid: ${dateFormat(certData.validFrom)} to ${dateFormat(certData.validTo)}`
    );
  }

  /**
   * Genera clave de caché segura para los parámetros
   */
  private static getCacheKey(p12Path: string, password: string): string {
    const combined = `${p12Path}:${password}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Verifica si una string está en formato PEM válido
   */
  private static isPemFormat(pem: string): boolean {
    return (
      pem.includes('-----BEGIN') &&
      pem.includes('-----END') &&
      /^-----BEGIN/.test(pem.trim())
    );
  }
}
