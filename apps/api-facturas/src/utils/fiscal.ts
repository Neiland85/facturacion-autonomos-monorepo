/**
 * Validar NIF/CIF español
 * @param nif NIF o CIF a validar
 * @returns true si es válido, false si no
 */
export function validarNIF(nif: string): boolean {
  if (!nif || typeof nif !== "string") {
    return false;
  }

  // Limpiar el NIF
  const nifLimpio = nif.trim().toUpperCase();

  // Validar NIF (8 dígitos + 1 letra)
  const dniRegex = /^\d{8}[A-Z]$/;
  if (dniRegex.test(nifLimpio)) {
    return validarNIFPersona(nifLimpio);
  }

  // Validar CIF (1 letra + 7 dígitos + 1 dígito/letra)
  const cifRegex = /^[A-Z]\d{7}[A-Z0-9]$/;
  if (cifRegex.test(nifLimpio)) {
    return validarCIF(nifLimpio);
  }

  return false;
}

/**
 * Validar NIF de persona física
 */
function validarNIFPersona(nif: string): boolean {
  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  const numero = parseInt(nif.substring(0, 8), 10);
  const letra = nif.charAt(8);

  return letras.charAt(numero % 23) === letra;
}

/**
 * Validar CIF de persona jurídica
 */
function validarCIF(cif: string): boolean {
  const codigoOrganizacion = cif.charAt(0);
  const numero = cif.substring(1, 8);
  const control = cif.charAt(8);

  // Códigos de organización válidos
  const codigosValidos = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "N",
    "P",
    "Q",
    "R",
    "S",
    "U",
    "V",
    "W",
  ];

  if (!codigosValidos.includes(codigoOrganizacion)) {
    return false;
  }

  // Calcular dígito de control
  let suma = 0;

  for (let i = 0; i < 7; i++) {
    const digito = parseInt(numero.charAt(i), 10);

    if (i % 2 === 0) {
      // Posiciones pares: multiplicar por 2
      const multiplicacion = digito * 2;
      suma += multiplicacion > 9 ? multiplicacion - 9 : multiplicacion;
    } else {
      // Posiciones impares: sumar directamente
      suma += digito;
    }
  }

  const unidad = suma % 10;
  const digitoControl = unidad === 0 ? 0 : 10 - unidad;

  // Algunos CIF usan letra en lugar de dígito
  const letrasControl = "JABCDEFGHI";
  const letraControl = letrasControl.charAt(digitoControl);

  return control === digitoControl.toString() || control === letraControl;
}

/**
 * Tipos de IVA válidos en España
 */
export const TIPOS_IVA = {
  EXENTO: 0,
  SUPERREDUCIDO: 4,
  REDUCIDO: 10,
  GENERAL: 21,
} as const;

/**
 * Tipos de IRPF válidos
 */
export const TIPOS_IRPF = {
  EXENTO: 0,
  PROFESIONAL: 15,
  ACTIVIDAD_ECONOMICA: 1,
} as const;

/**
 * Validar porcentaje de IVA
 */
export function validarTipoIVA(tipo: number): tipo is 0 | 4 | 10 | 21 {
  return Object.values(TIPOS_IVA).includes(tipo as 0 | 4 | 10 | 21);
}

/**
 * Validar porcentaje de IRPF
 */
export function validarTipoIRPF(tipo: number): boolean {
  return tipo >= 0 && tipo <= 47; // Rango válido de IRPF
}

/**
 * Formatear número como moneda
 */
export function formatearMoneda(cantidad: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cantidad);
}

/**
 * Formatear fecha para mostrar
 */
export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

/**
 * Calcular fecha de vencimiento (30 días por defecto)
 */
export function calcularFechaVencimiento(
  fechaEmision: Date,
  dias: number = 30
): Date {
  const fechaVencimiento = new Date(fechaEmision);
  fechaVencimiento.setDate(fechaVencimiento.getDate() + dias);
  return fechaVencimiento;
}
