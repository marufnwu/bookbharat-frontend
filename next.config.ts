import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // <--- add this
  // App directory is stable in Next.js 13+, no need for experimental flag
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Set output file tracing root to fix multiple lockfiles warning
  outputFileTracingRoot: process.cwd(),

  // Disable static generation for all pages
  trailingSlash: false,
  distDir: '.next',

  // Move serverComponentsExternalPackages out of experimental (Next.js 15+)
  serverExternalPackages: ['@prisma/client'],

  // Allow dynamic pages for development
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
  },

  // Set environment variables for build process
  env: {
    NEXT_PUBLIC_BUILD_TIME: 'true'
  },

  // Generate unique build ID for cache busting
  // Changes on every deployment to ensure fresh content
  generateBuildId: async () => {
    // Use timestamp for unique build ID (ensures cache invalidation)
    return `build-${Date.now()}`

    // Alternative: Use git commit hash for reproducible builds
    // const { execSync } = require('child_process');
    // try {
    //   return execSync('git rev-parse --short HEAD').toString().trim();
    // } catch {
    //   return `build-${Date.now()}`;
    // }
  },

  // Enable compression
  compress: true,

  // Image configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Production Backend
      {
        protocol: 'https',
        hostname: 'v2s.bookbharat.com',
        pathname: '/**',
      },
      // Local Development
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
      // External Image Services
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
        hostname: 'picsum.photos',
        pathname: '/**',
      }
    ],
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    // Derive origin from API URL (strip path like /api/v1)
    let apiOrigin = 'http://localhost:8000';
    try {
      const url = new URL(apiUrl);
      apiOrigin = `${url.protocol}//${url.host}`;
    } catch {
      // Fallback: naive strip of trailing /api path
      apiOrigin = apiUrl.replace(/\/(api|api-v\d+).*/, '');
    }
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
            value: `<${apiOrigin}>; rel=preconnect; crossorigin`,
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

    if (isServer) {
      // Ensure chunk ids resolve without the implicit "chunks/" prefix that causes runtime require failures
      config.output = {
        ...config.output,
        chunkFilename: '[id].js',
        hotUpdateChunkFilename: '[id].hot-update.js',
      };
    }

    return config;
  },
};

export default nextConfig;
