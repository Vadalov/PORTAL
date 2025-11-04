import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const baseConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    optimizeCss: true,
    turbopackUseSystemTlsCerts: true, // Enable system TLS certificates for Google Fonts
  },

  // Turbopack configuration
  turbopack: {},

  // Exclude test-only packages from server components
  // These packages are only needed for testing, not for production builds
  serverExternalPackages: [
    'jsdom',
    'vitest',
    '@vitest/coverage-v8',
    '@testing-library/jest-dom',
    '@testing-library/react',
    '@testing-library/user-event',
  ],

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    return [
      {
        source: '/(.*)',
        headers: [
          // Basic security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevents clickjacking attacks
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevents MIME type sniffing
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Enables XSS protection (legacy browsers)
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin', // Controls referrer information
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()', // Feature policy
          },

          // HSTS - Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },

          // Cross-Origin policies
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },

          // Enhanced CSP for production
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "object-src 'none'",
              "frame-ancestors 'none'",
              // Stricter script policy - only allow self and inline
              "script-src 'self' 'unsafe-inline'",
              // Restrict eval in production
              ...(isDevelopment ? ["'unsafe-eval'"] : []),
              "style-src 'self' 'unsafe-inline'",
              // Network access control
              isDevelopment
                ? "connect-src 'self' ws: wss: http: https:" // Dev: HMR support
                : "connect-src 'self' https:", // Prod: Only HTTPS
              // Additional security directives
              "upgrade-insecure-requests",
              "block-all-mixed-content",
            ].join('; '),
          },

          // Cache control for sensitive pages
          ...(isDevelopment
            ? []
            : [
                {
                  key: 'Cache-Control',
                  value: 'no-store, max-age=0, must-revalidate',
                },
              ]),
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          // API-specific security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'same-origin', // CORS policy
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-CSRF-Token',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
          // Prevent caching of API responses
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer
    if (process.env.ANALYZE) {
      // Bundle analyzer will be handled by the wrapper
    }

    // Exclude test-only dependencies from build (additional webpack externals)
    // jsdom is only needed for tests, not for production builds
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          jsdom: 'commonjs jsdom',
          'vitest': 'commonjs vitest',
          '@vitest/coverage-v8': 'commonjs @vitest/coverage-v8',
          '@testing-library/jest-dom': 'commonjs @testing-library/jest-dom',
          '@testing-library/react': 'commonjs @testing-library/react',
          '@testing-library/user-event': 'commonjs @testing-library/user-event',
        });
      }
    }

    // Production optimizations
    if (!dev && !isServer) {
      // Enable webpack optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-ui',
              chunks: 'all',
            },
            lucide: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'lucide-icons',
              chunks: 'all',
            },
          },
        },
      };
    }

    // SVG optimization
    config.module.rules.push({
      test: /\\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Console removal in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Output optimization
  output: 'standalone',
  poweredByHeader: false,
};

const nextConfig: NextConfig = bundleAnalyzer(baseConfig);

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
