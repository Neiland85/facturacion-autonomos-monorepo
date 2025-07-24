<<<<<<< HEAD
export class NIFValidator {
  validate(nif: string): { isValid: boolean; type: string } {
    // Implementación del algoritmo de validación de NIF/CIF/NIE
    return { isValid: true, type: 'NIF' };
  }
}
=======
/**
 * @fileoverview Validador de NIF, CIF y NIE españoles
 * @version 1.0.0
 */

/**
 * Letras de control para validación de NIF
 */
const LETRAS_NIF = 'TRWAGMYFPDXBNJZSQVHLCKE';

/**
 * Letras de control para validación de CIF
 */
const LETRAS_CIF = 'JABCDEFGHI';

/**
 * Letras válidas para el primer carácter de un CIF
 */
const ORGANIZACIONES_CIF = 'ABCDEFGHJNPQRSUVW';

/**
 * Letras válidas para NIE
 */
const LETRAS_NIE = 'XYZ';

/**
 * Valida un NIF español
 * @param nif - Número de Identificación Fiscal
 * @returns true si el NIF es válido
 */
export const validarNIF = (nif: string): boolean => {
  if (!nif || typeof nif !== 'string') return false;

  const nifLimpio = nif.toUpperCase().replace(/[^0-9A-Z]/g, '');

  // Formato: 8 dígitos + 1 letra
  const regex = /^\d{8}[A-Z]$/;
  if (!regex.test(nifLimpio)) return false;

  const numero = parseInt(nifLimpio.substring(0, 8), 10);
  const letra = nifLimpio.charAt(8);
  const letraEsperada = LETRAS_NIF.charAt(numero % 23);

  return letra === letraEsperada;
};

/**
 * Valida un CIF español
 * @param cif - Código de Identificación Fiscal
 * @returns true si el CIF es válido
 */
export const validarCIF = (cif: string): boolean => {
  if (!cif || typeof cif !== 'string') return false;

  const cifLimpio = cif.toUpperCase().replace(/[^0-9A-Z]/g, '');

  // Formato: 1 letra + 7 dígitos + 1 dígito de control
  const regex = /^[A-Z]\d{7}[\dA-Z]$/;
  if (!regex.test(cifLimpio)) return false;

  const organizacion = cifLimpio.charAt(0);
  if (!ORGANIZACIONES_CIF.includes(organizacion)) return false;

  const numero = cifLimpio.substring(1, 8);
  const control = cifLimpio.charAt(8);

  // Cálculo del dígito de control
  let suma = 0;
  for (let i = 0; i < 7; i++) {
    const digito = parseInt(numero.charAt(i), 10);
    if (i % 2 === 0) {
      // Posiciones pares (1, 3, 5, 7): multiplicar por 2
      const producto = digito * 2;
      suma += producto > 9 ? producto - 9 : producto;
    } else {
      // Posiciones impares (2, 4, 6): sumar directamente
      suma += digito;
    }
  }

  const unidades = suma % 10;
  const digitoControl = unidades === 0 ? 0 : 10 - unidades;

  // Algunos CIF usan letra en lugar de número
  const organizacionesConLetra = 'NPQRSW';
  if (organizacionesConLetra.includes(organizacion)) {
    return control === LETRAS_CIF.charAt(digitoControl);
  } else {
    return control === digitoControl.toString();
  }
};

/**
 * Valida un NIE español
 * @param nie - Número de Identidad de Extranjero
 * @returns true si el NIE es válido
 */
export const validarNIE = (nie: string): boolean => {
  if (!nie || typeof nie !== 'string') return false;

  const nieLimpio = nie.toUpperCase().replace(/[^0-9A-Z]/g, '');

  // Formato: 1 letra (X, Y, Z) + 7 dígitos + 1 letra
  const regex = /^[XYZ]\d{7}[A-Z]$/;
  if (!regex.test(nieLimpio)) return false;

  const letraInicial = nieLimpio.charAt(0);
  if (!LETRAS_NIE.includes(letraInicial)) return false;

  // Convertir la letra inicial a número
  const equivalencias: { [key: string]: string } = {
    X: '0',
    Y: '1',
    Z: '2',
  };

  const numeroCompleto =
    equivalencias[letraInicial] + nieLimpio.substring(1, 8);
  const letra = nieLimpio.charAt(8);
  const numero = parseInt(numeroCompleto, 10);
  const letraEsperada = LETRAS_NIF.charAt(numero % 23);

  return letra === letraEsperada;
};

