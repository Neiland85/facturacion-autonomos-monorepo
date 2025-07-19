/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify deployment configuration
  output: 'export',
  trailingSlash: true,
  distDir: '.next',
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
  // Remove server-side features for static export
  images: {
    unoptimized: true,
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
