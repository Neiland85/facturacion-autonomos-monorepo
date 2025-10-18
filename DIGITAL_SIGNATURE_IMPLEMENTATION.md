# 🔐 Implementación de Firma Digital XML y Timestamping

Documentación completa del sistema de firma digital para facturas electrónicas en formato XMLfacturae, cumpliendo con normativa AEAT y estándares internacionales (XAdES, RFC 3161).

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Componentes Principales](#componentes-principales)
3. [Configuración](#configuración)
4. [Flujo de Firma](#flujo-de-firma)
5. [Gestión de Certificados](#gestión-de-certificados)
6. [Timestamping RFC 3161](#timestamping-rfc-3161)
7. [Manejo de Errores](#manejo-de-errores)
8. [Seguridad](#seguridad)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura General

### Diagrama de Flujo

```
Invoice Data
     ↓
[XmlGeneratorService]
     ↓
Generate Base XML
     ↓
[CertificateManager]
     ↓
Load & Validate Certificate
     ↓
[XmlDSigSigner]
     ↓
Create XML Signature (XMLDSig)
     ↓
[TimestampService]
     ↓
Add RFC 3161 Timestamp
     ↓
Signed & Timestamped XML
```

### Stack Tecnológico

| Componente | Librería | Versión | Propósito |
|-----------|----------|---------|----------|
| Signing | `xml-crypto` | ^6.0.0 | Firma XMLDSig/XAdES |
| Certificados | `node-forge` | ^1.3.1 | Carga P12/PEM, validación |
| HTTP Requests | Node.js built-in | - | Peticiones a TSA |
| XML Parsing | DOMParser | built-in | Parsing/manipulación XML |

---

## 🔧 Componentes Principales

### 1. CertificateManager

**Ubicación**: `/certificate-manager.ts`

**Responsabilidad**: Carga, validación y caching de certificados digitales.

#### Características Principales

```typescript
interface CertificateData {
  privateKey: string;           // Clave privada en PEM
  certificate: string;          // Certificado en PEM
  publicKey: string;            // Clave pública en PEM
  issuer: string;               // CN del emisor
  subject: string;              // CN del sujeto
  validFrom: Date;              // Fecha inicio validez
  validTo: Date;                // Fecha fin validez
}
```

#### Métodos Principales

| Método | Descripción |
|--------|------------|
| `loadFromP12()` | Carga certificado desde archivo P12/PFX con contraseña |
| `loadFromPEM()` | Carga certificado desde archivos PEM separados |
| `validateCertificate()` | Valida formato, fechas y campos requeridos |
| `getCertificateInfo()` | Retorna info segura para logging (sin claves) |
| `clearCache()` | Limpia caché de certificados |

#### Ejemplo de Uso

```typescript
import { CertificateManager } from './certificate-manager';

// Cargar desde P12
const cert = CertificateManager.loadFromP12(
  '/path/to/cert.p12',
  'contraseña'
);

// Validar certificado
const validation = CertificateManager.validateCertificate(cert);
if (!validation.valid) {
  console.error('Errores:', validation.errors);
}

// Info segura para logs
const info = CertificateManager.getCertificateInfo(cert);
console.log(info); // No incluye claves privadas
```

#### Caché de Certificados

- **TTL**: 1 hora (3,600,000 ms)
- **Clave**: SHA-256 hash del certificado P12
- **Invalidación**: Automática tras TTL o `clearCache()`
- **Beneficio**: Reduce carga de criptografía en carga repetida

---

### 2. XmlDSigSigner

**Ubicación**: `/xmldsig-signer.ts`

**Responsabilidad**: Firma y verificación de documentos XML usando estándar XMLDSig.

#### Opciones de Configuración

```typescript
interface SignerOptions {
  strictValidation?: boolean;           // Validar XML bien-formado
  allowedAlgorithms?: string[];         // Algoritmos permitidos
  includeKeyInfo?: boolean;             // Incluir certificado en firma
}
```

#### Métodos Principales

| Método | Descripción |
|--------|------------|
| `sign()` | Firma XML con clave privada y certificado |
| `verify()` | Verifica firma, retorna resultado detallado |
| `extractCertificateFromSignature()` | Extrae certificado de firma |
| `isWellFormedXml()` | Valida XML bien-formado |
| `isPemFormat()` | Valida formato PEM |

#### Resultado de Verificación

```typescript
interface VerificationResult {
  valid: boolean;
  errors: string[];      // Errores encontrados
  warnings: string[];    // Advertencias
}
```

#### Ejemplo de Uso

```typescript
import { XmlDSigSigner } from './xmldsig-signer';

const signer = new XmlDSigSigner({
  strictValidation: true,
  includeKeyInfo: true,
  allowedAlgorithms: [
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
  ]
});

// Firmar
try {
  const signedXml = signer.sign(xmlContent, privateKey, certificate);
  console.log('✅ XML firmado exitosamente');
} catch (error) {
  console.error('❌ Error al firmar:', error.message);
}

// Verificar
const result = signer.verify(signedXml);
if (result.valid) {
  console.log('✅ Firma válida');
} else {
  console.error('❌ Errores:', result.errors);
  console.warn('⚠️ Advertencias:', result.warnings);
}
```

#### Algoritmos Soportados

- ✅ RSA-SHA256 (recomendado)
- ✅ RSA-SHA1 (legacy)
- ❌ MD5 (bloqueado)
- ❌ HMAC (bloqueado)

---

### 3. TimestampService

**Ubicación**: `/timestamp-service.ts`

**Responsabilidad**: Adición de marcas de tiempo RFC 3161 a XML firmado.

#### Configuración

```typescript
interface TimestampServiceConfig {
  tsaUrl: string;           // URL de Autoridad de Timestamp
  timeout: number;          // Timeout en ms (ej: 30000)
  username?: string;        // Usuario TSA (si requiere)
  password?: string;        // Contraseña TSA (si requiere)
  enableStub?: boolean;     // Usar timestamps simulados
}
```

#### Principales TSAs Públicas

| Proveedor | URL | Requiere Auth | Costo |
|-----------|-----|---------------|----- |
| DigiCert | `http://timestamp.digicert.com` | No | Gratis |
| Certum | `http://time.certum.pl` | No | Gratis |
| GlobalSign | `http://timestamp.globalsign.com` | No | Gratis |
| Certicámara | `http://timestamp.certicamara.com:8080` | No | Gratis |

#### Ciclo de vida RFC 3161

```
1. Crear petición de timestamp (con nonce único)
     ↓
2. Enviar a TSA vía HTTP POST
     ↓
3. Recibir respuesta con marca de tiempo
     ↓
4. Validar token de timestamp
     ↓
5. Incrustar en estructura XAdES del XML
```

#### Ejemplo de Uso

```typescript
import { TimestampService } from './timestamp-service';

const config = {
  tsaUrl: 'http://timestamp.digicert.com',
  timeout: 30000,
  enableStub: process.env.NODE_ENV === 'development'
};

const tsService = new TimestampService(config);

// Agregar timestamp a XML firmado
const xmlWithTimestamp = await tsService.addTimestamp(signedXml);

if (xmlWithTimestamp) {
  console.log('✅ Timestamp agregado');
} else {
  console.warn('⚠️ No se pudo agregar timestamp (sin firma)');
}
```

#### Modo Stub (Desarrollo)

En desarrollo, puede usarse `enableStub: true` para generar timestamps simulados sin conexión a TSA real:

```typescript
const stubTimestamp = new Date().toISOString();
// Simula: <xades:SigningTime>2024-01-15T10:00:00Z</xades:SigningTime>
```

#### Manejo de Errores TSA

```typescript
class TimestampError extends Error {
  code: 'TSA_UNAVAILABLE' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'INVALID_XML'
  message: string
}
```

---

### 4. XmlGeneratorService

**Ubicación**: `apps/invoice-service/src/services/xml-generator.service.ts`

**Responsabilidad**: Orquestación del pipeline completo de generación → firma → timestamping.

#### Pipeline de Generación

```typescript
async generateAndSignXml(invoiceData): Promise<string> {
  // 1. Generar XML base desde datos de factura
  const baseXml = generateBaseXml(invoiceData);
  
  // 2. Cargar configuración de firma
  const config = getSigningConfig();
  
  // 3. Si firma habilitada: cargar certificado
  let signedXml = baseXml;
  if (config.enableSigning) {
    const cert = loadCertificate(config);
    if (cert) {
      // 4. Firmar XML
      signedXml = signXml(baseXml, cert);
      
      // 5. Si timestamp habilitado: agregar timestamp
      if (config.enableTimestamp && signedXml) {
        const timestampedXml = await addTimestamp(signedXml, config);
        return timestampedXml || signedXml;
      }
    }
  }
  
  // Retorna XML firmado/timestamped o base XML
  return signedXml;
}
```

#### Degradación Elegante

- ✅ Si falla certificado: retorna XML sin firmar
- ✅ Si TSA no disponible: retorna XML firmado sin timestamp
- ✅ Si todo falla: retorna XML base sin cambios

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# === CERTIFICADOS DIGITALES ===
# Opción 1: Certificado P12
CERTIFICATE_PATH="/path/to/cert.p12"
CERTIFICATE_PASSWORD="secure-password"

# Opción 2: Certificados PEM (alternativa)
# CERTIFICATE_PEM_PATH="/path/to/cert.pem"
# PRIVATE_KEY_PEM_PATH="/path/to/key.pem"

# Control de firma
ENABLE_XML_SIGNING=true
VALIDATE_CERTIFICATE=true
CERTIFICATE_CACHE_TTL=3600000  # 1 hora

# === TIMESTAMP (RFC 3161) ===
ENABLE_XML_TIMESTAMP=true
TSA_URL="http://timestamp.digicert.com"
TSA_TIMEOUT=30000
TSA_USERNAME=""
TSA_PASSWORD=""
ENABLE_TIMESTAMP_STUB=false    # true en desarrollo
TSA_RETRY_ATTEMPTS=3
```

### Precedencia de Carga

```
1. CERTIFICATE_PATH + CERTIFICATE_PASSWORD (P12)
   ↓
2. CERTIFICATE_PEM_PATH + PRIVATE_KEY_PEM_PATH (PEM)
   ↓
3. Variables de entorno legacy
   ↓
4. null (sin firma)
```

---

## 📊 Flujo de Firma

### Secuencia Detallada

```
Endpoint: GET /api/v1/invoices/:id/xml/signed
    ↓
[1] Validar autenticación (token JWT)
    ↓
[2] Buscar factura en BD
    ↓
[3] Validar datos (client, company, lines)
    ├─ Si falta datos → 400 Bad Request
    └─ Continuar
    ↓
[4] Generar/recuperar XML
    ↓
[5] Aplicar firma (si ENABLE_XML_SIGNING=true)
    ├─ Cargar certificado
    ├─ Validar certificado (si VALIDATE_CERTIFICATE=true)
    ├─ Crear signer con opciones
    ├─ Firmar XML
    └─ Capturar errores
    ↓
[6] Aplicar timestamp (si ENABLE_XML_TIMESTAMP=true)
    ├─ Contactar TSA
    ├─ Recibir marca de tiempo
    ├─ Incrustar en XML
    └─ Capturar errores
    ↓
[7] Detectar estado final
    ├─ X-Signature-Status: signed/unsigned
    ├─ X-Timestamp-Status: timestamped/not-timestamped
    └─ Headers en respuesta
    ↓
[8] Retornar XML + headers
    ├─ HTTP 200 (OK)
    ├─ Content-Type: application/xml
    └─ Headers de estado
```

### Mapeo de Errores HTTP

| Error | HTTP Status | Causa | Acción |
|-------|------------|-------|--------|
| Certificado no encontrado | 500 | Archivo faltante | Verificar CERTIFICATE_PATH |
| Contraseña incorrecta | 500 | Credencial inválida | Revisar CERTIFICATE_PASSWORD |
| Certificado expirado | 500 | Validación activa | Renovar certificado |
| XML malformado | 400 | XML inválido | Revisar datos de entrada |
| TSA no disponible | 503 | Servicio abajo | Retry automático |
| TSA timeout | 503 | Lentitud | Aumentar TSA_TIMEOUT |

---

## 🔑 Gestión de Certificados

### Formatos Soportados

#### P12 / PFX (Recomendado)

```bash
# Estructura
cert.p12
  ├─ Clave privada (encriptada)
  ├─ Certificado X.509
  └─ Cadena de certificados (opcional)

# Carga
CERTIFICATE_PATH="/path/to/cert.p12"
CERTIFICATE_PASSWORD="password"
```

**Ventajas**:
- ✅ Formato estándar de Windows
- ✅ Fácil distribución
- ✅ Protegido por contraseña

#### PEM (Alternativa)

```bash
# Estructura
cert.pem
  -----BEGIN CERTIFICATE-----
  base64-encoded...
  -----END CERTIFICATE-----

key.pem
  -----BEGIN RSA PRIVATE KEY-----
  base64-encoded...
  -----END RSA PRIVATE KEY-----

# Carga
CERTIFICATE_PEM_PATH="/path/to/cert.pem"
PRIVATE_KEY_PEM_PATH="/path/to/key.pem"
```

**Ventajas**:
- ✅ Formato estándar Unix
- ✅ Fácil integración con OpenSSL
- ✅ Portable

### Validación de Certificado

```typescript
const validation = CertificateManager.validateCertificate(cert);

// Retorna:
{
  valid: boolean,
  errors: [
    "Certificado expirado desde 2023-12-31",
    "No contiene clave privada",
    "Formato PEM inválido"
  ]
}
```

### Información Segura para Logging

```typescript
const info = CertificateManager.getCertificateInfo(cert);
console.log(info);

// Output (sin claves privadas):
/*
Certificado Digital:
  Sujeto: CN=empresa.es, O=Mi Empresa S.L., C=ES
  Emisor: CN=AC Autoridad Certicámara, O=Certicámara, C=ES
  Válido desde: 2024-01-15 hasta 2025-01-15
  Huella (SHA-1): A1:B2:C3:D4:E5:F6...
*/
```

---

## ⏰ Timestamping RFC 3161

### ¿Por qué Timestamps?

Normativa AEAT requiere:
- ✅ Firma digital
- ✅ Marca de tiempo certificada
- ✅ Prueba de existencia en momento específico
- ✅ No repudio

### Flujo RFC 3161

```
Cliente                          TSA
  │
  ├─ Crear TimeStampRequest ──────────→
  │  (Hash documento + nonce)
  │
  │←───────── TimeStampResponse ──────
  │           (Token timestamped)
  │
  └─ Incrustar en XML (XAdES)
```

### Estructura XAdES en XML

```xml
<Factura xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignatureValue>base64-signature</SignatureValue>
    <xades:QualifyingProperties>
      <xades:SignedProperties>
        <xades:SignedSignatureProperties>
          <xades:SigningTime>2024-01-15T10:30:45Z</xades:SigningTime>
          <xades:SigningCertificate>
            <xades:Cert>
              <xades:CertDigest Algorithm="SHA256">...</xades:CertDigest>
              <xades:IssuerSerial>...</xades:IssuerSerial>
            </xades:Cert>
          </xades:SigningCertificate>
        </xades:SignedSignatureProperties>
      </xades:SignedProperties>
    </xades:QualifyingProperties>
  </Signature>
</Factura>
```

### Reintentos Automáticos

```
Intento 1: Espera 500ms
  ├─ Fallo → Espera 1000ms
  │
Intento 2: Espera 1000ms
  ├─ Fallo → Espera 2000ms
  │
Intento 3: Espera 2000ms
  ├─ Éxito → Retorna timestamp
  └─ Fallo → Lanza TimestampError
```

---

## ⚠️ Manejo de Errores

### Cadena de Errores

```typescript
try {
  const cert = CertificateManager.loadFromP12(path, password);
  // Error: ENOENT - archivo no existe
} catch (error) {
  if (error.code === 'ENOENT') {
    // Certificado no encontrado
    res.status(500).json({
      error: 'CERTIFICATE_NOT_FOUND',
      message: 'El archivo de certificado no existe'
    });
  }
}
```

### Mensajes de Error Específicos

| Error | Mensaje | Solución |
|-------|---------|----------|
| `CERTIFICATE_NOT_FOUND` | Certificate file not found | Verificar ruta CERTIFICATE_PATH |
| `INVALID_PASSWORD` | Invalid password for certificate | Revisar CERTIFICATE_PASSWORD |
| `CERTIFICATE_EXPIRED` | Certificate is expired | Renovar certificado |
| `MALFORMED_XML` | XML is not well-formed | Validar datos de entrada |
| `TSA_UNAVAILABLE` | Timestamp Authority not reachable | Verificar TSA_URL y conectividad |
| `INVALID_SIGNATURE` | Signature validation failed | Revisar clave privada/certificado |

---

## 🔒 Seguridad

### Principios de Seguridad Implementados

#### 1. **Protección de Credenciales**
```typescript
// ❌ NUNCA registrar contraseñas
console.log(password);  // PROHIBIDO

// ✅ Información segura para logs
const info = CertificateManager.getCertificateInfo(cert);
console.log(info);  // Solo sujeto, emisor, fechas
```

#### 2. **Validación Estricta**
```typescript
// Validar XML bien-formado
if (!signer.isWellFormedXml(xml)) {
  throw new Error('XML inválido');
}

// Validar formato PEM
if (!signer.isPemFormat(key)) {
  throw new Error('Formato PEM inválido');
}
```

#### 3. **Algoritmos Seguros**
```typescript
// ✅ RSA-SHA256 (seguro)
allowedAlgorithms: [
  'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
]

// ❌ Bloqueados
// MD5, HMAC, RSA-MD5, etc.
```

#### 4. **Caché Seguro**
```typescript
// Claves hasheadas con SHA-256
// TTL automático de 1 hora
// Invalidación manual disponible
```

#### 5. **Timeout de Red**
```typescript
TSA_TIMEOUT=30000  // Máximo 30 segundos
// Previene cuelgues indefinidos
```

### Recomendaciones de Producción

1. **Variables de Entorno Seguras**
   ```bash
   # Usar GitHub Secrets o Azure Key Vault
   # NUNCA comitear certificados reales
   # Rotación regular de contraseñas
   ```

2. **Auditoría y Logging**
   ```typescript
   logger.info('✅ XML firmado', {
     invoiceId: inv.id,
     signature: 'signed',
     timestamp: new Date().toISOString()
   });
   ```

3. **Rate Limiting**
   ```bash
   # Limitar peticiones de firma por usuario
   # Prevenir abuso de recursos criptográficos
   ```

4. **Validación de Entrada**
   ```typescript
   // Validar XML antes de firmar
   // Sanitizar campos de factura
   // Verificar origen de datos
   ```

---

## 🧪 Testing

### Tests Implementados

#### Unit Tests

```bash
# Tests de certificados
npm run test -- certificate-manager.test.ts

# Tests de firmador
npm run test -- xmldsig-signer.test.ts

# Tests de timestamp
npm run test -- timestamp-service.test.ts
```

#### Integration Tests

```bash
# Tests de integración XML signing
npm run test -- xml-signing-integration.test.ts

# Tests de endpoint controller
npm run test -- invoice.controller.integration.spec.ts
```

### Cobertura

| Componente | Cobertura | Tests |
|-----------|-----------|-------|
| CertificateManager | 85% | 12 |
| XmlDSigSigner | 80% | 15 |
| TimestampService | 75% | 14 |
| XmlGeneratorService | 70% | 10 |
| InvoiceController | 65% | 8 |

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests específicos
npm run test -- --testNamePattern="XmlDSigSigner"

# Con cobertura
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

---

## 🔧 Troubleshooting

### Problema: "ENOENT: no such file or directory"

**Causa**: Archivo de certificado no encontrado

**Solución**:
```bash
# 1. Verificar ruta existe
ls -la /path/to/cert.p12

# 2. Verificar permisos
chmod 600 /path/to/cert.p12

# 3. Verificar variable de entorno
echo $CERTIFICATE_PATH

# 4. Copiar certificado a ruta correcta
cp ~/mi-cert.p12 /path/to/cert.p12
```

### Problema: "Invalid password for certificate"

**Causa**: Contraseña incorrecta

**Solución**:
```bash
# 1. Verificar contraseña
echo $CERTIFICATE_PASSWORD

# 2. Probar con OpenSSL
openssl pkcs12 -in cert.p12 -info -password pass:mypassword

# 3. Si OpenSSL funciona, revisar env var
# Podría haber caracteres especiales sin escapar
```

### Problema: "XML is not well-formed"

**Causa**: XML inválido

**Solución**:
```typescript
// 1. Validar XML antes de firmar
const parser = new DOMParser();
const dom = parser.parseFromString(xml, 'application/xml');
if (dom.getElementsByTagName('parsererror').length > 0) {
  console.error('XML inválido');
}

// 2. Usar herramientas de validación
// https://www.xmlvalidation.com/

// 3. Revisar datos de factura
console.log('Invoice:', invoiceData);
```

### Problema: "Timestamp Authority not reachable"

**Causa**: TSA no disponible

**Solución**:
```bash
# 1. Verificar conectividad
curl -v http://timestamp.digicert.com

# 2. Verificar DNS
nslookup timestamp.digicert.com

# 3. Cambiar TSA
# Usar alternativa: time.certum.pl, timestamp.globalsign.com

# 4. Usar stub en desarrollo
ENABLE_TIMESTAMP_STUB=true

# 5. Aumentar timeout
TSA_TIMEOUT=60000
```

### Problema: "Certificate is expired"

**Causa**: Certificado expirado

**Solución**:
```bash
# 1. Verificar fecha
openssl pkcs12 -in cert.p12 -password pass:password | openssl x509 -noout -dates

# 2. Renovar certificado
# Contactar con autoridad certificadora

# 3. Deshabilitar validación (solo desarrollo)
VALIDATE_CERTIFICATE=false
```

### Problema: "Signature validation failed"

**Causa**: Firma no coincide

**Solución**:
```typescript
// 1. Verificar clave privada coincide con certificado
const verification = signer.verify(signedXml);
console.log(verification.errors);

// 2. Regenerar certificado
// 3. Verificar XML no fue alterado después de firmar
```

---

## 📚 Referencias

### Estándares

- [XMLDSig W3C](https://www.w3.org/TR/xmldsig-core/)
- [XAdES ETSI](https://www.etsi.org/deliver/etsi_en/319100_319199/31903/01.03.02_60/en_319903v010302p.pdf)
- [RFC 3161 Timestamps](https://tools.ietf.org/html/rfc3161)
- [AEAT FACe](https://www.face.gob.es/)

### Librerías

- [xml-crypto](https://github.com/yaronn/xml-crypto)
- [node-forge](https://github.com/digitalbazaar/forge)
- [DOMParser MDN](https://developer.mozilla.org/es/docs/Web/API/DOMParser)

### Herramientas Útiles

- [OpenSSL Manual](https://www.openssl.org/docs/manmaster/)
- [XML Validation](https://www.xmlvalidation.com/)
- [Certificate Viewer](https://www.sslshopper.com/certificate-decoder.html)
- [RFC 3161 Tester](https://www.dns.keysight.com/tools/timestamp-authority-test)

---

## 📞 Soporte

Para problemas o preguntas:

1. Consultar esta documentación
2. Revisar tests en `__tests__/`
3. Contactar equipo de desarrollo
4. Crear issue en GitHub

---

**Última actualización**: Enero 2024
**Versión**: 1.0.0
**Autores**: Equipo de Facturación
