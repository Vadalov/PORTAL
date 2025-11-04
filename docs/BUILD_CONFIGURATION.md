# Build Configuration Guide

This document describes the production build configuration and optimization settings.

## Build Configuration

### Next.js Configuration

The build is configured in `next.config.ts` with the following optimizations:

#### Production Optimizations

- **Standalone Output**: Configured for containerized deployments
- **Image Optimization**: WebP and AVIF formats enabled
- **Compression**: Enabled for all responses
- **Console Removal**: `console.log` removed in production (keeps `console.error` and `console.warn`)
- **Security Headers**: Comprehensive security headers configured

#### Code Splitting

- Vendor chunks separated
- Radix UI components in separate chunk
- Lucide icons in separate chunk
- Automatic code splitting for routes

#### Performance Features

- Package imports optimized for `lucide-react` and `@radix-ui/react-icons`
- CSS optimization enabled
- System TLS certificates for Google Fonts

## Build Commands

### Production Build

```bash
npm run build
```

This command:
- Runs TypeScript type checking
- Compiles Next.js application
- Optimizes bundles
- Generates static pages
- Creates standalone output

### Build Analysis

```bash
ANALYZE=true npm run build
```

This generates a bundle analysis report showing:
- Bundle sizes
- Code splitting effectiveness
- Largest dependencies
- Optimization opportunities

### Local Production Test

```bash
npm run build && npm run start
```

Test the production build locally before deploying.

## Build Output

### Directory Structure

```
.next/
├── standalone/          # Standalone build for containers
├── static/             # Static assets
└── server/             # Server-side code
```

### Standalone Mode

The `output: 'standalone'` configuration creates a minimal production build:
- Only includes necessary dependencies
- Smaller Docker images
- Faster deployments

## Bundle Optimization

### Automatic Optimizations

1. **Tree Shaking**: Unused code removed
2. **Minification**: Code and CSS minified
3. **Dead Code Elimination**: Unreachable code removed
4. **Module Concatenation**: Related modules combined

### Manual Optimizations

#### Image Optimization

- Formats: WebP, AVIF
- Device sizes: 640, 750, 828, 1080, 1200, 1920, 2048, 3840
- Image sizes: 16, 32, 48, 64, 96, 128, 256, 384

#### Code Splitting

Configured in `next.config.ts` webpack config:
- Vendor libraries separated
- UI component libraries separated
- Route-based code splitting

## Build Verification

### Pre-Deployment Checks

1. **Type Checking**: `npm run typecheck`
2. **Linting**: `npm run lint`
3. **Tests**: `npm run test:run`
4. **Build**: `npm run build`
5. **Bundle Analysis**: `ANALYZE=true npm run build`

### Build Size Targets

- Initial JS bundle: < 200KB gzipped
- Total page size: < 500KB gzipped
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

## Troubleshooting Build Issues

### Build Failures

1. **TypeScript Errors**:
   ```bash
   npm run typecheck
   ```
   Fix all TypeScript errors before building

2. **Linting Errors**:
   ```bash
   npm run lint
   ```
   Fix or ignore linting errors

3. **Memory Issues**:
   - Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`
   - Check for memory leaks in custom webpack config

4. **Module Resolution**:
   - Check `tsconfig.json` paths
   - Verify all imports are correct
   - Check for circular dependencies

### Performance Issues

1. **Large Bundle Size**:
   - Run bundle analysis: `ANALYZE=true npm run build`
   - Identify large dependencies
   - Consider code splitting or lazy loading

2. **Slow Build Times**:
   - Check for unnecessary dependencies
   - Review webpack configuration
   - Consider build caching

## Environment-Specific Builds

### Development

- Source maps enabled
- Fast refresh enabled
- Detailed error messages
- Console logs enabled

### Production

- Source maps disabled (or uploaded to Sentry)
- Optimized bundles
- Minified code
- Console logs removed (except errors/warnings)

## Continuous Integration

### CI Build Process

1. Install dependencies: `npm ci`
2. Type check: `npm run typecheck`
3. Lint: `npm run lint`
4. Test: `npm run test:run`
5. Build: `npm run build`
6. Deploy: Platform-specific

### Build Caching

Most CI platforms cache:
- `node_modules/`
- `.next/cache/`
- Package manager cache

## Additional Resources

- Next.js Build Optimization: https://nextjs.org/docs/app/building-your-application/optimizing
- Webpack Bundle Analyzer: https://www.npmjs.com/package/webpack-bundle-analyzer

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

