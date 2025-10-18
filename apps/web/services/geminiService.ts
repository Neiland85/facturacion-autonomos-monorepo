// FIX: Provided full content for geminiService.ts to resolve module not found errors.
import { GoogleGenAI, Type } from '@google/genai';
// FIX: Corrected import path for `types.ts` to be relative.
import { Grant, GrantSearchParams, IdVerificationData, QuarterlySummaryPayload, ExplainerPayload, Invoice, InvoiceSuggestion, VoiceInvoiceData } from '../types';

// FIX: Initialize GoogleGenAI client according to guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Define the schema for invoice data extraction
const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    invoiceNumber: { type: Type.STRING, description: 'Número de factura' },
    issueDate: { type: Type.STRING, description: 'Fecha de emisión en formato DD/MM/AAAA' },
    dueDate: { type: Type.STRING, description: 'Fecha de vencimiento en formato DD/MM/AAAA' },
    clientName: { type: Type.STRING, description: 'Nombre del cliente' },
    baseAmount: { type: Type.NUMBER, description: 'Importe base sin impuestos' },
    taxRate: { type: Type.NUMBER, description: 'Porcentaje de IVA aplicado' },
  },
};

export const processInvoiceImage = async (base64Image: string, mimeType: string): Promise<any> => {
  // Simulate potential failures for a better UX demo
  const random = Math.random();
  if (random < 0.15) { // 15% chance of a simulated "blurry image" error
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate processing time
    return { error: "La imagen es demasiado borrosa. Por favor, sube una foto más nítida." };
  }
  if (random < 0.3) { // 15% chance of a simulated "not an invoice" error
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate processing time
    return { error: "El documento no parece ser una factura. Asegúrate de que los campos clave son visibles." };
  }

  try {
    // FIX: Use ai.models.generateContent with appropriate model and config for JSON output.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: 'Extrae la siguiente información de esta factura: número de factura, fecha de emisión, fecha de vencimiento, nombre del cliente, importe base (sin impuestos) y el porcentaje de IVA. Devuelve solo el JSON.',
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: invoiceSchema,
      },
    });

    // FIX: Extract text directly from the response object.
    const text = response.text.trim();
    if (!text) {
        return { error: "No se pudo extraer información. La imagen podría no ser clara o no ser una factura." };
    }
    return JSON.parse(text);
  } catch (e) {
    console.error('Error processing invoice image:', e);
    return { error: 'Error al comunicarse con el servicio de IA. Por favor, inténtelo de nuevo.' };
  }
};

const grantsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            entity: { type: Type.STRING, description: 'Organismo que concede la subvención (ej. Gobierno de España, Generalitat de Catalunya).' },
            name: { type: Type.STRING, description: 'Nombre oficial de la subvención.' },
            description: { type: Type.STRING, description: 'Breve descripción de la subvención.' },
            requirements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista de los 2 o 3 requisitos más importantes.'
            },
            applicationLink: { type: Type.STRING, description: 'URL directa a la página de información o solicitud.' },
        },
        required: ['entity', 'name', 'description', 'requirements', 'applicationLink'],
    },
};

