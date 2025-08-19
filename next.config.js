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
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
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
    
    // Enhanced webpack optimization for bundle size reduction
    if (!dev && !isServer) {
      // Enhanced Three.js and component chunking strategy
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        minSize: 15000,
        maxSize: 200000,
        maxAsyncRequests: 30,
        maxInitialRequests: 8,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Three.js core - separate chunk for 3D engine
          threeJs: {
            test: /[\\/]node_modules[\\/](three)[\\/]/,
            name: 'three-js-core',
            chunks: 'async', // Only for dynamic imports
            priority: 50,
            enforce: true,
            maxSize: 150000,
          },
          // Three.js examples (loaders, controls) - separate smaller chunk
          threeJsExamples: {
            test: /[\\/]node_modules[\\/]three[\\/]examples[\\/]/,
            name: 'three-js-examples',
            chunks: 'async',
            priority: 49,
            enforce: true,
            maxSize: 100000,
          },
          // React Three Fiber - if used
          reactThree: {
            test: /[\\/]node_modules[\\/]@react-three[\\/]/,
            name: 'react-three-fiber',
            chunks: 'async',
            priority: 48,
            enforce: true,
            maxSize: 80000,
          },
          // Critical UI components - load immediately
          criticalUI: {
            test: /[\\/]src[\\/]components[\\/](foundation|ui)[\\/]/,
            name: 'critical-ui',
            chunks: 'initial',
            priority: 45,
            enforce: true,
            maxSize: 50000,
          },
          // Large UI libraries - defer loading
          ui: {
            test: /[\\/]node_modules[\\/](framer-motion|lucide-react)[\\/]/,
            name: 'ui-libs',
            chunks: 'async',
            priority: 35,
            minChunks: 1,
            maxSize: 120000,
          },
          // Vendor libraries - core functionality
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'initial',
            priority: 30,
            minChunks: 2,
            maxSize: 180000,
          },
          // Common app code
          common: {
            name: 'common',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
            maxSize: 100000,
            chunks: 'initial'
          },
          // Default optimization for other node_modules
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            maxSize: 150000
          },
        },
      }

      // Tree shaking optimization for Three.js
      config.resolve.alias = {
        ...config.resolve.alias,
        'three/examples/jsm/loaders/GLTFLoader': 'three/examples/jsm/loaders/GLTFLoader.js',
        'three/examples/jsm/controls/OrbitControls': 'three/examples/jsm/controls/OrbitControls.js',
      }
      
      // Additional performance optimizations
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
      config.optimization.moduleIds = 'deterministic'
      config.optimization.chunkIds = 'deterministic'
    }
    
    return config
  },
}

module.exports = nextConfig