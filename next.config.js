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
      // Simplified chunking strategy focused on stability
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Three.js async chunk for 3D components
          threeJs: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three-js',
            chunks: 'async',
            priority: 40,
            enforce: true,
          },
          // Critical UI components
          criticalUI: {
            test: /[\\/]src[\\/]components[\\/](foundation|ui)[\\/]/,
            name: 'critical-ui',
            chunks: 'initial',
            priority: 30,
          },
          // Vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'initial',
            priority: 20,
            minChunks: 2,
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