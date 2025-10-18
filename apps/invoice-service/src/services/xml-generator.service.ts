import { InvoiceWithDetails, InvoiceLine } from "@facturacion/database";
import { CertificateManager, CertificateData, XmlDSigSigner, TimestampService, TimestampServiceConfig } from "../../../../packages/services/src/digital-signing";

const DEFAULT_XML_TRANSFORMER_URL = "http://localhost:3004";

export interface SigningConfig {
  enabled: boolean;
  certificatePath?: string;
  certificatePassword?: string;
  certificatePemPath?: string;
  privateKeyPemPath?: string;
  enableTimestamp: boolean;
  tsaUrl?: string;
  tsaTimeout?: number;
  enableTimestampStub: boolean;
  validateCertificate: boolean;
}

export class XmlGeneratorService {
  private static get transformerUrl(): string {
    return process.env.XML_TRANSFORMER_URL || DEFAULT_XML_TRANSFORMER_URL;
  }

  /**
   * Carga configuración de firma desde variables de entorno
   */
  private static getSigningConfig(): SigningConfig {
    const p12Path = process.env.CERTIFICATE_PATH;
    const p12Password = process.env.CERTIFICATE_PASSWORD;
    const pemCertPath = process.env.CERTIFICATE_PEM_PATH;
    const pemKeyPath = process.env.PRIVATE_KEY_PEM_PATH;

    const enabled =
      process.env.ENABLE_XML_SIGNING !== "false" &&
      (!!p12Path || (!!pemCertPath && !!pemKeyPath));

    return {
      enabled,
      certificatePath: p12Path,
      certificatePassword: p12Password,
      certificatePemPath: pemCertPath,
      privateKeyPemPath: pemKeyPath,
      enableTimestamp: process.env.ENABLE_XML_TIMESTAMP !== "false",
      tsaUrl: process.env.TSA_URL,
      tsaTimeout: parseInt(process.env.TSA_TIMEOUT || "30000"),
      enableTimestampStub: process.env.ENABLE_TIMESTAMP_STUB === "true",
      validateCertificate: process.env.VALIDATE_CERTIFICATE !== "false",
    };
  }

