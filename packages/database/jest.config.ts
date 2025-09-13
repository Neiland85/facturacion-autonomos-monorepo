const { nodeConfig } = require('../../jest.config.base');

const jestConfig = {
  ...nodeConfig,
  // Configuración específica para database si es necesaria
};

module.exports = jestConfig;
