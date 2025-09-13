const { nodeConfig } = require('../../jest.config.base');

const config = {
  ...nodeConfig,
  // Configuración específica para ui si es necesaria
};

module.exports = config;
