# Go-Live Checklist

Use this checklist before deploying to production to ensure everything is ready.

## Pre-Launch Checklist

### Environment & Configuration

- [ ] All environment variables set in production platform
- [ ] `NEXT_PUBLIC_CONVEX_URL` points to production Convex deployment
- [ ] `CSRF_SECRET` is set (32+ characters, cryptographically random)
- [ ] `SESSION_SECRET` is set (32+ characters, cryptographically random)
- [ ] `SENTRY_DSN` is configured (if using Sentry)
- [ ] `NODE_ENV=production` is set
- [ ] All optional variables configured (SMTP, Twilio, etc.)

### Convex Backend

- [ ] Convex functions deployed to production: `npx convex deploy --prod`
- [ ] Production Convex URL documented
- [ ] Convex dashboard shows production deployment
- [ ] All Convex functions tested in production
- [ ] Schema is up to date
- [ ] Indexes are created for frequently queried fields

### Build & Testing

- [ ] Production build successful: `npm run build`
- [ ] TypeScript type check passes: `npm run typecheck`
- [ ] ESLint check passes: `npm run lint`
- [ ] All tests passing: `npm run test:run`
- [ ] E2E tests passing: `npm run e2e`
- [ ] Pre-deployment script passes: `./scripts/pre-deploy-check.sh`
- [ ] Production build tested locally: `npm run build && npm run start`

### Security

- [ ] Security headers verified (check with securityheaders.com)
- [ ] HTTPS enabled and SSL certificate valid
- [ ] CSRF protection active
- [ ] Rate limiting configured
- [ ] Input validation working
- [ ] No secrets exposed in client-side code
- [ ] Authentication and authorization tested
- [ ] Role-based access control verified

### Monitoring & Logging

- [ ] Sentry configured and receiving errors
- [ ] Application logging configured
- [ ] Performance monitoring set up
- [ ] Uptime monitoring configured
- [ ] Alerts configured for critical issues
- [ ] Health check endpoint working: `/api/health`

### Data & Initial Setup

- [ ] Admin user created in production
- [ ] Initial settings configured
- [ ] Default parameters set up
- [ ] Test data cleaned (if needed)
- [ ] Backup strategy in place
- [ ] Data migration completed (if applicable)

### Documentation

- [ ] Deployment documentation reviewed
- [ ] Runbook accessible to team
- [ ] Environment variables documented
- [ ] Rollback procedure documented
- [ ] Emergency contacts documented

### Domain & Infrastructure

- [ ] Custom domain configured (if applicable)
- [ ] DNS records set correctly
- [ ] SSL certificate active
- [ ] HTTPS redirect working
- [ ] www/non-www redirect configured (if needed)

### Performance

- [ ] Bundle size acceptable (< 200KB initial JS)
- [ ] Page load times acceptable (< 3s)
- [ ] API response times acceptable (< 500ms)
- [ ] Image optimization working
- [ ] Caching configured
- [ ] CDN configured (if applicable)

### Final Verification

- [ ] All critical user journeys tested
- [ ] Authentication flow tested
- [ ] CRUD operations tested
- [ ] Reports generation tested
- [ ] File uploads working (if applicable)
- [ ] Email notifications working (if configured)
- [ ] SMS notifications working (if configured)

## Post-Launch Checklist

### Immediate (First Hour)

- [ ] Monitor error rates in Sentry
- [ ] Check application logs for errors
- [ ] Verify health endpoint: `/api/health`
- [ ] Test critical user flows
- [ ] Monitor performance metrics
- [ ] Check Convex dashboard for issues
- [ ] Verify all pages are accessible

### First Day

- [ ] Monitor error rates throughout the day
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Verify all features working
- [ ] Check backup completion
- [ ] Monitor resource usage
- [ ] Review security logs

### First Week

- [ ] Analyze performance trends
- [ ] Review error patterns
- [ ] Optimize based on real usage
- [ ] Verify backup procedures
- [ ] Review and update documentation
- [ ] Gather user feedback
- [ ] Plan improvements

## Rollback Readiness

Before going live, ensure:

- [ ] Previous deployment version is accessible
- [ ] Rollback procedure is documented
- [ ] Team knows how to execute rollback
- [ ] Rollback has been tested (in staging)
- [ ] Data backup is recent and verified

## Emergency Contacts

- **On-Call Engineer**: [Contact Info]
- **DevOps Team**: [Contact Info]
- **Manager**: [Contact Info]
- **Convex Support**: https://convex.dev/support
- **Platform Support**: [Platform-specific]

## Sign-Off

- [ ] **Development Team Lead**: _________________ Date: _______
- [ ] **DevOps Lead**: _________________ Date: _______
- [ ] **Security Review**: _________________ Date: _______
- [ ] **Product Owner**: _________________ Date: _______

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

