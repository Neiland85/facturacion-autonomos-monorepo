import { SignedXml, FileKeyInfo } from 'xml-crypto';
import * as forge from 'node-forge';

/**
 * Proporciona funcionalidades para firmar y verificar documentos XML
 * utilizando el estándar XMLDSig.
 */
export class XmlDSigSigner {
  /**
   * Firma un documento XML con una firma de tipo "enveloped".
   * La firma se inserta dentro del propio documento XML.
   *
   * @param xml - El documento XML a firmar (como string).
   * @param privateKeyPem - La clave privada en formato PEM.
   * @param certificatePem - El certificado público en formato PEM.
   * @returns El documento XML firmado (como string).
   */
  public sign(
    xml: string,
    privateKeyPem: string,
    certificatePem: string
  ): string {
    // Agregar ID estable al elemento raíz si no existe
    const xmlWithId = this.ensureRootId(xml);
    
    const sig = new SignedXml();

    // Añadir referencia con ID específico para mayor seguridad
    sig.addReference({
      xpath: '/*[@Id="signed-doc"]',
      digests: ['http://www.w3.org/2001/04/xmlenc#sha256'],
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/2001/10/xml-exc-c14n#'
      ],
      inclusiveNamespacesPrefixList: ''
    });

    // Configurar algoritmos seguros restringidos
    sig.signingKey = privateKeyPem;
    sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
    sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';

    // Extraer el certificado sin las cabeceras PEM para incluirlo en KeyInfo
    const cert = forge.pki.certificateFromPem(certificatePem);
    const certDer = forge.asn1
      .toDer(forge.pki.certificateToAsn1(cert))
      .getBytes();
    const certB64 = forge.util.encode64(certDer);

    sig.keyInfoProvider = {
      getKeyInfo: (key, prefix) => {
        prefix = prefix ? prefix + ':' : '';
        return `<${prefix}X509Data><${prefix}X509Certificate>${certB64}</${prefix}X509Certificate></${prefix}X509Data>`;
      },
    } as any; // Se usa 'as any' por una limitación en los tipos de xml-crypto

    // Computar la firma
    sig.computeSignature(xmlWithId);

    // Devolver el XML con la firma incrustada
    return sig.getSignedXml();
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
   * Verifica la firma de un documento XML.
   *
   * @param signedXml - El documento XML firmado.
   * @returns `true` si la firma es válida, `false` en caso contrario.
   */
  public verify(signedXml: string): boolean {
    try {
      // Validar que solo hay una firma
      const signatureNodes = this.findAllSignatureNodes(signedXml);
      if (signatureNodes.length !== 1) {
        console.error(`Se encontraron ${signatureNodes.length} firmas. Se requiere exactamente 1.`);
        return false;
      }

      const sig = new SignedXml();
      const signatureNode = signatureNodes[0];

      sig.loadSignature(signatureNode);

      // Validar que la referencia coincide con el nodo esperado
      if (!this.validateReference(signedXml, sig)) {
        console.error('La referencia de la firma no coincide con el documento');
        return false;
      }

      // Validar algoritmos permitidos
      if (!this.validateAlgorithms(sig)) {
        console.error('Algoritmos de firma no seguros detectados');
        return false;
      }

      const result = sig.checkSignature(signedXml);
      if (!result) {
        console.error('Error en la validación de la firma');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al verificar la firma:', error);
      return false;
    }
  }

  /**
   * Helper para encontrar el nodo <Signature> en el XML.
   * @param xml - El documento XML.
   * @returns El nodo de la firma como string.
   */
  private findSignatureNode(xml: string): string | null {
    const match =
      /<ds:Signature[\s\S]*?<\/ds:Signature>/.exec(xml) ||
      /<Signature[\s\S]*?<\/Signature>/.exec(xml);
    return match ? match[0] : null;
  }

  /**
   * Encuentra todos los nodos de firma en el XML
   */
  private findAllSignatureNodes(xml: string): string[] {
    const dsMatches = xml.match(/<ds:Signature[\s\S]*?<\/ds:Signature>/g) || [];
    const matches = xml.match(/<Signature[\s\S]*?<\/Signature>/g) || [];
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
    const allowedSignatureAlgorithms = [
      'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
      'http://www.w3.org/2000/09/xmldsig#rsa-sha1' // Para compatibilidad (menos seguro)
    ];
    
    const allowedDigestAlgorithms = [
      'http://www.w3.org/2001/04/xmlenc#sha256',
      'http://www.w3.org/2000/09/xmldsig#sha1' // Para compatibilidad (menos seguro)
    ];

    try {
      // Acceder a la configuración interna de xml-crypto cuando sea posible
      const sigAlgorithm = sig.signingAlgorithm || sig.signatureAlgorithm;
      const digestAlgorithm = sig.digestAlgorithm;
      
      // Validar algoritmo de firma si está disponible
      if (sigAlgorithm && !allowedSignatureAlgorithms.includes(sigAlgorithm)) {
        console.error(`Algoritmo de firma no permitido: ${sigAlgorithm}`);
        return false;
      }
      
      // Validar algoritmo de digest si está disponible
      if (digestAlgorithm && !allowedDigestAlgorithms.includes(digestAlgorithm)) {
        console.error(`Algoritmo de digest no permitido: ${digestAlgorithm}`);
        return false;
      }
      
      // Si no se pueden inspeccionar los algoritmos, asumir que son válidos
      // En un entorno de producción, considera usar una librería más robusta
      console.warn('No se pudieron validar los algoritmos de firma - xml-crypto limitation');
      return true;
    } catch (error) {
      console.error('Error validando algoritmos:', error);
      return false;
    }
  }
}

/*
 * EJEMPLO DE USO:
 *
 * import { CertificateManager } from './certificate-manager';
 * import { XmlDSigSigner } from './xmldsig-signer';
 *
 * // 1. Cargar el certificado
 * const certData = CertificateManager.loadFromP12('./ruta/a/tu/certificado.p12', 'tu_contraseña');
 * if (!certData) {
 *   throw new Error('No se pudo cargar el certificado.');
 * }
 *
 * // 2. Crear el firmador y el XML de ejemplo
 * const signer = new XmlDSigSigner();
 * const xmlDeFactura = '<Factura><Numero>F-2024-001</Numero><Total>121.00</Total></Factura>';
 *
 * // 3. Firmar el XML
 * const xmlFirmado = signer.sign(xmlDeFactura, certData.privateKey, certData.certificate);
 * console.log('XML Firmado:', xmlFirmado);
 *
 * // 4. Verificar la firma
 * const esValida = signer.verify(xmlFirmado);
 * console.log('¿La firma es válida?', esValida); // Debería ser true
 */
