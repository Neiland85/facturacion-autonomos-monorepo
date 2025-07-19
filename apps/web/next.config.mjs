/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify plugin handles deployment automatically
  trailingSlash: true,
  experimental: {
    typedRoutes: true,
  },
  serverExternalPackages: ['@prisma/client'],
  transpilePackages: [
    '@facturacion/core',
    '@facturacion/services',
    '@facturacion/ui',
  ],
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002',
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
