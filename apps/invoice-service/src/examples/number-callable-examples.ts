// Ejemplo de uso de números llamables
// Este archivo demuestra cómo usar las signaturas de llamada al tipo Number

import '../types/number-callable';

// Ejemplos de uso básico
console.log('=== Ejemplos de Números Llamables ===');

// 1. Uso básico de números
const numero = 42;
console.log('Número básico:', numero);
console.log('Valor del número:', numero.valueOf());

// 2. Convertir a callable
const callableNumero = numero.toCallable();
console.log('Número callable:', callableNumero);
console.log('Llamar al número:', callableNumero());

// 3. Usar invoke
console.log('Usar invoke:', numero.invoke());
console.log('Usar invoke con argumentos:', numero.invoke('arg1', 'arg2'));

// 4. Crear número callable estáticamente
const numeroCallable = Number.callable(100);
console.log('Número callable estático:', numeroCallable);
console.log('Valor del callable:', numeroCallable.valueOf());

// 5. Convertir de callable a número
const funcionCallable = () => 77;
const numeroDesdeCallable = Number.fromCallable(funcionCallable);
console.log('Número desde callable:', numeroDesdeCallable);

// 6. Uso en operaciones aritméticas
const a = 10;
const b = 20;
const resultado = a + b;
console.log('Operación aritmética:', resultado);
console.log('Resultado como callable:', resultado.invoke());

// 7. Ejemplo avanzado: números como funciones de transformación
function crearMultiplicador(factor: number) {
  return Number.callable(factor);
}

const multiplicadorPor2 = crearMultiplicador(2);
const multiplicadorPor3 = crearMultiplicador(3);

console.log('Multiplicador por 2:', multiplicadorPor2.valueOf());
console.log('Multiplicador por 3:', multiplicadorPor3.valueOf());

// 8. Uso de propiedad json para serialización
console.log('\n=== Propiedad JSON ===');

const numeroParaJson = 42;
console.log('Número original:', numeroParaJson);
console.log('JSON stringify:', numeroParaJson.json.stringify());
console.log('JSON toObject:', numeroParaJson.json.toObject());

const objetoJson = { value: 99, type: 'number' };
const numeroDesdeObjeto = numeroParaJson.json.fromObject(objetoJson);
console.log('Número desde objeto:', numeroDesdeObjeto);

// 9. Demostración de signaturas tipadas
console.log('\n=== Demostración de Signaturas Tipadas ===');

const numeroTipado: number = 42;

// Signaturas de métodos de instancia
const callableTipadoDemo: (...args: any[]) => number =
  numeroTipado.toCallable();
const valorInvocadoDemo: number = numeroTipado.invoke();
const valorJSONDemo: number = numeroTipado.toJSON();

// Signaturas de propiedad json
const jsonStringDemo: string = numeroTipado.json.stringify();
const numeroParseadoDemo: number = numeroTipado.json.parse();
const objetoTipadoDemo: { value: number; type: 'number' } =
  numeroTipado.json.toObject();
const numeroDesdeObjetoDemo: number = numeroTipado.json.fromObject({
  value: 99,
  type: 'number',
});

// Signaturas de métodos estáticos
const numeroCallableTipadoDemo: Number & ((...args: any[]) => number) =
  Number.callable(77);
const numeroDesdeCallableDemo: number = Number.fromCallable(() => 88);

console.log('Tipos verificados correctamente:', {
  callableTipadoDemo: typeof callableTipadoDemo,
  valorInvocadoDemo,
  valorJSONDemo,
  jsonStringDemo,
  numeroParseadoDemo,
  objetoTipadoDemo,
  numeroDesdeObjetoDemo,
  numeroCallableTipadoDemo: typeof numeroCallableTipadoDemo,
  numeroDesdeCallableDemo,
});

// 10. Demostración de uso correcto de propiedad json
console.log('\n=== Uso Correcto de Propiedad JSON ===');

const numeroDemo: number = 123;

// ✅ FORMA CORRECTA: Acceder a json como propiedad de objeto
const jsonHandler = numeroDemo.json;
console.log('Tipo de json:', typeof jsonHandler); // 'object'
console.log('Es función?:', jsonHandler instanceof Function); // false

// ✅ Usar métodos del objeto json
console.log('Stringify:', jsonHandler.stringify()); // '123'
console.log('Parse:', jsonHandler.parse()); // 123
console.log('To Object:', jsonHandler.toObject()); // {value: 123, type: 'number'}

// ❌ FORMA INCORRECTA (causaría error TS2349):
// numeroDemo.json(); // Error: no tiene signaturas de llamada

// ✅ FORMA CORRECTA para llamar métodos:
console.log('Método stringify:', numeroDemo.json.stringify());
console.log('Método toObject:', numeroDemo.json.toObject());

export {
  callableNumero,
  callableTipadoDemo,
  jsonHandler,
  jsonStringDemo,
  numero,
  numeroCallable,
  numeroCallableTipadoDemo,
  numeroDemo,
  numeroDesdeCallable,
  numeroDesdeCallableDemo,
  numeroDesdeObjeto,
  numeroDesdeObjetoDemo,
  numeroParaJson,
  numeroParseadoDemo,
  numeroTipado,
  objetoTipadoDemo,
  resultado,
  valorInvocadoDemo,
  valorJSONDemo,
};
