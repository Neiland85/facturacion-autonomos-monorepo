/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración optimizada para Netlify
  output: 'standalone',

  // Configuración de imágenes para Netlify
  images: {
    unoptimized: true, // Netlify maneja la optimización de imágenes
  },

  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // External packages para server components
  serverExternalPackages: [],

  // Configuración de webpack personalizada
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para Netlify
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
