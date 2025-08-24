/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
    // Enable optimization for better performance
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
    turbo: {
      rules: {}
    },
    // Re-enabled safe optimizations after fixing build issues
    optimizeCss: true,
    optimizeServerReact: true,
    // React 18 Features - Phase 4 Modernization
    reactRoot: true,
    ppr: true, // Partial Prerendering for better loading states
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
          },
          // Add performance headers for 3D assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
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
    
    // Simplified webpack optimization for essential chunking only
    if (!dev && !isServer) {
      // PHASE 3: Simplified, stable chunking strategy
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Single vendor chunk for stability
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Critical UI components - separate chunk
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 40,
            enforce: true,
          },
        },
      }

      // Essential performance optimizations
      config.optimization.usedExports = true
      config.optimization.moduleIds = 'deterministic'
      config.optimization.chunkIds = 'deterministic'
    }
    
    return config
  },
}

module.exports = nextConfig