/**
 * (Placeholder) Servicio para añadir un sello de tiempo (Timestamp) a un documento.
 * En una implementación real, esto se conectaría a una Autoridad de Sellado de Tiempo (TSA).
 * 
 * ⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
 */

// Guard para prevenir uso en producción
const isProduction = process.env.NODE_ENV === 'production';

export class TimestampService {
  private tsaUrl: string;

  constructor(tsaUrl?: string) {
    // Fallar inmediatamente en producción
    if (isProduction) {
      throw new Error(
        'TimestampService es solo un stub de desarrollo y no debe usarse en producción. ' +
        'Implementar integración real con TSA para entorno productivo.'
      );
    }
    
    // URL de la TSA. Ejemplo: 'http://tsa.acme.com'
    this.tsaUrl = tsaUrl || 'http://time.certum.pl';
  }

  /**
   * Añade un sello de tiempo simulado a un documento XML ya firmado.
   * 
   * ⚠️ SOLO PARA DESARROLLO - Esta implementación NO ES VÁLIDA para producción
   *
   * NOTA: Una implementación real requeriría una librería para generar 
   * una petición de timestamp (RFC 3161), enviarla a la TSA, y luego 
   * incrustar la respuesta en el XML.
   *
   * @param signedXml - El documento XML que ya contiene una firma XMLDSig.
   * @returns El XML con un nodo de sello de tiempo (simulado).
   */
  public async addTimestamp(signedXml: string): Promise<string> {
    if (isProduction) {
      throw new Error(
        'addTimestamp no debe llamarse en producción. Usar servicio de timestamp real.'
      );
    }

    console.warn(
      '⚠️ DESARROLLO: Usando sello de tiempo simulado. NO VÁLIDO para producción.'
    );

    // Simulación: Añadir un nodo de timestamp simple dentro de la firma.
    const timestampNode = `
      <ds:Object>
        <xades:QualifyingProperties Target="#Signature">
          <xades:SignedProperties>
            <xades:SignedSignatureProperties>
              <xades:SigningTime>${new Date().toISOString()}</xades:SigningTime>
            </xades:SignedSignatureProperties>
          </xades:SignedProperties>
        </xades:QualifyingProperties>
      </ds:Object>`;

    // Insertar el nodo de timestamp antes del cierre de la etiqueta </ds:Signature>
    return signedXml.replace(
      '</ds:Signature>',
      `${timestampNode}</ds:Signature>`
    );
  }
}

/**
 * Función stub para exportar solo en desarrollo
 * En producción, esta exportación lanzará error al ser importada
 */
export const createTimestampService = (tsaUrl?: string): TimestampService => {
  if (isProduction) {
    throw new Error(
      'createTimestampService no disponible en producción. ' +
      'Implementar servicio de timestamp real.'
    );
  }
  return new TimestampService(tsaUrl);
};
