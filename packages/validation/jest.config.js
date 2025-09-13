const { nodeConfig } = require('../../jest.config.base.js');

const config = {
  ...nodeConfig,
  // Configuración específica para validation si es necesaria
};

module.exports = config;
