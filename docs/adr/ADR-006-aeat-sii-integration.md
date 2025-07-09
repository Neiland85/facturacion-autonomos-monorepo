# ADR-006: Integración con AEAT/SII y Servicios Fiscales

## Estado

**Propuesto** - Julio 2025

## Contexto

Como aplicación de facturación para autónomos españoles, necesitamos:

- Integración obligatoria con AEAT SII (Suministro Inmediato de Información)
- Validación de NIFs/CIFs
- Cálculo automático de impuestos según normativa española
- Certificados digitales para autenticación
- Cumplimiento con regulaciones fiscales

## Decisión

Implementamos integración completa con **AEAT SII** usando certificados digitales, **validación de NIFs** y **cálculo automático de impuestos** según normativa española vigente.

## Arquitectura de Integración

### Flujo SII

\`\`\`mermaid
sequenceDiagram
participant U as Usuario
participant A as App
participant S as SII Service
participant AEAT as AEAT SII

    U->>A: Crear/Enviar Factura
    A->>A: Validar datos fiscales
    A->>S: Preparar XML SII
    S->>S: Firmar con certificado
    S->>AEAT: Enviar a SII
    AEAT->>S: Respuesta SII
    S->>A: Procesar respuesta
    A->>U: Actualizar estado factura

\`\`\`

### Configuración de Certificados

\`\`\`typescript
// packages/services/src/aeat/certificates.ts
import fs from 'fs'
import forge from 'node-forge'

export interface CertificateConfig {
certPath: string
keyPath: string
password: string
nif: string
}

export class CertificateManager {
private cert: forge.pki.Certificate
private privateKey: forge.pki.PrivateKey

constructor(private config: CertificateConfig) {
this.loadCertificate()
}

private loadCertificate() {
try {
// Cargar certificado .p12
const p12Buffer = fs.readFileSync(this.config.certPath)
const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'))
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, this.config.password)

      // Extraer certificado y clave privada
      const bags = p12.getBags({ bagType: forge.pki.oids.certBag })
      this.cert = bags[forge.pki.oids.certBag]![0].cert!

      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
      this.privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]![0].key!

    } catch (error) {
      throw new Error(\`Error cargando certificado: \${error}\`)
    }

}

signXML(xmlContent: string): string {
// Implementar firma XMLDSig
const xmlDoc = new DOMParser().parseFromString(xmlContent, 'text/xml')

    // Crear firma digital
    const signature = forge.md.sha256.create()
    signature.update(xmlContent, 'utf8')

    const signed = this.privateKey.sign(signature)
    const signatureBase64 = forge.util.encode64(signed)

    // Insertar firma en XML
    // ... implementación completa de XMLDSig

    return xmlContent // XML firmado

}

getNIF(): string {
// Extraer NIF del certificado
const subject = this.cert.subject
const serialNumber = subject.getField('serialNumber')?.value
return serialNumber || this.config.nif
}
}
\`\`\`

### Servicio SII

\`\`\`typescript
// packages/services/src/aeat/sii.service.ts
import axios, { AxiosInstance } from 'axios'
import { CertificateManager } from './certificates'
import { Invoice } from '@prisma/client'

interface SIIConfig {
endpoint: string
testing: boolean
certificate: CertificateManager
}

export interface SIIInvoiceData {
ClaveRegimenEspecialOTrascendencia: string
DescripcionOperacion: string
TipoFactura: 'F1' | 'F2' | 'F3' | 'F4'
ImporteTotal: number
BaseImponible: number
CuotaRepercutida: number
TipoImpositivo: number
}

export class SIIService {
private client: AxiosInstance

constructor(private config: SIIConfig) {
this.client = axios.create({
baseURL: config.endpoint,
timeout: 30000,
headers: {
'Content-Type': 'text/xml; charset=utf-8',
'SOAPAction': ''
}
})
}

async sendInvoice(invoice: Invoice): Promise<SIIResponse> {
try {
// Convertir factura a formato SII
const siiData = this.convertToSII(invoice)

      // Generar XML SOAP
      const xmlRequest = this.buildSIIXML(siiData)

      // Firmar XML
      const signedXML = this.config.certificate.signXML(xmlRequest)

      // Enviar a AEAT
      const response = await this.client.post('', signedXML)

      // Procesar respuesta
      return this.parseResponse(response.data)

    } catch (error) {
      throw new Error(\`Error enviando factura a SII: \${error}\`)
    }

}

private convertToSII(invoice: Invoice): SIIInvoiceData {
return {
ClaveRegimenEspecialOTrascendencia: '01', // Operación de régimen general
DescripcionOperacion: 'Factura de servicios profesionales',
TipoFactura: 'F1', // Factura completa
ImporteTotal: Number(invoice.total),
BaseImponible: Number(invoice.subtotal),
CuotaRepercutida: Number(invoice.taxAmount),
TipoImpositivo: Number(invoice.taxRate)
}
}

private buildSIIXML(data: SIIInvoiceData): string {
return \`<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
<soap:Header/>
<soap:Body>
<SuministroLRFacturasEmitidas>
<Cabecera>
<IDVersionSii>1.1</IDVersionSii>
<Titular>
<NIF>\${this.config.certificate.getNIF()}</NIF>
<NombreRazon>Nombre del Titular</NombreRazon>
</Titular>
</Cabecera>
<RegistroLRFacturasEmitidas>
<PeriodoImpositivo>
<Ejercicio>\${new Date().getFullYear()}</Ejercicio>
<Periodo>\${String(new Date().getMonth() + 1).padStart(2, '0')}</Periodo>
</PeriodoImpositivo>
<IDFactura>
<IDEmisorFactura>
<NIF>\${this.config.certificate.getNIF()}</NIF>
</IDEmisorFactura>
<NumSerieFacturaEmisor>\${data.TipoFactura}</NumSerieFacturaEmisor>
<FechaExpedicionFacturaEmisor>\${new Date().toISOString().split('T')[0]}</FechaExpedicionFacturaEmisor>
</IDFactura>
<FacturaExpedida>
<TipoFactura>\${data.TipoFactura}</TipoFactura>
<ClaveRegimenEspecialOTrascendencia>\${data.ClaveRegimenEspecialOTrascendencia}</ClaveRegimenEspecialOTrascendencia>
<DescripcionOperacion>\${data.DescripcionOperacion}</DescripcionOperacion>
<ImporteTotal>\${data.ImporteTotal}</ImporteTotal>
<BaseImponible>\${data.BaseImponible}</BaseImponible>
<CuotaRepercutida>\${data.CuotaRepercutida}</CuotaRepercutida>
<TipoImpositivo>\${data.TipoImpositivo}</TipoImpositivo>
</FacturaExpedida>
</RegistroLRFacturasEmitidas>
</SuministroLRFacturasEmitidas>
</soap:Body>
</soap:Envelope>\`
}

private parseResponse(xmlResponse: string): SIIResponse {
// Parsear respuesta XML de AEAT
// Implementar parsing completo
return {
success: true,
reference: 'SII_REF_123',
errors: []
}
}
}

export interface SIIResponse {
success: boolean
reference?: string
errors: string[]
}
\`\`\`

### Validación de NIFs

\`\`\`typescript
// packages/core/src/fiscal/nif-validator.ts
export class NIFValidator {
private static readonly NIF_REGEX = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
  private static readonly CIF_REGEX = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i
private static readonly NIE_REGEX = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i

static validate(identifier: string): { isValid: boolean; type: 'NIF' | 'CIF' | 'NIE' | null } {
const cleanId = identifier.replace(/[-\s]/g, '').toUpperCase()

    if (this.validateNIF(cleanId)) {
      return { isValid: true, type: 'NIF' }
    }

    if (this.validateCIF(cleanId)) {
      return { isValid: true, type: 'CIF' }
    }

    if (this.validateNIE(cleanId)) {
      return { isValid: true, type: 'NIE' }
    }

    return { isValid: false, type: null }

}

private static validateNIF(nif: string): boolean {
if (!this.NIF_REGEX.test(nif)) return false

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
    const number = parseInt(nif.substring(0, 8))
    const letter = nif.charAt(8)

    return letters.charAt(number % 23) === letter

}

private static validateCIF(cif: string): boolean {
if (!this.CIF_REGEX.test(cif)) return false

    const orgType = cif.charAt(0)
    const number = cif.substring(1, 8)
    const control = cif.charAt(8)

    // Algoritmo de validación CIF
    let sum = 0
    for (let i = 0; i < number.length; i++) {
      let digit = parseInt(number.charAt(i))
      if (i % 2 === 1) {
        digit *= 2
        if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10)
      }
      sum += digit
    }

    const expectedControl = (10 - (sum % 10)) % 10

    // Algunos tipos de organización usan letra, otros número
    if ('NPQRSW'.includes(orgType)) {
      return control === expectedControl.toString()
    } else {
      const controlLetter = 'JABCDEFGHI'.charAt(expectedControl)
      return control === controlLetter || control === expectedControl.toString()
    }

}

private static validateNIE(nie: string): boolean {
if (!this.NIE_REGEX.test(nie)) return false

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
    const prefix = nie.charAt(0)
    let number = nie.substring(1, 8)
    const letter = nie.charAt(8)

    // Convertir prefijo a número
    switch (prefix) {
      case 'X': number = '0' + number; break
      case 'Y': number = '1' + number; break
      case 'Z': number = '2' + number; break
    }

    return letters.charAt(parseInt(number) % 23) === letter

}
}
\`\`\`

### Calculadora de Impuestos

\`\`\`typescript
// packages/core/src/fiscal/tax-calculator.ts
export interface TaxRates {
iva: {
general: number // 21%
reduced: number // 10%
superReduced: number // 4%
}
irpf: {
profesional: number // 15%
empresarial: number // 0%
}
}

export class TaxCalculator {
private static readonly CURRENT_RATES: TaxRates = {
iva: {
general: 0.21,
reduced: 0.10,
superReduced: 0.04
},
irpf: {
profesional: 0.15,
empresarial: 0.00
}
}

static calculateIVA(
baseAmount: number,
type: 'general' | 'reduced' | 'superReduced' = 'general'
): { base: number; rate: number; amount: number; total: number } {
const rate = this.CURRENT_RATES.iva[type]
const amount = baseAmount \* rate
const total = baseAmount + amount

    return {
      base: baseAmount,
      rate,
      amount: Math.round(amount * 100) / 100,
      total: Math.round(total * 100) / 100
    }

}

static calculateIRPF(
baseAmount: number,
type: 'profesional' | 'empresarial' = 'profesional'
): { base: number; rate: number; amount: number; net: number } {
const rate = this.CURRENT_RATES.irpf[type]
const amount = baseAmount \* rate
const net = baseAmount - amount

    return {
      base: baseAmount,
      rate,
      amount: Math.round(amount * 100) / 100,
      net: Math.round(net * 100) / 100
    }

}

static calculateFullTax(
baseAmount: number,
ivaType: 'general' | 'reduced' | 'superReduced' = 'general',
irpfType: 'profesional' | 'empresarial' = 'profesional'
) {
const iva = this.calculateIVA(baseAmount, ivaType)
const irpf = this.calculateIRPF(baseAmount, irpfType)

    return {
      base: baseAmount,
      iva,
      irpf,
      total: iva.total,
      netAmount: irpf.net
    }

}
}
\`\`\`

## Configuración de Entorno

### Variables de Entorno

\`\`\`bash

# AEAT SII Configuration

AEAT_SII_ENDPOINT_PROD="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroFactEmitidas.wsdl"
AEAT_SII_ENDPOINT_TEST="https://www7.aeat.es/wlpl/SSII-FACT/ws/fe/SiiFactFEV1SOAP"

# Certificados digitales

AEAT_CERT_PATH="/path/to/certificate.p12"
AEAT_CERT_PASSWORD="certificate_password"
AEAT_NIF="12345678Z"

# Configuración fiscal

TAX_CALCULATION_MODE="AUTO" # AUTO | MANUAL
DEFAULT_IVA_RATE="0.21"
DEFAULT_IRPF_RATE="0.15"
\`\`\`

## Implementación por Fases

### Fase 1: Validación y Cálculos (Semana 1)

- [ ] Implementar NIFValidator
- [ ] Crear TaxCalculator
- [ ] Testing de validaciones fiscales
- [ ] Integrar en formularios

### Fase 2: Certificados y SII (Semana 2-3)

- [ ] Configurar CertificateManager
- [ ] Implementar SIIService
- [ ] Testing con entorno de pruebas AEAT
- [ ] Manejo de errores SII

### Fase 3: Integración Completa (Semana 4)

- [ ] Integrar SII en flujo de facturas
- [ ] Dashboard de estado SII
- [ ] Logs y auditoría
- [ ] Documentación para usuarios

## Consecuencias

### Positivas ✅

- **Cumplimiento Legal**: Obligatorio para autónomos
- **Automatización**: Envío automático a AEAT
- **Validación**: NIFs/CIFs verificados
- **Cálculos**: Impuestos automáticos y actualizados

### Negativas ❌

- **Complejidad**: Integración SOAP compleja
- **Certificados**: Gestión de certificados digitales
- **Dependencia**: Servicio crítico externo
- **Testing**: Limitaciones en entorno de pruebas

## Configuraciones VS Code

\`\`\`json
{
"xml.validation.enabled": true,
"xml.format.enabled": true,
"files.associations": {
"_.wsdl": "xml",
"_.xsd": "xml"
}
}
\`\`\`
