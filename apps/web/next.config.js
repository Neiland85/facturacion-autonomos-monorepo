/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@facturacion/ui', '@facturacion/core'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Configuración para Docker
  output: 'standalone',
  // Configuración para producción
  poweredByHeader: false,
  compress: true,
  // Configuración de imágenes
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/facturas/:path*',
        destination: process.env.API_FACTURAS_URL ? `${process.env.API_FACTURAS_URL}/api/facturas/:path*` : 'http://localhost:3001/api/facturas/:path*',
      },
      {
        source: '/api/tax/:path*',
        destination: process.env.API_TAX_CALCULATOR_URL ? `${process.env.API_TAX_CALCULATOR_URL}/api/tax/:path*` : 'http://localhost:3002/api/tax/:path*',
      },
    ];
  },
};

export default nextConfig;
