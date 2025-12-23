/** @type {import('next').NextConfig} */
const resolvedNextAuthUrl =
  process.env.NEXTAUTH_URL ||
  process.env.AUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

const nextConfig = {
  env: {
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? '1',
    NEXTAUTH_URL: resolvedNextAuthUrl,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.glowglitch.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Enable optimization for better performance
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
    turbo: {
      rules: {}
    },
    // Simplified optimizations for stability
    optimizeCss: true,
    optimizeServerReact: true,
    // Removed deprecated reactRoot option
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=*, gyroscope=*, magnetometer=*, camera=*, microphone=*'
          }
        ]
      },
      {
        source: '/images/products/3d-sequences/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Vary',
            value: 'Accept'
          }
        ]
      },
      {
        source: '/public/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  webpack: (config, { dev, isServer }) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]

    // Minimal webpack config for stability
    if (!dev && !isServer) {
      // Use Next.js default chunking strategy for stability
      config.optimization.moduleIds = 'deterministic'
      config.optimization.chunkIds = 'deterministic'
    }

    return config
  },
}

module.exports = nextConfig
