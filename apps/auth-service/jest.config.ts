const { esmConfig } = require('../jest.config.base');

const jestConfig = {
  ...esmConfig,
  // Configuración específica para auth-service si es necesaria
};

module.exports = jestConfig;
