import { config } from 'dotenv';

// Cargar variables de entorno para pruebas
config({ path: '.env.test' });

// Mock para axios
jest.mock('axios', () => {
  return {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ 
      data: { 
        id: 'payment-id', 
        state: 'created' 
      } 
    }),
  };
});

// Limpiar mocks antes de cada prueba
beforeEach(() => {
  jest.clearAllMocks();
});
