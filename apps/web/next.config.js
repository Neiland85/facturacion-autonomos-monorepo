/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@facturacion/ui', '@facturacion/core'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/facturas/:path*',
        destination: 'http://localhost:3001/api/facturas/:path*',
      },
      {
        source: '/api/tax/:path*',
        destination: 'http://localhost:3002/api/tax/:path*',
      },
    ];
  },
};

export default nextConfig;
