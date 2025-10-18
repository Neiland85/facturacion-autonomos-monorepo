import * as fs from 'fs';
import * as forge from 'node-forge';

export interface CertificateData {
  privateKey: string; // PEM format
  certificate: string; // PEM format
  publicKey: string; // PEM format
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
}

/**
 * Gestiona la carga y el parseo de certificados digitales,
 * especialmente desde archivos P12/PFX.
 */
export class CertificateManager {
  /**
   * Carga un certificado y su clave privada desde un archivo P12/PFX.
   * @param p12Path - Ruta al archivo .p12 o .pfx.
   * @param password - Contraseña del archivo.
   * @returns Un objeto con los datos del certificado o null si hay un error.
   */
  public static loadFromP12(
    p12Path: string,
    password: string
  ): CertificateData | null {
    try {
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

      return {
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
    } catch (error) {
      console.error('Error al cargar el certificado P12:', error);
      return null;
    }
  }
}
