const { nodeConfig } = require('../jest.config.base');

const config = {
  ...nodeConfig,
  // Configuración específica para invoice-service si es necesaria
};

module.exports = config;
