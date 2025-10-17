import { esmConfig } from "../../jest.config.base";

export default {
  ...esmConfig,
  // Configuración específica para auth-service
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
