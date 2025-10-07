import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // <--- add this
  // App directory is stable in Next.js 13+, no need for experimental flag
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Enable compression
  compress: true,

  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      }
    ],
  },

  // Development optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'lucide-react'
    ],
    // Enable client-side router cache for back/forward navigation
    staleTimes: {
      dynamic: 30, // Cache dynamic pages for 30 seconds
      static: 180, // Cache static pages for 3 minutes
    },
  },

  // Ignore ESLint warnings during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Link',
            value: '<http://localhost:8000>; rel=preconnect; crossorigin',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Faster development builds
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      // Split chunks for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Create separate chunks for heavy dependencies
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|lucide-react)[\\/]/,
              priority: 20,
            },
            forms: {
              name: 'forms',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              priority: 20,
            },
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
