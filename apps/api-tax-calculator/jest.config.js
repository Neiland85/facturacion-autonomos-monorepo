const { nodeConfig } = require('../jest.config.base.js');

const jestConfig = {
  ...nodeConfig,
  // Configuración específica para api-tax-calculator si es necesaria
};

module.exports = jestConfig;