  /**
   * Carga y valida un certificado
   */
  private static async loadCertificate(
    config: SigningConfig
  ): Promise<CertificateData | null> {
    try {
      let certData: CertificateData | null = null;

      // Intentar cargar desde P12
      if (config.certificatePath && config.certificatePassword) {
        console.log("📜 Cargando certificado P12...");
        certData = CertificateManager.loadFromP12(
          config.certificatePath,
          config.certificatePassword
        );
      }
      // Intentar cargar desde PEM
      else if (config.certificatePemPath && config.privateKeyPemPath) {
        console.log("📜 Cargando certificados PEM...");
        certData = CertificateManager.loadFromPEM(
          config.certificatePemPath,
          config.privateKeyPemPath
        );
      }

      if (!certData) {
        console.warn("⚠️ No se pudo cargar certificado");
        return null;
      }

      // Validar certificado
      if (config.validateCertificate) {
        const validation = CertificateManager.validateCertificate(certData);
        if (!validation.valid) {
          console.warn(
            `⚠️ Certificado inválido: ${validation.errors.join(", ")}`
          );
          return null;
        }
      }

      return certData;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error cargando certificado: ${msg}`);
      return null;
    }
  }

  /**
   * Firma XML con certificado digital
   */
  private static async signXml(
    xml: string,
    config: SigningConfig
  ): Promise<string> {
    try {
      if (!config.enabled) {
        console.log("ℹ️ Firma digital deshabilitada por configuración");
        return xml;
      }

      console.log("🔐 Firmando XML con certificado digital...");

      // Cargar certificado
      const certData = await this.loadCertificate(config);
      if (!certData) {
        console.warn("⚠️ Firma deshabilitada: certificado no disponible");
        return xml;
      }

      // Crear firmador
      const signer = new XmlDSigSigner({
        strictValidation: true,
        includeKeyInfo: true,
      });

      // Firmar XML
      const signedXml = signer.sign(
        xml,
        certData.privateKey,
        certData.certificate
      );

      console.log("✅ XML firmado exitosamente");
      return signedXml;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error al firmar XML: ${msg}`);
      // Retornar XML sin firmar como degradación graceful
      return xml;
    }
  }

  /**
   * Añade timestamp a XML firmado
   */
  private static async addTimestamp(
    signedXml: string,
    config: SigningConfig
  ): Promise<string> {
    try {
      if (!config.enableTimestamp) {
        console.log("ℹ️ Timestamp deshabilitado por configuración");
        return signedXml;
      }

      // Validar que hay firma
      if (!signedXml.includes("<ds:Signature>")) {
        console.log("ℹ️ XML no contiene firma, omitiendo timestamp");
        return signedXml;
      }

      // Validar URL de TSA
      if (!config.tsaUrl && !config.enableTimestampStub) {
        console.warn(
          "⚠️ TSA_URL no configurado y modo stub deshabilitado, omitiendo timestamp"
        );
        return signedXml;
      }

      console.log("⏰ Añadiendo timestamp...");

      const tsaUrl = config.tsaUrl || "http://time.certum.pl";
      const tsConfig: TimestampServiceConfig = {
        tsaUrl,
        timeout: config.tsaTimeout,
        enableStub: config.enableTimestampStub,
      };

      const timestampService = new TimestampService(tsConfig);
      const timestampedXml = await timestampService.addTimestamp(signedXml);

      console.log("✅ Timestamp añadido exitosamente");
      return timestampedXml;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error al añadir timestamp: ${msg}`);
      // Retornar XML sin timestamp como degradación graceful
      return signedXml;
    }
  }

  private static mapInvoiceToPayload(invoice: InvoiceWithDetails) {
    const toNumber = (value: any) => (value ? Number(value) : 0);

    return {
      number: invoice.number,
      date: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : undefined,
      issuer: {
        name: invoice.company.name,
        fiscalId: invoice.company.cif,
        address: {
          street: invoice.company.address,
          city: invoice.company.city,
          postalCode: invoice.company.postalCode,
          province: invoice.company.province,
          country: "España",
        },
      },
      client: {
        name: invoice.client.name,
        fiscalId: invoice.client.nifCif,
        address: {
          street: invoice.client.address ?? "",
          city: invoice.client.city ?? "",
          postalCode: invoice.client.postalCode ?? "",
          province: invoice.client.province ?? "",
          country: "España",
        },
      },
      lines: invoice.lines.map((line: InvoiceLine) => {
        const quantity = toNumber(line.quantity);
        const price = toNumber(line.price);
        const vatRate = toNumber(line.vatRate);
        const lineSubtotal = quantity * price;
        const vatAmount = lineSubtotal * (vatRate / 100);

        return {
          description: line.description,
          quantity,
          unitPrice: price,
          vatRate,
          vatAmount,
          total: lineSubtotal + vatAmount,
        };
      }),
      subtotal: toNumber(invoice.subtotal),
      totalVat: toNumber(invoice.vatAmount),
      total: toNumber(invoice.total),
      notes: invoice.notes ?? undefined,
    };
  }

  /**
   * Genera, firma y añade timestamp a XML de factura
   */
  static async generateAndSignXml(invoice: InvoiceWithDetails): Promise<string> {
    try {
      // 1. Generar XML base
      console.log("📋 Generando XML base...");
      const payload = this.mapInvoiceToPayload(invoice);
      const endpoint = `${this.transformerUrl.replace(/\/$/, "")}/api/transform/facturae`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `XML transformer error (${response.status}): ${errorBody}`
        );
      }

      let xml = await response.text();
      console.log("✅ XML base generado");

      // 2. Cargar configuración
      const config = this.getSigningConfig();

      // 3. Firmar si está habilitado
      if (config.enabled) {
        xml = await this.signXml(xml, config);
      } else {
        console.log("ℹ️ Firma digital deshabilitada - no hay certificado configurado");
      }

      // 4. Añadir timestamp si está habilitado y hay firma
      if (config.enableTimestamp && xml.includes("<ds:Signature>")) {
        xml = await this.addTimestamp(xml, config);
      }

      return xml;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error generando XML: ${msg}`);
      throw error;
    }
  }
}
