const { nodeConfig } = require('../jest.config.base.js');

const config = {
  ...nodeConfig,
  // Configuración específica para api-facturas si es necesaria
};

module.exports = config;