export const findGrants = async (params: GrantSearchParams): Promise<Grant[]> => {
    let scopeInstruction = 'activas, incluyendo tanto las de España como las de la Unión Europea,';
    if (params.scope === 'España') {
        scopeInstruction = 'activas en España';
    } else if (params.scope === 'Unión Europea') {
        scopeInstruction = 'activas en la Unión Europea';
    }

    const prompt = `
        Busca subvenciones y ayudas públicas ${scopeInstruction} para el perfil siguiente.
        - Tipo de entidad: ${params.type}
        - Sector de actividad: ${params.sector}
        ${(params.scope === 'España' || params.scope === 'Ambos') && params.region !== 'Todas' ? `- Comunidad Autónoma: ${params.region}` : ''}
        - Tipo de ayuda buscada: ${params.grantType}

        Devuelve una lista de 2-3 subvenciones relevantes. Si no encuentras ninguna, devuelve una lista vacía.
        Para cada subvención, proporciona el organismo que la concede, el nombre, una breve descripción, 2-3 requisitos clave y el enlace para solicitarla.
        El resultado debe ser un JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: grantsSchema,
            },
        });

        const jsonStr = response.text.trim();
        if (!jsonStr) {
          return [];
        }
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('Error finding grants:', e);
        throw new Error('Error al buscar subvenciones con IA.');
    }
};

const idVerificationSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING, description: 'Nombre y apellidos completos tal como aparecen en el documento.' },
        documentNumber: { type: Type.STRING, description: 'Número de DNI/NIE.' },
        birthDate: { type: Type.STRING, description: 'Fecha de nacimiento en formato DD/MM/AAAA.' },
    },
    required: ['fullName', 'documentNumber', 'birthDate'],
};


export const verifyIdentity = async (idFrontBase64: string, idBackBase64: string, selfieBase64: string): Promise<IdVerificationData> => {
    const prompt = `
        Realiza una verificación de identidad. Compara el selfie con las fotos del DNI.
        Extrae el nombre completo, el número de documento y la fecha de nacimiento del DNI.
        Si la persona en el selfie no parece ser la misma que la del DNI, o si los documentos no son legibles, devuelve un error.
        Responde únicamente con el JSON de los datos extraídos.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: idFrontBase64.split(',')[1] } },
                    { inlineData: { mimeType: 'image/jpeg', data: idBackBase64.split(',')[1] } },
                    { inlineData: { mimeType: 'image/jpeg', data: selfieBase64.split(',')[1] } },
                    { text: prompt },
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: idVerificationSchema,
            }
        });

        const jsonStr = response.text.trim();
        if (!jsonStr) {
             throw new Error("No se pudo extraer la información del documento. Asegúrate de que las imágenes son claras.");
        }
        return JSON.parse(jsonStr);

    } catch (e) {
        console.error('Error verifying identity:', e);
        throw new Error('El proceso de verificación de IA ha fallado. Por favor, inténtalo de nuevo con imágenes más nítidas.');
    }
};

export const getQuarterlySummary = async (): Promise<QuarterlySummaryPayload> => {
  console.log("Simulating AI quarterly summary generation...");
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network and generation delay
  return {
    summaryText: "Este trimestre has facturado 12.350 €, con unos gastos deducibles de 3.200 €. El IVA a ingresar sería de 1.785 €. Tu rentabilidad ha aumentado un 12% respecto al trimestre anterior.",
    trend: "+12%",
    nextPayments: ["IVA (Modelo 303): 1.785 € antes del 20/10/2024"]
  };
};

export const getAccountingExplanation = async (concept: string): Promise<ExplainerPayload> => {
    console.log(`Simulating AI explanation generation for: ${concept}`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
        concept: "Modelo 303",
        explanation: "El Modelo 303 es el formulario trimestral de autoliquidación del IVA. Los autónomos y empresas lo utilizan para declarar a Hacienda el IVA que han cobrado a sus clientes (IVA repercutido) y el que han pagado a sus proveedores (IVA soportado). La diferencia entre ambos es el resultado a ingresar o a devolver.",
        links: [
            { title: "Agencia Tributaria - Modelo 303", url: "https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G220.shtml" },
            { title: "Más información en nuestro blog", url: "#" }
        ]
    };
};

const invoiceSuggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            clientName: { type: Type.STRING, description: 'Nombre del cliente (debe ser el mismo que en la factura base).' },
            description: { type: Type.STRING, description: 'Breve descripción del concepto de la factura (ej. "Mantenimiento web mensual", "Iguala de asesoramiento fiscal").' },
            amount: { type: Type.NUMBER, description: 'Importe base sugerido.' },
        },
        required: ['clientName', 'description', 'amount'],
    },
};

