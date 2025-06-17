import Ajv from 'ajv';
import * as fs from 'fs';

const ajv = new Ajv();

export const validateFacturae = (xml: string, schemaPath: string) => {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);
  const valid = validate(xml);

  if (!valid) {
    console.error('Errores de validación:', validate.errors);
    throw new Error('El documento Facturae no es válido.');
  }

  return true;
};

export const validateUBL = (ublDocument: string, schemaPath: string) => {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);
  const valid = validate(ublDocument);

  if (!valid) {
    console.error('Errores de validación:', validate.errors);
    throw new Error('El documento UBL no es válido.');
  }

  return true;
};
