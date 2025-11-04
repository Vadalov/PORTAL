# Production Deployment Guide

This guide provides step-by-step instructions for deploying the Dernek Yönetim Sistemi to production.

## Prerequisites

- Node.js 20+ and npm 9+ installed
- Convex account and CLI installed (`npm install -g convex`)
- Access to deployment platform (Vercel, Railway, Netlify, etc.)
- Sentry account (for error monitoring)
- Domain name (optional)

## Step 1: Environment Variables Setup

### 1.1 Create Production Environment File

**Note**: Create `.env.production.example` template file (see environment variables section below) or use the following template:

1. Create `.env.production` file with the following variables:

```env
# Convex Configuration (Required)
NEXT_PUBLIC_CONVEX_URL=https://your-convex-production-url.convex.cloud

# Sentry Configuration (Required)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# Security Secrets (Required - generate with: openssl rand -base64 32)
CSRF_SECRET=generate-a-strong-random-secret-at-least-32-characters-long
SESSION_SECRET=generate-a-strong-random-secret-at-least-32-characters-long

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Dernek Yönetim Sistemi
NEXT_PUBLIC_APP_VERSION=1.0.0

# Optional: Email, SMS, Rate Limiting, File Upload Limits
# See docs/SECURITY.md for details
```

2. Fill in all required variables:
   - `NEXT_PUBLIC_CONVEX_URL` - Your production Convex deployment URL
   - `CSRF_SECRET` - Generate with: `openssl rand -base64 32`
   - `SESSION_SECRET` - Generate with: `openssl rand -base64 32`
   - `SENTRY_DSN` - Get from Sentry dashboard
   - Other optional variables as needed

### 1.2 Generate Security Secrets

Generate strong random secrets for production:

```bash
# Generate CSRF secret
openssl rand -base64 32

# Generate Session secret
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Important**: Store these secrets securely. Never commit them to version control.

## Step 2: Convex Backend Deployment

### 2.1 Deploy Convex Functions

1. Ensure you're logged into Convex:
   ```bash
   npx convex dev
   ```

2. Deploy to production:
   ```bash
   npx convex deploy --prod
   ```

   Or if using a separate production project:
   ```bash
   npx convex deploy --prod --prod-url https://your-prod-project.convex.cloud
   ```

3. Verify deployment in Convex dashboard:
   - Visit: https://dashboard.convex.dev
   - Check that all functions are deployed
   - Verify schema is up to date

### 2.2 Get Production Convex URL

1. After deployment, get your production URL from Convex dashboard
2. Update `NEXT_PUBLIC_CONVEX_URL` in your `.env.production` file
3. Format: `https://your-project-name.convex.cloud`

## Step 3: Pre-Deployment Checks

Run the pre-deployment script to verify everything is ready:

```bash
chmod +x scripts/pre-deploy-check.sh
./scripts/pre-deploy-check.sh
```

This script will:
- Check all required environment variables
- Verify Convex connection
- Run tests
- Verify build succeeds
- Check for security issues

## Step 4: Build Production Bundle

### 4.1 Test Production Build Locally

```bash
# Clean previous builds
npm run clean

# Build for production
npm run build

# Test production build locally
npm run start
```

Visit `http://localhost:3000` and verify:
- All pages load correctly
- Authentication works
- Critical features function properly
- No console errors

### 4.2 Bundle Size Analysis (Optional)

```bash
ANALYZE=true npm run build
```

This will generate a bundle analysis report showing:
- Bundle sizes
- Code splitting effectiveness
- Opportunities for optimization

## Step 5: Platform-Specific Deployment

### 5.1 Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.production`

5. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 5.2 Railway Deployment

1. Connect your GitHub repository to Railway
2. Add `nixpacks.toml` configuration (already included)
3. Set environment variables in Railway dashboard
4. Deploy automatically on push to main branch

### 5.3 Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Set environment variables in Netlify dashboard
4. Deploy

### 5.4 Self-Hosted (Docker)

