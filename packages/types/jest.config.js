const { nodeConfig } = require('../../jest.config.base.js');

const config = {
  ...nodeConfig,
  // Configuración específica para types si es necesaria
};

module.exports = config;
