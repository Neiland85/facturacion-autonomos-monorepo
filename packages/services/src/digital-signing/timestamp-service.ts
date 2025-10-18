import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export class TimestampError extends Error {
  constructor(
    public code:
      | 'TSA_UNAVAILABLE'
      | 'INVALID_RESPONSE'
      | 'TIMEOUT'
      | 'INVALID_XML',
    message: string
  ) {
    super(message);
    this.name = 'TimestampError';
  }
}

export interface TimestampServiceConfig {
  tsaUrl: string;
  timeout?: number;
  username?: string;
  password?: string;
  enableStub?: boolean;
}

/**
 * Servicio de sellado de tiempo RFC 3161 para firmas XML digitales.
 * Proporciona integración con servidores TSA (Time Stamping Authority).
 */
export class TimestampService {
  private config: Required<TimestampServiceConfig>;
  private axiosInstance: AxiosInstance;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor(config: TimestampServiceConfig) {
    this.config = {
      tsaUrl: config.tsaUrl,
      timeout: config.timeout ?? 30000,
      username: config.username ?? '',
      password: config.password ?? '',
      enableStub: config.enableStub ?? false,
    };

    // Crear instancia axios para comunicación con TSA
    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/timestamp-query',
        'Accept': 'application/timestamp-reply',
      },
    });

    // Agregar autenticación básica si está configurada
    if (this.config.username && this.config.password) {
      const auth = Buffer.from(
        `${this.config.username}:${this.config.password}`
      ).toString('base64');
      this.axiosInstance.defaults.headers.common['Authorization'] =
        `Basic ${auth}`;
    }
  }

  /**
   * Añade timestamp RFC 3161 a un XML firmado
   */
  public async addTimestamp(signedXml: string): Promise<string> {
    try {
      // Si está en modo stub, usar timestamp simulado
      if (this.config.enableStub) {
        console.log('⏰ Usando timestamp stub (modo desarrollo)');
        return this.addStubTimestamp(signedXml);
      }

      // Validar que el XML contiene una firma
      if (!signedXml.includes('<ds:Signature>')) {
        throw new TimestampError(
          'INVALID_XML',
          'XML no contiene firma digital'
        );
      }

      console.log('⏰ Solicitando timestamp RFC 3161 a TSA...');

      // Extraer el valor de firma del XML
      const signatureValue = this.extractSignatureValue(signedXml);
      if (!signatureValue) {
        throw new TimestampError(
          'INVALID_XML',
          'No se pudo extraer valor de firma del XML'
        );
      }

      // Calcular hash SHA-256 del valor de firma
      const messageImprint = crypto
        .createHash('sha256')
        .update(signatureValue, 'base64')
        .digest();

      // Realizar petición con retry
      let timestamp = null;
      for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
        try {
          timestamp = await this.requestTimestamp(messageImprint);
          break; // Éxito, salir del loop
        } catch (error) {
          if (attempt < this.MAX_RETRIES - 1) {
            const delayMs = this.RETRY_DELAY_MS * Math.pow(2, attempt);
            console.warn(
              `⚠️ Intento ${attempt + 1}/${this.MAX_RETRIES} fallido, reintentando en ${delayMs}ms...`
            );
            await this.delay(delayMs);
          } else {
            throw error;
          }
        }
      }

      if (!timestamp) {
        throw new TimestampError(
          'TSA_UNAVAILABLE',
          'No se pudo obtener timestamp de TSA'
        );
      }

      // Incrustrar timestamp en XML
      const timestampedXml = this.embedTimestampInXml(
        signedXml,
        timestamp.token,
        timestamp.timestamp
      );

      console.log('✅ Timestamp añadido correctamente');
      return timestampedXml;
    } catch (error) {
      if (error instanceof TimestampError) {
        console.error(`❌ Error de timestamp (${error.code}): ${error.message}`);
        // Retornar XML sin timestamp como degradación graceful
        console.warn('⚠️ Retornando XML sin timestamp');
        return signedXml;
      }

      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error inesperado al añadir timestamp: ${msg}`);
      return signedXml;
    }
  }

  /**
   * Solicita timestamp a la TSA
   */
  private async requestTimestamp(
    messageImprint: Buffer
  ): Promise<{ timestamp: Date; token: string }> {
    try {
      console.log(`📤 Enviando petición de timestamp a ${this.config.tsaUrl}...`);

      // Crear petición RFC 3161 simplificada
      const tsRequest = this.createTimestampRequest(messageImprint);

      // Enviar petición a TSA
      const response = await this.axiosInstance.post(
        this.config.tsaUrl,
        tsRequest,
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/timestamp-query',
          },
        }
      );

      if (response.status !== 200) {
        throw new TimestampError(
          'INVALID_RESPONSE',
          `TSA retornó status ${response.status}`
        );
      }

      // Parsear respuesta
      const tsResponse = Buffer.from(response.data);
      const parsed = this.parseTimestampResponse(tsResponse);

      console.log(
        `✅ Timestamp recibido: ${parsed.timestamp.toISOString()}`
      );
      return parsed;
    } catch (error) {
      if (error instanceof TimestampError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new TimestampError('TIMEOUT', 'Timeout conectando con TSA');
        }
        if (error.code === 'ECONNREFUSED') {
          throw new TimestampError(
            'TSA_UNAVAILABLE',
            'No se pudo conectar con TSA'
          );
        }
        throw new TimestampError(
          'TSA_UNAVAILABLE',
          `Error de conexión con TSA: ${error.message}`
        );
      }

      const msg = error instanceof Error ? error.message : String(error);
      throw new TimestampError('INVALID_RESPONSE', `Error procesando respuesta TSA: ${msg}`);
    }
  }

  /**
   * Crea petición RFC 3161 (versión simplificada)
   */
  private createTimestampRequest(messageImprint: Buffer): Buffer {
    // Para MVP: crear petición simplificada con solo el hash
    // En producción, esto debería ser una petición ASN.1 completa
    console.log('🔨 Generando petición RFC 3161...');

    // Incluir nonce para replay protection
    const nonce = crypto.randomBytes(8);

    // Combinar: versión (1 byte) + algoritmo (4 bytes) + hash + nonce
    // Esto es una versión simplificada; el formato completo sería ASN.1
    const request = Buffer.concat([
      Buffer.from([0x01]), // Versión 1
      Buffer.from([0x02, 0x09]), // SHA-256 OID simplificado
      messageImprint,
      nonce,
    ]);

    return request;
  }

  /**
   * Parsea respuesta RFC 3161 (versión simplificada)
   */
  private parseTimestampResponse(
    response: Buffer
  ): { timestamp: Date; token: string } {
    console.log('🔍 Parseando respuesta RFC 3161...');

    // Validar longitud mínima
    if (response.length < 16) {
      throw new TimestampError(
        'INVALID_RESPONSE',
        'Respuesta TSA demasiado corta'
      );
    }

    // Extraer timestamp (últimos 8 bytes como timestamp Unix)
    const timestamp64 = response.readBigInt64BE(response.length - 8);
    const timestampMs = Number(timestamp64) * 1000;

    if (timestampMs <= 0 || timestampMs > Date.now() + 60000) {
      // Permitir 1 minuto de desfase
      throw new TimestampError(
        'INVALID_RESPONSE',
        'Timestamp inválido en respuesta TSA'
      );
    }

    const timestamp = new Date(timestampMs);

    // Token es toda la respuesta codificada en base64
    const token = response.toString('base64');

    return { timestamp, token };
  }

  /**
   * Incrusta timestamp en XML firmado (formato XAdES)
   */
  private embedTimestampInXml(
    signedXml: string,
    timestampToken: string,
    timestamp: Date
  ): string {
    console.log('📝 Incrustando timestamp en XML...');

    // Construir estructura XAdES
    const signingTime = timestamp.toISOString();
    const xadesTimestamp = `
    <xades:SigningTime>${signingTime}</xades:SigningTime>
    <xades:TimeStampToken>
      <TimeStampToken>${timestampToken}</TimeStampToken>
    </xades:TimeStampToken>`;

    // Encontrar el final de la firma
    const signatureEndIndex = signedXml.lastIndexOf('</ds:Signature>');
    if (signatureEndIndex === -1) {
      console.warn('⚠️ No se encontró cierre de Signature, retornando XML sin timestamp');
      return signedXml;
    }

    // Insertar timestamp antes del cierre
    const timestampedXml =
      signedXml.substring(0, signatureEndIndex) +
      xadesTimestamp +
      signedXml.substring(signatureEndIndex);

    return timestampedXml;
  }

  /**
   * Extrae el valor de firma del XML
   */
  private extractSignatureValue(xml: string): string | null {
    const match = /<ds:SignatureValue[^>]*>([\s\S]*?)<\/ds:SignatureValue>/.exec(
      xml
    );
    return match && match[1] ? match[1].trim() : null;
  }

  /**
   * Añade timestamp simulado para desarrollo
   */
  private addStubTimestamp(signedXml: string): string {
    console.log('⏰ Generando timestamp stub para desarrollo...');

    const now = new Date();
    const signingTime = now.toISOString();
    const stubToken = Buffer.from(
      `STUB-${now.getTime()}-${Math.random()}`
    ).toString('base64');

    const xadesTimestamp = `
    <xades:SigningTime>${signingTime}</xades:SigningTime>
    <xades:TimeStampToken>
      <TimeStampToken>${stubToken}</TimeStampToken>
    </xades:TimeStampToken>`;

    // Encontrar el final de la firma
    const signatureEndIndex = signedXml.lastIndexOf('</ds:Signature>');
    if (signatureEndIndex === -1) {
      return signedXml;
    }

    const timestampedXml =
      signedXml.substring(0, signatureEndIndex) +
      xadesTimestamp +
      signedXml.substring(signatureEndIndex);

    return timestampedXml;
  }

  /**
   * Delay con control preciso
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
