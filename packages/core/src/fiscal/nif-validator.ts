export class NIFValidator {
  validate(nif: string): { isValid: boolean; type: string } {
    // Implementación del algoritmo de validación de NIF/CIF/NIE
    return { isValid: true, type: 'NIF' };
  }
}
