const nextJest = require('next/jest');
const { nextConfig } = require('../jest.config.base.js');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  ...nextConfig,
  // Configuración específica adicional para web si es necesaria
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