1. Build Docker image:
   ```bash
   docker build -t dernek-app .
   ```

2. Run container:
   ```bash
   docker run -p 3000:3000 --env-file .env.production dernek-app
   ```

## Step 6: Post-Deployment Verification

After deployment, run the post-deployment verification script:

```bash
chmod +x scripts/post-deploy-check.sh
./scripts/post-deploy-check.sh https://your-production-url.com
```

This will verify:
- Health check endpoint
- Database connectivity
- Authentication
- Critical API endpoints

## Step 7: Initial Data Setup

### 7.1 Create Admin User

1. Access your production deployment
2. Use the registration flow or create manually via Convex dashboard
3. Set user role to `SUPER_ADMIN` or `ADMIN`

### 7.2 Configure Initial Settings

1. Login as admin
2. Navigate to Settings page
3. Configure organization details
4. Set up default parameters

## Step 8: Monitoring Setup

### 8.1 Sentry Configuration

1. Verify Sentry is receiving errors:
   - Visit Sentry dashboard
   - Check that errors are being reported
   - Configure alerts for critical errors

2. Set up release tracking:
   - Sentry automatically tracks releases when configured
   - Verify source maps are uploaded

### 8.2 Application Logging

- Verify logs are being collected (platform-specific)
- Set up log aggregation
- Configure alerts for critical issues

### 8.3 Performance Monitoring

- Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- Monitor response times
- Track Web Vitals

## Step 9: Domain & SSL Configuration

### 9.1 Custom Domain Setup

1. Add custom domain in your deployment platform
2. Configure DNS records:
   - A record or CNAME pointing to your deployment
   - Wait for DNS propagation (may take up to 48 hours)

3. SSL Certificate:
   - Most platforms provide automatic SSL (Let's Encrypt)
   - Verify HTTPS is working

### 9.2 Redirects

Configure redirects in your platform:
- www to non-www (or vice versa)
- HTTP to HTTPS
- Old routes to new routes (if applicable)

## Step 10: Go-Live Checklist

Before going live, verify:

- [ ] All environment variables set correctly
- [ ] Convex deployed to production
- [ ] Production build successful
- [ ] All tests passing
- [ ] Security headers verified
- [ ] Sentry configured and working
- [ ] Monitoring configured
- [ ] Health check endpoint working
- [ ] Authentication tested
- [ ] Critical features tested
- [ ] Admin user created
- [ ] SSL certificate active
- [ ] Domain configured correctly
- [ ] Backup strategy in place
- [ ] Rollback plan documented

## Rollback Procedure

If deployment fails:

1. **Immediate Rollback**:
   - Revert to previous deployment in your platform
   - Most platforms allow instant rollback via dashboard

2. **Manual Rollback**:
   ```bash
   # Revert to previous git commit
   git revert HEAD
   git push origin main
   ```

3. **Database Rollback**:
   - If Convex schema changes caused issues, revert in Convex dashboard
   - Restore from backup if data corruption occurred

## Troubleshooting

### Build Failures

- Check environment variables are set correctly
- Verify Node.js version (20+)
- Check for TypeScript errors: `npm run typecheck`
- Check for linting errors: `npm run lint`

### Runtime Errors

- Check Sentry for error reports
- Review application logs
- Verify Convex connection
- Check environment variables

### Performance Issues

- Run bundle analysis: `npm run analyze`
- Check database query performance
- Verify CDN configuration
- Monitor server resources

## Support

For deployment issues:
1. Check this guide
2. Review platform-specific documentation
3. Check Sentry for error reports
4. Review application logs
5. Contact support team

## Maintenance

### Regular Updates

1. Keep dependencies updated:
   ```bash
   npm outdated
   npm update
   ```

2. Test updates in staging first
3. Deploy updates during low-traffic periods
4. Monitor after deployment

### Backup Strategy

- Convex automatically backs up data
- Export data regularly if needed
- Keep deployment artifacts for rollback

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

