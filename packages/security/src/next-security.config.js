/**
 * 🌐 CONFIGURACIÓN DE NEXT.JS PARA SEGURIDAD
 *
 * Headers de seguridad y configuración de CORS para Next.js
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Headers de seguridad globales
  async headers() {
    return [
      {
        // Aplicar headers a todas las rutas
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=()',
          },
          // HSTS solo en producción
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://api.facturacion-autonomos.com https://fal.run https://api.openai.com http: ws: wss:",
              "frame-src 'none'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "media-src 'self'",
              "manifest-src 'self'",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
      {
        // Headers específicos para API routes
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-API-Version',
            value: '1.0.0',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },

  // Configuración adicional de seguridad
  experimental: {
    serverComponentsExternalPackages: ['helmet'],
  },

  // Configuración de webpack para seguridad
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Evitar exponer variables sensibles en el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