/**
 * Valida cualquier documento de identificación español (NIF, CIF, NIE)
 * @param documento - Documento a validar
 * @returns objeto con el resultado de la validación
 */
export const validarDocumento = (
  documento: string
): {
  valido: boolean;
  tipo: 'NIF' | 'CIF' | 'NIE' | 'DESCONOCIDO';
  mensaje?: string;
} => {
  if (!documento || typeof documento !== 'string') {
    return {
      valido: false,
      tipo: 'DESCONOCIDO',
      mensaje: 'Documento no válido o vacío',
    };
  }

  const docLimpio = documento.toUpperCase().replace(/[^0-9A-Z]/g, '');

  // Determinar tipo por formato
  if (/^\d{8}[A-Z]$/.test(docLimpio)) {
    return {
      valido: validarNIF(docLimpio),
      tipo: 'NIF',
      mensaje: validarNIF(docLimpio) ? 'NIF válido' : 'NIF inválido',
    };
  } else if (/^[A-Z]\d{7}[\dA-Z]$/.test(docLimpio)) {
    return {
      valido: validarCIF(docLimpio),
      tipo: 'CIF',
      mensaje: validarCIF(docLimpio) ? 'CIF válido' : 'CIF inválido',
    };
  } else if (/^[XYZ]\d{7}[A-Z]$/.test(docLimpio)) {
    return {
      valido: validarNIE(docLimpio),
      tipo: 'NIE',
      mensaje: validarNIE(docLimpio) ? 'NIE válido' : 'NIE inválido',
    };
  }

  return {
    valido: false,
    tipo: 'DESCONOCIDO',
    mensaje: 'Formato de documento no reconocido',
  };
};

/**
 * Formatea un documento agregando guiones
 * @param documento - Documento a formatear
 * @returns documento formateado
 */
export const formatearDocumento = (documento: string): string => {
  if (!documento) return '';

  const docLimpio = documento.toUpperCase().replace(/[^0-9A-Z]/g, '');

  if (/^\d{8}[A-Z]$/.test(docLimpio)) {
    // NIF: 12345678-A
    return `${docLimpio.substring(0, 8)}-${docLimpio.charAt(8)}`;
  } else if (/^[A-Z]\d{7}[\dA-Z]$/.test(docLimpio)) {
    // CIF: A-1234567-8
    return `${docLimpio.charAt(0)}-${docLimpio.substring(1, 8)}-${docLimpio.charAt(8)}`;
  } else if (/^[XYZ]\d{7}[A-Z]$/.test(docLimpio)) {
    // NIE: X-1234567-A
    return `${docLimpio.charAt(0)}-${docLimpio.substring(1, 8)}-${docLimpio.charAt(8)}`;
  }

  return docLimpio;
};

/**
 * Genera un NIF válido aleatorio (solo para testing)
 * @returns NIF válido aleatorio
 */
export const generarNIFAleatorio = (): string => {
  const numero = Math.floor(Math.random() * 100000000);
  const numeroStr = numero.toString().padStart(8, '0');
  const letra = LETRAS_NIF.charAt(numero % 23);
  return `${numeroStr}${letra}`;
};

/**
 * Obtiene el dígito de control de un NIF dado el número
 * @param numero - Número del NIF (8 dígitos)
 * @returns letra de control
 */
export const obtenerLetraNIF = (numero: number | string): string => {
  const num = typeof numero === 'string' ? parseInt(numero, 10) : numero;
  return LETRAS_NIF.charAt(num % 23);
};
>>>>>>> origin/develop
