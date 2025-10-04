/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración optimizada para Vercel
  output: 'standalone',
  trailingSlash: false,

  // Configuración de imágenes optimizada para Vercel
  images: {
    domains: ['localhost'],
    unoptimized: false, // Vercel optimiza automáticamente
  },

  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // External packages para server components
  serverExternalPackages: [],

  // Configuración de webpack personalizada
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para Vercel
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './src'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
