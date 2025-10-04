const nextJest = require("next/jest");
const path = require("path");

// Importar configuración base desde el directorio raíz
const baseConfig = require(path.join(__dirname, "../../jest.config.base.js"));

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  ...baseConfig,
  // Configuración específica adicional para web si es necesaria
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
