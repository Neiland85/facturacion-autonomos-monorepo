import { TimestampService, createTimestampService } from '../timestamp-service';

describe('TimestampService', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('en desarrollo', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('debe permitir crear instancia en desarrollo', () => {
      expect(() => new TimestampService()).not.toThrow();
    });

    it('debe permitir usar createTimestampService en desarrollo', () => {
      expect(() => createTimestampService()).not.toThrow();
    });

    it('debe añadir timestamp simulado al XML', async () => {
      const service = new TimestampService();
      const xmlFirmado = '<ds:Signature>contenido</ds:Signature>';
      
      const resultado = await service.addTimestamp(xmlFirmado);
      
      expect(resultado).toContain('<xades:SigningTime>');
      expect(resultado).toContain('</ds:Signature>');
    });
  });

  describe('en producción', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('debe lanzar error al crear instancia en producción', () => {
      expect(() => new TimestampService()).toThrow(
        'TimestampService es solo un stub de desarrollo y no debe usarse en producción'
      );
    });

    it('debe lanzar error al usar createTimestampService en producción', () => {
      expect(() => createTimestampService()).toThrow(
        'createTimestampService no disponible en producción'
      );
    });

    it('debe lanzar error si addTimestamp es llamado en producción', async () => {
      // Crear instancia en desarrollo primero
      process.env.NODE_ENV = 'development';
      const service = new TimestampService();
      
      // Cambiar a producción
      process.env.NODE_ENV = 'production';
      
      await expect(service.addTimestamp('<xml></xml>')).rejects.toThrow(
        'addTimestamp no debe llamarse en producción'
      );
    });
  });
});