import axios, { AxiosInstance } from 'axios';
import { Invoice } from '@facturacion/types';

/**
 * Configuración de acceso al servicio SII de la AEAT.
 * Las credenciales deben suministrarse de forma segura (variables de entorno, vault, etc.).
 */
export interface SIIConfig {
  /** URL del endpoint SOAP */
  endpoint: string;
  /** Usuario/certificado */
  username: string;
  /** Contraseña/clave */
  password: string;
  /** Timeout en milisegundos (opcional, por defecto 10 s) */
  timeout?: number;
}

/**
 * Servicio para el Suministro Inmediato de Información (SII).
 *
 * NOTA: La generación de XML se simplifica a un template literal. Para producción se
 * recomienda usar xmlbuilder2 o un generador a partir del XSD oficial.
 */
export class SIIService {
  private readonly http: AxiosInstance;

  constructor(private readonly config: SIIConfig) {
    this.http = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout ?? 10_000,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'http://www2.agenciatributaria.gob.es/wlpl/DSII-Bus/ServicioSuministro',
      },
      auth: {
        username: config.username,
        password: config.password,
      },
    });
  }

  /**
   * Transforma una `Invoice` de dominio al XML requerido por el SII.
   */
  public transformInvoice(invoice: Invoice): string {
    const fecha = invoice.issueDate.toISOString().split('T')[0];
    const descripcion = invoice.description ?? 'Factura emitida';
    const importe = invoice.totalAmount.toFixed(2);

    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sii="https://www2.agenciatributaria.gob.es/wlpl/DSII">
  <soapenv:Header/>
  <soapenv:Body>
    <sii:SuministroLRFacturasEmitidas>
      <sii:Cabecera>
        <sii:IDVersionSii>1.1</sii:IDVersionSii>
        <sii:TipoComunicación>A0</sii:TipoComunicación>
      </sii:Cabecera>
      <sii:RegistroLRFacturasEmitidas>
        <sii:FacturaEmitida>
          <sii:DescripcionFactura>${descripcion}</sii:DescripcionFactura>
          <sii:IDFactura>
            <sii:NumSerieFacturaEmisor>${invoice.number}</sii:NumSerieFacturaEmisor>
            <sii:FechaExpedicionFacturaEmisor>${fecha}</sii:FechaExpedicionFacturaEmisor>
          </sii:IDFactura>
          <sii:ImporteTotal>${importe}</sii:ImporteTotal>
          <sii:FechaOperacion>${fecha}</sii:FechaOperacion>
          <sii:DescripcionOperacion>Prestación de servicios</sii:DescripcionOperacion>
        </sii:FacturaEmitida>
      </sii:RegistroLRFacturasEmitidas>
    </sii:SuministroLRFacturasEmitidas>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Envía el XML al endpoint de la AEAT.
   */
  public async sendToAEAT(xml: string): Promise<{ status: 'success' | 'error'; message: string; rawResponse: string }> {
    try {
      const { data, status } = await this.http.post('', xml);
      return {
        status: status >= 200 && status < 300 ? 'success' : 'error',
        message: status >= 200 && status < 300 ? 'Enviado correctamente' : `Error HTTP ${status}`,
        rawResponse: typeof data === 'string' ? data : JSON.stringify(data),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message ?? 'Error desconocido',
        rawResponse: error?.response?.data ?? '',
      };
    }
  }
}


import { Invoice } from '@facturacion/types';

/**
 * Configuración necesaria para comunicarse con el servicio SII de la AEAT.
 * Las credenciales deben proporcionarse a través de variables de entorno
 * o de un gestor de secretos externo.
 */
export interface SIIConfig {
  /** Endpoint SOAP del ambiente SII (producción o pruebas) */
  endpoint: string;
  /** Usuario/certificado (modalidad clave) */
  username: string;
  /** Contraseña/clave */
  password: string;
  /** Tiempo máximo de espera para la petición */
  timeout?: number;
}

/**
 * Servicio de integración con el Suministro Inmediato de Información (SII) de la AEAT.
 *
 * • `transformInvoice` convierte un objeto `Invoice` del dominio a XML siguiendo el
 *   esquema del SII (simplificado aquí).
 * • `sendToAEAT` envía el XML generado y devuelve la respuesta normalizada.
 */
export class SIIService {
  private readonly http: AxiosInstance;

