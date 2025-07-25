/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración optimizada para Railway
  output: 'standalone',

  // Configuración de imágenes para Railway
  images: {
    unoptimized: false, // Railway puede manejar optimización de imágenes
  },

  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // External packages para server components
  serverExternalPackages: [],

  // Configuración de webpack personalizada
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para Railway
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
