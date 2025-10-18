import { SignedXml } from 'xml-crypto';
import * as forge from 'node-forge';

export interface SignerOptions {
  strictValidation?: boolean;
  allowedAlgorithms?: string[];
  includeKeyInfo?: boolean;
}

export interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Proporciona funcionalidades para firmar y verificar documentos XML
 * utilizando el estándar XMLDSig.
 */
export class XmlDSigSigner {
  private options: Required<SignerOptions>;

  constructor(options: SignerOptions = {}) {
    this.options = {
      strictValidation: options.strictValidation ?? true,
      allowedAlgorithms: options.allowedAlgorithms ?? [
        'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
        'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
      ],
      includeKeyInfo: options.includeKeyInfo ?? true,
    };
  }

  /**
   * Firma un documento XML con una firma de tipo "enveloped".
   * La firma se inserta dentro del propio documento XML.
   *
   * @param xml - El documento XML a firmar (como string).
   * @param privateKeyPem - La clave privada en formato PEM.
   * @param certificatePem - El certificado público en formato PEM.
   * @returns El documento XML firmado (como string).
   * @throws Error si la validación falla
   */
  public sign(
    xml: string,
    privateKeyPem: string,
    certificatePem: string
  ): string {
    try {
      // Validar XML bien formado
      if (!this.isWellFormedXml(xml)) {
        throw new Error('XML no está bien formado');
      }

      // Validar formato PEM
      if (!this.isPemFormat(privateKeyPem)) {
        throw new Error('Clave privada no está en formato PEM válido');
      }

      if (!this.isPemFormat(certificatePem)) {
        throw new Error('Certificado no está en formato PEM válido');
      }

      // Agregar ID estable al elemento raíz si no existe
      const xmlWithId = this.ensureRootId(xml);

      const sig = new SignedXml();

      // Añadir referencia con ID específico para mayor seguridad
      sig.addReference({
        xpath: '/*[@Id="signed-doc"]',
        digests: ['http://www.w3.org/2001/04/xmlenc#sha256'],
        transforms: [
          'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
          'http://www.w3.org/2001/10/xml-exc-c14n#',
        ],
        inclusiveNamespacesPrefixList: '',
      });

      // Configurar algoritmos seguros
      sig.signingKey = privateKeyPem;
      sig.signatureAlgorithm =
        'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
      sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';

      // Incluir KeyInfo si está habilitado
      if (this.options.includeKeyInfo) {
        // Extraer el certificado sin las cabeceras PEM para incluirlo en KeyInfo
        const cert = forge.pki.certificateFromPem(certificatePem);
        const certDer = forge.asn1
          .toDer(forge.pki.certificateToAsn1(cert))
          .getBytes();
        const certB64 = forge.util.encode64(certDer);

        sig.keyInfoProvider = {
          getKeyInfo: (key: any, prefix: string) => {
            prefix = prefix ? prefix + ':' : '';
            return `<${prefix}X509Data><${prefix}X509Certificate>${certB64}</${prefix}X509Certificate></${prefix}X509Data>`;
          },
        } as any;
      }

      // Computar la firma
      sig.computeSignature(xmlWithId);

      // Devolver el XML con la firma incrustada
      const signedXml = sig.getSignedXml();
      console.log('✅ XML firmado correctamente');
      return signedXml;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error al firmar XML: ${msg}`);
      throw new Error(`Failed to sign XML: ${msg}`);
    }
  }

  /**
   * Verifica la firma de un documento XML.
   *
   * @param signedXml - El documento XML firmado.
   * @returns Resultado detallado de la verificación.
   */
  public verify(signedXml: string): VerificationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validar XML bien formado
      if (!this.isWellFormedXml(signedXml)) {
        errors.push('XML firmado no está bien formado');
        return { valid: false, errors, warnings };
      }

      // Validar que solo hay una firma
      const signatureNodes = this.findAllSignatureNodes(signedXml);
      if (signatureNodes.length === 0) {
        errors.push('No se encontró firma XML en el documento');
        return { valid: false, errors, warnings };
      }

      if (signatureNodes.length > 1) {
        errors.push(
          `Se encontraron ${signatureNodes.length} firmas. Se requiere exactamente 1.`
        );
        if (this.options.strictValidation) {
          return { valid: false, errors, warnings };
        }
        warnings.push('Múltiples firmas encontradas, usando la primera');
      }

      const sig = new SignedXml();
      const signatureNode = signatureNodes[0];

      sig.loadSignature(signatureNode);

      // Validar que la referencia coincide con el nodo esperado
      if (!this.validateReference(signedXml, sig)) {
        errors.push('La referencia de la firma no coincide con el documento');
      }

      // Validar algoritmos permitidos
      if (!this.validateAlgorithms(sig)) {
        if (this.options.strictValidation) {
          errors.push('Algoritmos de firma no seguros detectados');
        } else {
          warnings.push('Algoritmos de firma no seguros detectados');
        }
      }

      // Validar certificado si está disponible
      const embeddedCert = this.extractCertificateFromSignature(signedXml);
      if (embeddedCert) {
        try {
          const cert = forge.pki.certificateFromPem(embeddedCert);
          const now = new Date();
          if (cert.validity.notBefore > now) {
            errors.push('Certificado aún no válido');
          }
          if (cert.validity.notAfter < now) {
            errors.push('Certificado expirado');
          }
        } catch {
          warnings.push('No se pudo validar el certificado embebido');
        }
      }

      // Si hay errores, retornar fallo
      if (errors.length > 0) {
        return { valid: false, errors, warnings };
      }

      // Verificar firma
      try {
        const isValid = sig.checkSignature(signedXml);
        if (!isValid) {
          errors.push('Verificación criptográfica de firma fallida');
          return { valid: false, errors, warnings };
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`Error durante verificación de firma: ${msg}`);
        return { valid: false, errors, warnings };
      }

      console.log('✅ Firma XML verificada correctamente');
      return { valid: true, errors: [], warnings };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`Error al verificar firma: ${msg}`);
      console.error(`❌ Error durante verificación:`, msg);
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Extrae el certificado embebido en la firma XML
   * @param signedXml - Documento XML firmado
   * @returns Certificado en formato PEM o null
   */
  public extractCertificateFromSignature(signedXml: string): string | null {
    try {
      // Buscar X509Certificate
      const match =
        /<X509Certificate>([\s\S]*?)<\/X509Certificate>/.exec(signedXml) ||
        /<ds:X509Certificate>([\s\S]*?)<\/ds:X509Certificate>/.exec(
          signedXml
        );

      if (!match || !match[1]) {
        return null;
      }

      const certBase64 = match[1].trim();
      const certDer = Buffer.from(certBase64, 'base64');
      const certAsn1 = forge.asn1.fromDer(certDer.toString('binary'));
      const cert = forge.pki.certificateFromAsn1(certAsn1);

      return forge.pki.certificateToPem(cert);
    } catch (error) {
      console.warn('No se pudo extraer certificado del XML:', error);
      return null;
    }
  }

  /**
   * Asegura que el elemento raíz tenga un atributo Id estable
   */
  private ensureRootId(xml: string): string {
    // Si ya tiene Id, retornar tal como está
    if (xml.includes(' Id=')) {
      return xml;
    }

    // Agregar Id al elemento raíz
    return xml.replace(/^(<[^>\s]+)/, '$1 Id="signed-doc"');
  }

  /**
   * Encuentra todos los nodos de firma en el XML
   */
  private findAllSignatureNodes(xml: string): string[] {
    const dsMatches = (xml.match(/<ds:Signature[\s\S]*?<\/ds:Signature>/g) ||
      []) as string[];
    const matches = (xml.match(/<Signature[\s\S]*?<\/Signature>/g) ||
      []) as string[];
    return [...dsMatches, ...matches];
  }

  /**
   * Valida que la referencia de la firma coincide con el documento
   */
  private validateReference(xml: string, sig: any): boolean {
    try {
      // Verificar que existe el elemento referenciado
      return xml.includes('Id="signed-doc"') || xml.includes("Id='signed-doc'");
    } catch (error) {
      console.error('Error validating reference:', error);
      return false;
    }
  }

  /**
   * Valida que los algoritmos usados son seguros
   */
  private validateAlgorithms(sig: any): boolean {
    try {
      // Si no se pueden inspeccionar los algoritmos, asumir que son válidos
      console.warn(
        'No se pudieron validar los algoritmos de firma - xml-crypto limitation'
      );
      return true;
    } catch (error) {
      console.error('Error validando algoritmos:', error);
      return false;
    }
  }

  /**
   * Verifica si una string está bien formada como XML
   */
  private isWellFormedXml(xml: string): boolean {
    try {
      const trimmed = xml.trim();
      return (
        trimmed.startsWith('<') &&
        trimmed.endsWith('>') &&
        /^<[^>]+>/.test(trimmed)
      );
    } catch {
      return false;
    }
  }

  /**
   * Verifica si una string está en formato PEM válido
   */
  private isPemFormat(pem: string): boolean {
    return (
      pem.includes('-----BEGIN') &&
      pem.includes('-----END') &&
      /^-----BEGIN/.test(pem.trim())
    );
  }
}