  constructor(private readonly config: SIIConfig) {
    this.http = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout ?? 10000,
      maxRedirects: 0,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'http://www2.agenciatributaria.gob.es/wlpl/DSII-Bus/ServicioSuministro',
      },
      auth: {
        username: config.username,
        password: config.password,
      },
    });
  }

  /**
   * Transforma una factura a la representación XML SOAP requerida por el SII.
   * La implementación completa del esquema XML es extensa; aquí se genera una
   * versión mínima para demostrar la estructura. Completar según necesidad.
   */
  public transformInvoice(invoice: Invoice): string {
    const descripcion = invoice.description ?? 'Factura emitida';
    const fecha = invoice.issueDate.toISOString().split('T')[0];

    const builder = create({ version: '1.0', encoding: 'UTF-8' });

    const envelope = builder.ele('soapenv:Envelope', {
      'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
      'xmlns:sii': 'https://www2.agenciatributaria.gob.es/wlpl/DSII',
    });

    const body = envelope
      .ele('soapenv:Header')
      .up()
      .ele('soapenv:Body');

    const suministro = body.ele('sii:SuministroLRFacturasEmitidas');

    // Cabecera
    const cabecera = suministro.ele('sii:Cabecera');
    cabecera.ele('sii:IDVersionSii').txt('1.1');
    cabecera.ele('sii:TipoComunicación').txt('A0');

    // Registro factura
    const registro = suministro.ele('sii:RegistroLRFacturasEmitidas');
    const factura = registro.ele('sii:FacturaEmitida');

    factura.ele('sii:DescripcionFactura').txt(descripcion);

    const idFactura = factura.ele('sii:IDFactura');
    idFactura.ele('sii:NumSerieFacturaEmisor').txt(invoice.number);
    idFactura.ele('sii:FechaExpedicionFacturaEmisor').txt(fecha);

    factura.ele('sii:ImporteTotal').txt(invoice.totalAmount.toFixed(2));
    factura.ele('sii:FechaOperacion').txt(fecha);
    factura.ele('sii:DescripcionOperacion').txt('Prestación de servicios');

    return envelope.end({ prettyPrint: true });
  }
    const now = new Date();

    const xml = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('soapenv:Envelope', {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:sii': 'https://www2.agenciatributaria.gob.es/wlpl/DSII',
      })
      .ele('soapenv:Header')
      .up()
      .ele('soapenv:Body')
      .ele('sii:SuministroLRFacturasEmitidas')
      .ele('sii:Cabecera')
      .ele('sii:IDVersionSii').txt('1.1').up()
      .ele('sii:TipoComunicación').txt('A0').up() // Alta normal
      .up()
      .ele('sii:RegistroLRFacturasEmitidas')
      .ele('sii:FacturaEmitida')
      const descripcion = invoice.description ?? 'Factura emitida';
      .ele('sii:DescripcionFactura').txt(descripcion).up()
      .ele('sii:IDFactura')
      .ele('sii:NumSerieFacturaEmisor').txt(invoice.number).up()
      .ele('sii:FechaExpedicionFacturaEmisor').txt(invoice.issueDate.toISOString().split('T')[0]).up()
      .up()
      .ele('sii:ImporteTotal').txt(invoice.totalAmount.toFixed(2)).up()
      .ele('sii:FechaOperacion').txt(invoice.issueDate.toISOString().split('T')[0]).up()
      .ele('sii:DescripcionOperacion').txt('Prestación de servicios').up()
      .up() // Fin FacturaEmitida
      .up() // Fin RegistroLRFacturasEmitidas
      .up() // Fin SuministroLRFacturasEmitidas
      .up() // Fin Body
      .up() // Fin Envelope
      .end({ prettyPrint: true });

    return xml;
  }

  /**
   * Envía el XML generado a la AEAT y devuelve un objeto normalizado con la respuesta.
   */
  public async sendToAEAT(xml: string): Promise<{ status: 'success' | 'error'; message: string; rawResponse: string }> {
    try {
      const { data, status } = await this.http.post('', xml);
      if (status >= 200 && status < 300) {
        return { status: 'success', message: 'Enviado correctamente', rawResponse: data };
      }
      return { status: 'error', message: `Respuesta HTTP ${status}`, rawResponse: data };
    } catch (error: any) {
      return { status: 'error', message: error.message ?? 'Error desconocido', rawResponse: error.response?.data };
    }
  }
}