export const getInvoiceSuggestions = async (lastInvoice: Invoice): Promise<InvoiceSuggestion[]> => {
    const clientName = lastInvoice.client?.name ?? 'Cliente';
    const primaryLine = lastInvoice.lines?.[0];
    const concept = lastInvoice.notes || primaryLine?.description || 'Servicios generales';
    const amount = primaryLine ? primaryLine.price * primaryLine.quantity : lastInvoice.subtotal || lastInvoice.total;
    const categoryHint = primaryLine?.description || concept;

    const prompt = `
        Basado en la siguiente factura recién creada, genera 2 sugerencias para facturas similares que este usuario podría crear a continuación.
        Esto es útil para facturas recurrentes o para clientes habituales.
        
        Última factura:
        - Cliente: ${clientName}
        - Concepto: ${concept}
        - Importe: ${amount}
        - Categoría: ${categoryHint}

        Sugerencias a generar:
        - Si el concepto es vago (como "Servicios profesionales"), sugiere conceptos más específicos como "Iguala de asesoramiento fiscal" o "Consultoría de marketing".
        - Si el concepto parece un proyecto (ej. "Diseño de página web"), sugiere una factura para "Mantenimiento web mensual" con un importe menor.
        - Varía ligeramente los importes, pero mantenlos realistas.
        - El nombre del cliente en las sugerencias debe ser el mismo que el de la última factura.

        Devuelve una lista de 2 sugerencias en formato JSON. Si no puedes generar sugerencias relevantes, devuelve una lista vacía.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: invoiceSuggestionSchema,
            },
        });
        const jsonStr = response.text.trim();
        if (!jsonStr) return [];
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('Error getting invoice suggestions:', e);
        throw new Error('Error al obtener sugerencias de facturas con IA.');
    }
};

const voiceInvoiceSchema = {
    type: Type.OBJECT,
    properties: {
        clientName: { type: Type.STRING, description: 'Nombre del cliente para la factura.' },
        description: { type: Type.STRING, description: 'Concepto o descripción detallada de la factura.' },
        amount: { type: Type.NUMBER, description: 'Importe base de la factura, sin impuestos.' },
        invoiceType: { 
            type: Type.STRING,
            enum: ['proforma', 'official'],
            description: 'El tipo de factura. Debe ser "proforma" o "official".' 
        },
    },
    required: ['clientName', 'description', 'amount', 'invoiceType'],
};


export const processVoiceCommand = async (transcript: string): Promise<VoiceInvoiceData> => {
    const prompt = `
        Analiza el siguiente comando de voz de un usuario y extrae la información para crear una factura.
        El usuario está en España, así que interpreta los nombres y conceptos en ese contexto.
        - Identifica el nombre del cliente.
        - Identifica el concepto o descripción del servicio.
        - Identifica el importe base (sin IVA).
        - Determina si es una 'factura proforma' o una 'factura oficial'. Si no se especifica, asume que es 'official'.

        Comando del usuario: "${transcript}"

        Devuelve la información extraída en formato JSON. Si no puedes extraer todos los datos necesarios, devuelve un objeto JSON con campos vacíos o nulos donde falte información.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: voiceInvoiceSchema,
            },
        });
        const jsonStr = response.text.trim();
        if (!jsonStr) {
             throw new Error("No he podido entender la información de la factura. Por favor, sé más específico.");
        }
        const parsed = JSON.parse(jsonStr);
        // Basic validation
        if (!parsed.clientName || !parsed.description || typeof parsed.amount !== 'number') {
            throw new Error("Faltan datos clave en tu petición. Por favor, incluye cliente, concepto e importe.");
        }
        return parsed;
    } catch (e) {
        console.error('Error processing voice command:', e);
        throw new Error(e instanceof Error ? e.message : 'Error al procesar el comando de voz con IA.');
    }
};